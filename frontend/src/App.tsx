import {
    SafeAuthKit,
    SafeAuthSignInData,
    Web3AuthAdapter,
    Web3AuthEventListener
} from '@safe-global/auth-kit';
import {
    ADAPTER_EVENTS,
    CHAIN_NAMESPACES,
    SafeEventEmitterProvider,
    WALLET_ADAPTERS
} from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { useEffect, useState } from 'react';
import { Web3AuthOptions } from '@web3auth/modal';

const connectedHandler: Web3AuthEventListener = (data) =>
    console.log('CONNECTED', data);
const disconnectedHandler: Web3AuthEventListener = (data) =>
    console.log('DISCONNECTED', data);

function Wallet() {
    const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
        useState<SafeAuthSignInData | null>(null);
    const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthAdapter>>();
    const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
        null
    );
    useEffect(() => {
        (async () => {
            const options = {
                clientId: process.env.VITE_WEB3AUTH_CLIENT_ID || '',
                web3AuthNetwork: 'testnet',
                chainConfig: {
                    chainNamespace: CHAIN_NAMESPACES.EIP155,
                    chainId: '0x1',
                    rpcTarget: `https://mainnet.infura.io/v3/${process.env.VITE_INFURA_KEY}`
                },
                uiConfig: {
                    theme: 'dark',
                    loginMethodsOrder: ['google', 'facebook']
                }
            };

            const modalConfig = {
                [WALLET_ADAPTERS.TORUS_EVM]: {
                    label: 'torus',
                    showOnModal: false
                },
                [WALLET_ADAPTERS.METAMASK]: {
                    label: 'metamask',
                    showOnDesktop: true,
                    showOnMobile: false
                }
            };

            const openloginAdapter = new OpenloginAdapter({
                loginSettings: {
                    mfaLevel: 'mandatory'
                },
                adapterSettings: {
                    uxMode: 'popup',
                    whiteLabel: {
                        name: 'Safe'
                    }
                }
            });

            const adapter = new Web3AuthAdapter(
                options,
                [openloginAdapter],
                modalConfig
            );

            const safeAuthKit = await SafeAuthKit.init(adapter, {
                txServiceUrl: 'https://safe-transaction-goerli.safe.global'
            });

            safeAuthKit.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);

            safeAuthKit.subscribe(
                ADAPTER_EVENTS.DISCONNECTED,
                disconnectedHandler
            );

            setSafeAuth(safeAuthKit);

            return () => {
                safeAuthKit.unsubscribe(
                    ADAPTER_EVENTS.CONNECTED,
                    connectedHandler
                );
                safeAuthKit.unsubscribe(
                    ADAPTER_EVENTS.DISCONNECTED,
                    disconnectedHandler
                );
            };
        })();
    }, []);

    const onLogin = async () => {
        if (!safeAuth) return;

        const response = await safeAuth.signIn();
        console.log('SIGN IN RESPONSE: ', response);

        setSafeAuthSignInResponse(response);
        setProvider(safeAuth.getProvider());
    };

    const onLogout = async () => {
        if (!safeAuth) return;

        await safeAuth.signOut();

        setProvider(null);
        setSafeAuthSignInResponse(null);
    };

    if (provider) {
        return <button onClick={onLogout}>Log Out</button>;
    }

    return <button onClick={onLogin}>Login</button>;
}

export default Wallet;
