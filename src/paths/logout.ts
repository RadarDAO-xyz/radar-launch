import { Router } from 'express';
import { SessionCookieName, SessionCookieOptions } from '../constants';

const LogoutRouter = Router();

LogoutRouter.get('/', async (req, res) => {
    res.clearCookie(SessionCookieName, SessionCookieOptions).redirect(
        `https://launch.radardao.xyz${req.query.redirect_uri?.toString() || ''}`
    );
});

export default LogoutRouter;
