/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import {
    Document,
    FilterQuery,
    Model,
    ProjectionType,
    QueryOptions,
    Types,
    isValidObjectId
} from 'mongoose';

type CheckAuthorizedFunc = (
    req: Request,
    res: Response
) => Promise<boolean> | boolean;

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
        }
    }
}

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

export function create(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true
) {
    return async function (req: Request, res: Response) {
        const docData = { ...req.body };

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const isValid = await model.validate(docData).catch(() => false);
        if (!isValid) return res.status(400).end();

        const doc = await model.create(isValid);

        res.json(doc.toJSON()).end();
    };
}

export function read(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true
) {
    return async function (req: Request, res: Response) {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).end();

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const doc = req.doc || (await model.findById(id));

        doc ? res.json(doc.toJSON()) : res.status(404);
        res.end();
    };
}

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

        const docs = await model.find(filter, projection, opts);

        docs ? res.json(docs.map((doc) => doc.toJSON())) : res.status(404);
        res.end();
    };
}

export function update(
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

        await doc.set(req.body).save();

        res.json(doc.toJSON()).end();
    };
}

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
