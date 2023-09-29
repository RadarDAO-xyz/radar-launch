import { NextFunction, Request, Response } from 'express';
import { Document, Types, isValidObjectId } from 'mongoose';
import User, { IUser } from '../models/User';
import { privyClient } from './privy';

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

declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}

/**
 * Handles authentication and adds authenticated user to req.user
 * @param required - If required and not authed, fail with error 401
 * @returns Express Middleware
 */
export function authenticate(required = false) {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (req.user) return next();
        if (req.headers.authorization) {
            const authToken = req.headers.authorization?.split(' ')[1];
            if (
                process.env.NODE_ENV === 'development' && // If it's a local dev version, and supplied bearer is an ObjectId, use fake login
                isValidObjectId(authToken)
            ) {
                req.user =
                    (await User.findOne({ _id: { $eq: authToken } })) ??
                    undefined;
            } else {
                try {
                    const payload = await privyClient.verifyAuthToken(
                        authToken
                    );

                    const user = await privyClient.getUser(payload.userId);

                    req.user =
                        (await User.findByDidOrAuth(
                            user.id,
                            user.wallet?.address
                        )) ?? undefined;
                } catch (e) {
                    return res.status(400).json({
                        message: 'JWT Verification failed',
                        provided: req.headers.authorization
                    });
                }
            }
            if (req.user) req.session.userId = req.user._id.toString();
        } else if (req.session.userId) {
            req.user = (await User.findById(req.session.userId)) ?? undefined;
        }

        if (!req.user && required) return res.status(401).end();
        req.bypass = req.user?.bypasser ?? false;
        next();
    };
}
