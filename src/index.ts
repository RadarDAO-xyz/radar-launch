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

app.use((req, res, next) => {
    console.log(
        'Received request from',
        req.headers['user-agent'],
        'to',
        req.originalUrl
    );
    next();
});

app.use(cors());
app.use(json());
app.use(cookieParser());

app.use(process.env.BASE_URL ?? '/', Routes);

connect(process.env.MONGO_URL).then(() => console.log('MongoDB connected'));

http.createServer((req, res) => {
    res.writeHead(302, 'Found', {
        Location: `https://${req.headers.host}${req.url}`
    }).end();
}).listen(80);

const server = https
    .createServer(
        {
            cert: readFileSync(path.join(__dirname, '../certificate.crt')),
            key: readFileSync(path.join(__dirname, '../private.key')),
            ca: readFileSync(path.join(__dirname, '../ca_bundle.crt'))
        },
        app
    )
    .listen(443, () => {
        console.log(
            'Server listening on port',
            (server.address() as AddressInfo).port
        );
    });
