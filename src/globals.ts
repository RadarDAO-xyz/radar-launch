/* eslint-disable @typescript-eslint/no-namespace */

export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URL: string;
            IMGUR_CLIENT_ID: string;
            PORT?: string;
            HTTPS_PORT?: string;
            BASE_URL?: string;
        }
    }
}
