import { Router } from 'express';
import ProjectsRouter from './paths/projects';
import UsersRouter from './paths/users';
import PoolsRouter from './paths/pools';
import VerifyRouter from './paths/verify';
import MetadataRouter from './paths/metadata';

const Routes = Router();

Routes.use('/pools', PoolsRouter);
Routes.use('/projects', ProjectsRouter);
Routes.use('/users', UsersRouter);
Routes.use('/verify', VerifyRouter);
Routes.use('/metadata', MetadataRouter);

export default Routes;
