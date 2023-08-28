import { Document, Types, isValidObjectId } from 'mongoose';
import User, { IUser } from '../models/User';
import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

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
 * Gets the appropriate JWK Url depending on the auth method used on the frontend
 * @param req
 * @returns
 */
function getJWKSetURL(req: Request) {
    if (req.headers['x-auth-method']) {
        switch (req.headers['x-auth-method']) {
            case 'Social':
                return new URL('https://api.openlogin.com/jwks');
            case 'Wallet':
                return new URL('https://authjs.web3auth.io/jwks');
            default:
                throw 'Unrecognized Auth Method Header';
        }
    }
    return new URL('https://authjs.web3auth.io/jwks');
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
            const idToken = req.headers.authorization?.split(' ')[1];
            if (
                process.env.NODE_ENV === 'development' && // If it's a local dev version, and supplied bearer is an ObjectId, use fake login
                isValidObjectId(idToken)
            ) {
                req.user =
                    (await User.findOne({ _id: { $eq: idToken } })) ??
                    undefined;
            } else {
                // Get the JWK set used to sign the JWT issued by Web3Auth
                let jwks;
                try {
                    jwks = await createRemoteJWKSet(getJWKSetURL(req));
                } catch (e) {
                    res.status(400).json({
                        message:
                            'Unrecognized X-Auth-Method Header. Please use one of "Social" or "Wallet"',
                        provided: req.headers['x-auth-method']
                    });
                }
                if (!jwks) return;

                // Verify the JWT using Web3Auth's JWKS
                const jwtDecoded = await jwtVerify(idToken, jwks, {
                    algorithms: ['ES256']
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const wallet = (jwtDecoded.payload as any).wallets[0];

                req.user =
                    (await User.findByAuth(
                        (wallet.address.toUpperCase() ||
                            wallet.public_key) as string
                    )) ?? undefined;
            }
            if (req.user) req.session.userId = req.user.id;
        } else if (req.session.userId) {
            req.user = (await User.findById(req.session.userId)) ?? undefined;
        }

        if (!req.user && required) return res.status(401).end();
        req.bypass = req.user?.bypasser ?? false;
        next();
    };
}
