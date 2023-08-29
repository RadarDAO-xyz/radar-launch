import './globals';
import './util/logger';
import { config } from 'dotenv';
config();
import express, { json } from 'express';
import mongoose, { connect, connection } from 'mongoose';
import { AddressInfo } from 'net';
import Routes from './routes';
import https from 'https';
import http from 'http';
import { readFileSync } from 'fs';
import path from 'path';
import cors from 'cors';
import rl from './ratelimit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import lusca from 'lusca';

const app = express();
app.disable('x-powered-by'); // Disable X-Powered-By: Express header
process.env.NODE_ENV === 'production' && app.set('trust proxy', 1); // Nginx proxy

// Max 100 requests per minute (Global)
app.use(rl('Global', 60, 100));

// Log request user agents
app.use((req, res, next) => {
    console.log(
        'Received',
        req.method,
        'request from',
        req.headers['user-agent'],
        'to',
        req.originalUrl
    );
    next();
});

// Respond with appropriate CORS Headers
app.use(
    cors({
        origin: [
            'https://www.launch.radardao.xyz',
            'https://launch.radardao.xyz',
            'https://radar-launch.netlify.app',
            'https://radarlaunch.app',
            'https://radar-launch-frontend.vercel.app'
        ],
        credentials: true
    })
);

let resolveMongooseClient: (
    value: mongoose.mongo.MongoClient | PromiseLike<mongoose.mongo.MongoClient>
) => void;
app.use(
    session({
        secret: process.env.COOKIE_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
            domain:
                process.env.NODE_ENV !== 'development'
                    ? 'api.radardao.xyz'
                    : 'localhost',
            maxAge: 2 * 7 * 24 * 60 * 60, // 2 weeks
            secure: process.env.NODE_ENV !== 'development',
            httpOnly: false
        },
        store: new MongoStore({
            clientPromise: new Promise((res) => (resolveMongooseClient = res)),
            touchAfter: 24 * 3600,
            crypto: {
                secret: process.env.COOKIE_SECRET
            }
        })
    })
);

app.use(
    lusca({
        csrf: true,
        xframe: 'SAMEORIGIN',
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
        xssProtection: true,
        nosniff: true,
        referrerPolicy: 'same-origin'
    })
);

app.use(json()); // Parse JSON Body

// Apply the Base URL if it was provided
app.use('/' + (process.env.BASE_URL ?? ''), Routes);

// Connect to MongoDB
connect(process.env.MONGO_URL).then(() => {
    resolveMongooseClient(connection.getClient());
    console.info('MongoDB connected');
});

function hostHttp(port: number | string) {
    const server = app.listen(port, () => {
        console.info(
            'Server listening on port',
            (server.address() as AddressInfo).port
        );
    });
}
function hostHttps(sport: number | string, port: number | string) {
    http.createServer((req, res) => {
        res.writeHead(302, 'Found', {
            Location: `https://${req.headers.host}${req.url}`
        }).end();
    }).listen(port);

    const server = https
        .createServer(
            {
                cert: readFileSync(path.join(__dirname, '../certificate.crt')),
                key: readFileSync(path.join(__dirname, '../private.key')),
                ca: readFileSync(path.join(__dirname, '../ca_bundle.crt'))
            },
            app
        )
        .listen(sport, () => {
            console.info(
                'Server listening on port',
                (server.address() as AddressInfo).port
            );
        });
}

// Host on HTTPS Only if https port is provided
process.env.HTTPS_PORT
    ? hostHttps(parseInt(process.env.HTTPS_PORT), process.env.PORT || 80)
    : hostHttp(process.env.PORT || 3000);
