/* eslint-disable @typescript-eslint/no-namespace */

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            HTTPS_PORT?: string;
            BASE_URL?: string;
            MONGO_URL: string;
            IMGUR_CLIENT_ID: string;
            EMAIL_PASS: string;
            ALCHEMY_KEY: string;
            COOKIE_SECRET: string;
            PRIVY_APP_ID: string;
            PRIVY_SECRET: string;
            MEMCACHED_SERVER?: string;
        }
    }
}

export type ArrayType<T> = T extends (infer Item)[] ? Item : T;
