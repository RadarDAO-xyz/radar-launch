/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { Document, Model, Types } from 'mongoose';

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

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const doc = req.doc || (await model.findById(id));

        doc ? res.json(doc.toJSON()) : res.status(404);
        res.end();
    };
}

export function update(
    model: Model<any>,
    checkAuthorized: CheckAuthorizedFunc = () => true
) {
    return async function (req: Request, res: Response) {
        const id = req.params.id;

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const authenticatedUser = '';

        const doc = await model.findById(id);
        if (!doc) return res.status(404).end();
        if (doc.founder.toString() !== authenticatedUser)
            return res.status(403).end();

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
        const authenticatedUser = '';

        if (!(await checkAuthorized(req, res)) && !req.bypass)
            return res.status(403).end();

        const doc = await model.findById(id);
        if (!doc) return res.status(404).end();
        if (doc.founder.toString() !== authenticatedUser)
            return res.status(403).end();

        await doc.deleteOne();
        res.status(204).end();
    };
}
