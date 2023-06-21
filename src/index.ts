import './globals';
import { config } from 'dotenv';
config();
import express, { json } from 'express';
// import { connect } from 'mongoose';
import { AddressInfo } from 'net';
import ProjectsRouter from './paths/projects';
import UsersRouter from './paths/users';

const app = express();

app.use(json());

app.use('/projects', ProjectsRouter);
app.use('/users', UsersRouter);

// connect(process.env.MONGO_URL);

const server = app.listen(process.env.PORT, () => {
    console.log(
        'Server listening on port',
        (server.address() as AddressInfo).port
    );
});
