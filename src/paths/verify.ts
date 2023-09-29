import { Router } from 'express';
import User from '../models/User';
import rl from '../ratelimit';
import { privyClient } from '../util/privy';

const VerifyRouter = Router();

// Path: /verify

VerifyRouter.post('/', rl('Verify', 60, 5), async (req, res) => {
    // passed from the frontend in the Authorization header
    const idToken = req.headers.authorization?.split(' ')[1];

    if (!idToken) return res.status(400).end();

    const payload = await privyClient.verifyAuthToken(idToken);

    if (payload.userId === undefined) {
        return res.status(400).json({ name: 'Verification Failed' });
    }
    const user = await privyClient.getUser(payload.userId);
    if (user === undefined) {
        return res.status(400).json({ name: 'Verification Failed' });
    }

    let existingUser = await User.findByDidOrAuth(
        user.id,
        user.wallet?.address
    );
    if (!existingUser) {
        existingUser = await User.create({
            wallets: user.linkedAccounts,
            did: user.id
        });
    } else {
        existingUser.wallets = user.linkedAccounts;
        await existingUser.save();
    }
    req.session.userId = existingUser._id.toString();
    return res.status(200).json({ name: 'Verification Successful' });
});

export default VerifyRouter;
