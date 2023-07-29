import { Options, rateLimit } from 'express-rate-limit';
import Memcached from 'memcached';
import MemcachedStore from 'rate-limit-memcached';

export const MemcachedClient =
    process.env.NODE_ENV === 'production'
        ? new Memcached(['127.0.0.1:11211'])
        : undefined;

/**
 *
 * @param bucket The Bucket to associate this ratelimiter with
 * @param window The window longevity time in seconds
 * @param max The maximum amount of requests per time window
 * @returns Express Middleware
 */
export default function rl(
    bucket: string,
    window: number,
    max: number,
    extraOptions?: Options
) {
    return rateLimit({
        windowMs: window * 1000,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        store: MemcachedClient
            ? new MemcachedStore({
                  expiration: window,
                  client: MemcachedClient,
                  prefix: `rl-${bucket};remoteip:`
              })
            : undefined,
        skip: (req) => req.bypass, // Don't ratelimit if action is being performed by an admin
        ...extraOptions
    });
}
