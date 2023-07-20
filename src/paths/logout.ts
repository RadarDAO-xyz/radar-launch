import { Router } from 'express';
import { SessionCookieName, SessionCookieOptions } from '../constants';

const LogoutRouter = Router();

LogoutRouter.get('/', async (req, res) => {
    res.clearCookie(SessionCookieName, {
        ...SessionCookieOptions
    });
    if (req.query.redirect_uri)
        res.redirect(
            `https://launch.radardao.xyz${
                req.query.redirect_uri?.toString() || ''
            }`
        );
    else res.end();
});

export default LogoutRouter;
