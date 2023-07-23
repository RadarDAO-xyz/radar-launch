/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import {
    Document,
    FilterQuery,
    Model,
    MongooseError,
    ProjectionType,
    QueryOptions,
    Types,
    isValidObjectId
} from 'mongoose';

// Normalizes create, read, update and delete requests and responses

type CheckAuthorizedFunc = (
    req: Request,
    res: Response
) => Promise<boolean> | boolean;

// Add TS Types to Request so they can be accessed by future handlers
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            doc?: Document<
                unknown,
                Record<string, never>,
                Record<string, any>
            > &
                Omit<
                    Record<string, any> & {
                        _id: Types.ObjectId;
                    },
                    never
                >;
            result?: Document<
                unknown,
                Record<string, never>,
                Record<string, any>
            > &
                Omit<
                    Record<string, any> & {
                        _id: Types.ObjectId;
                    },
                    never
                >;
        }
    }
}

/**
 * Fetches :id parameter with given model and assigns it to req.doc
 * @param model Mongoose Model
 * @param checkAuthorized Function to check if the authenticated user can perform this action
 * @returns Express Middleware
 */
export function prefetch(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true
) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).end();

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const doc = await model.findById(id);
        if (!doc) return res.status(404).end();

        req.doc = doc;
        next();
    };
}

/**
 * Create a new MongoDB Document using the provided Model
 * @param model Mongoose Model
 * @param checkAuthorized Function to check if the authenticated user can perform this action
 * @param doNext Call NextFunction instead of responding with created doc. Created doc is assigned to req.result
 * @returns Express Middleware
 */
export function create(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true,
    doNext = false
) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const docData = { ...req.body };

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const doc = await model.create(docData).catch((r: MongooseError) => {
            if (r.name === 'ValidationError') {
                res.status(400)
                    .json({
                        error: r.name,
                        message: r.message
                    })
                    .end();
            }
        });
        if (!doc) return;

        if (doNext) {
            req.result = doc.toJSON();
            next();
        } else {
            res.json(doc.toJSON()).end();
        }
    };
}

/**
 * Fetches the MongoDB document associated to the :id parameter \
 * If the :id and model match the prefetched document, it will be returned
 * @param model Mongoose Model
 * @param checkAuthorized Function to check if the authenticated user can perform this action
 * @returns Express Middleware
 */
export function read(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true
) {
    return async function (req: Request, res: Response) {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).end();

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const doc =
            req.doc &&
            req.doc.baseModelName === model.name &&
            req.doc._id?.toString() === id
                ? req.doc
                : await model.findById(id);

        doc ? res.json(doc.toJSON()) : res.status(404);
        res.end();
    };
}

/**
 * Returns multiple MongoDB documents that match the filter provided \
 * URL Query values `skip` and `limit` will be parsed here and provided to Mongoose
 * @param model Mongoose Model
 * @param checkAuthorized Function to check if the authenticated user can perform this action
 * @param params Returns Mongoose model options
 * @returns Express Middleware
 */
export function readMany(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true,
    params: {
        filter: (req: Request, res: Response) => FilterQuery<any>;
        projection?: (
            req: Request,
            res: Response
        ) => ProjectionType<any> | null | undefined;
        options?: (
            req: Request,
            res: Response
        ) => QueryOptions<any> | null | undefined;
    } = { filter: () => ({}) }
) {
    return async function (req: Request, res: Response) {
        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const filter = params.filter(req, res);
        const projection = params.projection?.(req, res) ?? undefined;
        const opts = params.options?.(req, res) ?? undefined;

        const docs = await model
            .find(filter, projection, opts)
            .skip(parseInt(req.query.skip?.toString() ?? '0'))
            .limit(parseInt(req.query.limit?.toString() ?? '50'));

        docs ? res.json(docs.map((doc) => doc.toJSON())) : res.status(404);
        res.end();
    };
}

/**
 * Updates the MongoDB Document associated to the :id
 * @param model Mongoose Model
 * @param checkAuthorized Function to check if the authenticated user can perform this action
 * @param checks Fields to allow or deny the modification of, this can be bypassed using req.bypass \
 * If you want to deny modification whatsoever, use the Model Schema's `immutable` property instead
 * @returns Express Middleware
 */
export function update(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true,
    checks:
        | {
              deniedFields: string[];
          }
        | {
              allowedFields: string[];
          } = { deniedFields: [] }
) {
    return async function (req: Request, res: Response) {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).end();

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const doc = req.doc || (await model.findById(id));
        if (!doc) return res.status(404).end();

        if (!req.bypass) {
            if ('deniedFields' in checks) {
                checks.deniedFields.forEach((f) => delete req.body[f]);
            } else if ('allowedFields' in checks) {
                const newobj: Record<string, any> = {};
                checks.allowedFields.forEach(
                    (f) => f in req.body && (newobj[f] = req.body[f])
                );
                req.body = newobj;
            }
        }

        const result = await doc
            .set(req.body)
            .save()
            .catch((r: MongooseError) => {
                if (r.name === 'ValidationError') {
                    res.status(400)
                        .json({
                            error: r.name,
                            message: r.message
                        })
                        .end();
                }
            });
        if (!result) return;

        res.json(doc.toJSON()).end();
    };
}

/**
 * Deletes the MongoDB document associated with this :id
 * @param model Mongoose Model
 * @param checkAuthorized Function to check if the authenticated user can perform this action
 * @returns Express Middleware
 */
export function del(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true
) {
    return async function (req: Request, res: Response) {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).end();

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const doc = req.doc || (await model.findById(id));
        if (!doc) return res.status(404).end();

        await doc.deleteOne();
        res.status(204).end();
    };
}
