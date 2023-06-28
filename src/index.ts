import './globals';
import { config } from 'dotenv';
config();
import express, { json } from 'express';
import { connect } from 'mongoose';
import { AddressInfo } from 'net';
import cookieParser from 'cookie-parser';
import Routes from './routes';

const app = express();

app.use(json());
app.use(cookieParser());

app.use(process.env.BASE_URL ?? '/', Routes);

connect(process.env.MONGO_URL).then(() => console.log('MongoDB connected'));

const server = app.listen(process.env.PORT, () => {
    console.log(
        'Server listening on port',
        (server.address() as AddressInfo).port
    );
});
