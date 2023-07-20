import './globals';
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

app.use(
    cors({
        origin: [
            'https://www.launch.radardao.xyz',
            'https://launch.radardao.xyz'
        ],
        credentials: true
    })
);
app.use(json());
app.use(cookieParser());

app.use(process.env.BASE_URL ?? '/', Routes);

connect(process.env.MONGO_URL).then(() => console.log('MongoDB connected'));

function hostHttp(port: number | string) {
    const server = app.listen(port, () => {
        console.log(
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
            console.log(
                'Server listening on port',
                (server.address() as AddressInfo).port
            );
        });
}

process.env.HTTPS_PORT
    ? hostHttps(parseInt(process.env.HTTPS_PORT), process.env.PORT || 80)
    : hostHttp(process.env.PORT || 3000);
