import './globals';
import { config } from 'dotenv';
config();
import express, { Router, json } from 'express';
import { connect } from 'mongoose';
import { AddressInfo } from 'net';
import ProjectsRouter from './paths/projects';
import UsersRouter from './paths/users';
import cookieParser from 'cookie-parser';
import LoginRouter from './paths/login';

const app = express();
const router = Router();

router.use(json());
router.use(cookieParser());

router.use('/login', LoginRouter);
router.use('/projects', ProjectsRouter);
router.use('/users', UsersRouter);

app.use('/launch', router);

connect(process.env.MONGO_URL).then(() => console.log('MongoDB connected'));

const server = app.listen(process.env.PORT, () => {
    console.log(
        'Server listening on port',
        (server.address() as AddressInfo).port
    );
});
