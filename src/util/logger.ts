/* eslint-disable @typescript-eslint/no-explicit-any */

// This file adds this prefix to all logging calls: Year-Mo-Da Ho:Mi:Se.Mil [Type]

const getTimestamp = (d = new Date()) =>
    `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(
        2,
        '0'
    )}-${`${d.getDate()}`.padStart(2, '0')} ${`${d.getHours()}`.padStart(
        2,
        '0'
    )}:${`${d.getMinutes()}`.padStart(2, '0')}:${`${d.getSeconds()}`.padStart(
        2,
        '0'
    )}.${`${d.getMilliseconds()}`.padStart(3, '0')}`;

const debug = console.debug;
console.debug = function (...data: any[]) {
    // Debug is only logged for development runs
    if (process.env.NODE_ENV === 'development')
        debug(getTimestamp(), '[DEBUG]', ...data);
};

const error = console.error;
console.error = function (...data: any[]) {
    error(getTimestamp(), '[ERROR]', ...data);
};

const info = console.info;
console.info = function (...data: any[]) {
    info(getTimestamp(), '[INFO]', ...data);
};

const log = console.log;
console.log = function (...data: any[]) {
    log(getTimestamp(), '[LOG]', ...data);
};

const warn = console.warn;
console.warn = function (...data: any[]) {
    warn(getTimestamp(), '[WARN]', ...data);
};
