/* eslint-disable @typescript-eslint/no-namespace */

export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URL: string;
            PORT?: string;
            BASE_URL?: string;
        }
    }
}
