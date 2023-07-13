import { Router } from 'express';
import { SessionCookieName, SessionCookieOptions } from '../constants';

const LogoutRouter = Router();

LogoutRouter.get('/', async (req, res) => {
    res.clearCookie(SessionCookieName, SessionCookieOptions).end();
});

export default LogoutRouter;
