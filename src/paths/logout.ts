import { Router } from 'express';
import { SessionCookieName, SessionCookieOptions } from '../constants';

const LogoutRouter = Router();

// Path: /logout

// Handles logout
// Query Param: `redirect_uri` - Redirects to specified URI after successful login
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
