/* eslint-disable @typescript-eslint/no-namespace */

export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            HTTPS_PORT?: string;
            BASE_URL?: string;
            MONGO_URL: string;
            IMGUR_CLIENT_ID: string;
        }
    }
}
