import { Router, urlencoded } from 'express';
import User from '../models/User';
import { randomBytes } from 'crypto';
import { SessionCookieName, SessionCookieOptions } from '../constants';

const randomHash = () => randomBytes(20).toString('hex');

const LoginRouter = Router();

LoginRouter.use(urlencoded({ extended: true }));

LoginRouter.post('/', async (req, res) => {
    const walletAddress = req.body.wallet_address;
    if (!walletAddress) return res.status(400).end();

    let user = await User.findOne({ wallet_address: walletAddress });

    if (!user) {
        user = await User.create({
            wallet_address: walletAddress,
            session_cookie: randomHash()
        });
    } else {
        user.session_cookie = randomHash();
        await user.save();
    }

    res.cookie(SessionCookieName, user.session_cookie, SessionCookieOptions);
    if (req.query.redirect_uri)
        res.redirect(
            `https://launch.radardao.xyz${
                req.query.redirect_uri?.toString() || ''
            }`
        );
    else res.end();
});

export default LoginRouter;
