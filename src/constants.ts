import { CookieOptions } from 'express';

export const SessionCookieName = 'session';
export const SessionCookieOptions: CookieOptions = {
    maxAge: 2 * 7 * 24 * 60 * 60,
    sameSite: 'none',
    secure: true,
    domain: '.radardao.xyz'
};