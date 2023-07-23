import './globals';
import './util/logger';
import { config } from 'dotenv';
config();
import express, { json } from 'express';
import { connect } from 'mongoose';
import { AddressInfo } from 'net';
import cookieParser from 'cookie-parser';
import Routes from './routes';
import https from 'https';
import http from 'http';
import { readFileSync } from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.disable('x-powered-by'); // Disable X-Powered-By: Express header

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
            'https://launch.radardao.xyz'
        ],
        credentials: true
    })
);
app.use(json()); // Parse JSON Body
app.use(cookieParser()); // Parse cookies

// Apply the Base URL if it was provided
app.use(process.env.BASE_URL ?? '/', Routes);

// Connect to MongoDB
connect(process.env.MONGO_URL).then(() => console.info('MongoDB connected'));

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
