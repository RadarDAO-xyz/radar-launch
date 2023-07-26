import { Request, Router } from 'express';
import * as jose from 'jose';

const VerifyRouter = Router();

// Path: /verify

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

VerifyRouter.post('/', async (req, res) => {
    // passed from the frontend in the Authorization header
    const idToken = req.headers.authorization?.split(' ')[1];

    if (!idToken) return res.status(400).end();

    // Get the JWK set used to sign the JWT issued by Web3Auth
    let jwks;
    try {
        jwks = jose.createRemoteJWKSet(getJWKSetURL(req));
    } catch (e) {
        res.status(400).json({
            message:
                'Unrecognized X-Auth-Method Header. Please use one of "Social" or "Wallet"',
            provided: req.headers['x-auth-method']
        });
    }
    if (!jwks) return;

    // passed from the frontend in the request body
    const toverif =
        req.headers['x-auth-method'] === 'Social'
            ? req.body.appPubKey
            : req.body.public_address;

    // Verify the JWT using Web3Auth's JWKS
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
        algorithms: ['ES256']
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wallet = (jwtDecoded.payload as any).wallets[0];
    if (wallet.public_key === toverif || wallet.address === toverif) {
        // Verified
        res.status(200).json({ name: 'Verification Successful' });
    } else {
        res.status(400).json({ name: 'Verification Failed' });
    }
});

export default VerifyRouter;
