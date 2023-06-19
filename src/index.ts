import './globals';
import { config } from 'dotenv';
config();
import express from 'express';
import { connect } from 'mongoose';
import { AddressInfo } from 'net';

const app = express();

connect(process.env.MONGO_URL);

const server = app.listen(process.env.PORT, () => {
    console.log('Server listening on port', (server.address() as AddressInfo).port);
});
