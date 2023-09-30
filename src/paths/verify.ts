import { Router } from 'express';
import User from '../models/User';
import rl from '../ratelimit';
import { privyClient } from '../util/privy';
import { WalletWithMetadata } from '@privy-io/server-auth';

const VerifyRouter = Router();

// Path: /verify

VerifyRouter.post('/', rl('Verify', 60, 5), async (req, res) => {
    // passed from the frontend in the Authorization header
    const idToken = req.headers.authorization?.split(' ')[1];

    if (!idToken) return res.status(400).end();

    try {
        const payload = await privyClient.verifyAuthToken(idToken);

        if (payload.userId === undefined) {
            return res.status(400).json({ name: 'Verification Failed' });
        }
        const user = await privyClient.getUser(payload.userId);
        if (user === undefined) {
            return res.status(400).json({ name: 'Verification Failed' });
        }
        const wallets = user.linkedAccounts
            .filter(
                (account): account is WalletWithMetadata =>
                    account.type === 'wallet'
            )
            .map((account) => account.address);

        let existingUser = await User.findByDidOrAuth(user.id, wallets);
        if (!existingUser) {
            existingUser = await User.create({
                wallets: user.linkedAccounts,
                did: user.id
            });
        } else {
            existingUser.wallets = user.linkedAccounts;
            await existingUser.save();
        }
        req.session.userId = existingUser.id;
        return res.status(200).json({ name: 'Verification Successful' });
    } catch (e) {
        return res.status(400).json({
            message: 'JWT Verification failed',
            provided: req.headers.authorization
        });
    }
});

export default VerifyRouter;
