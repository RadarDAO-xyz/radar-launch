import { Document, Types } from 'mongoose';
import User, { IUser } from '../models/User';
import { NextFunction, Request, Response } from 'express';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: User;
            bypass: boolean;
        }
    }
}

type User = Document<unknown, Record<string, never>, IUser> &
    Omit<
        IUser & {
            _id: Types.ObjectId;
        },
        never
    >;

export function authenticate(required = false) {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (req.user) return next();
        req.user = (await User.findById('')) ?? undefined;
        if (!req.user && required) return res.status(401).end();
        req.bypass = false;
        next();
    };
}
