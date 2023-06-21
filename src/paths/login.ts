import { Router, urlencoded } from 'express';
import User from '../models/User';
import { randomBytes } from 'crypto';

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

    return res.cookie('session', user.session_cookie).json(user).end();
});

export default LoginRouter;
