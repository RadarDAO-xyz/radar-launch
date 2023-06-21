import './globals';
import { config } from 'dotenv';
config();
import express, { json } from 'express';
import { connect } from 'mongoose';
import { AddressInfo } from 'net';
import ProjectsRouter from './paths/projects';
import UsersRouter from './paths/users';
import cookieParser from 'cookie-parser';
import LoginRouter from './paths/login';

const app = express();

app.use(json());
app.use(cookieParser());

app.use('/login', LoginRouter);
app.use('/projects', ProjectsRouter);
app.use('/users', UsersRouter);

connect(process.env.MONGO_URL).then(() => console.log('MongoDB connected'));

const server = app.listen(process.env.PORT, () => {
    console.log(
        'Server listening on port',
        (server.address() as AddressInfo).port
    );
});
