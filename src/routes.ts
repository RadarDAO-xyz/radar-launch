import { Router, static as statc } from 'express';
import ProjectsRouter from './paths/projects';
import UsersRouter from './paths/users';
import path from 'path';
import PoolsRouter from './paths/pools';
import VerifyRouter from './paths/verify';

const Routes = Router();

Routes.use('/pools', PoolsRouter);
Routes.use('/projects', ProjectsRouter);
Routes.use('/users', UsersRouter);
Routes.use('/verify', VerifyRouter);
Routes.use('/static', statc(path.join(__dirname, '../static')));

export default Routes;
