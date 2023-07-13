import { Router, static as statc } from 'express';
import ProjectsRouter from './paths/projects';
import UsersRouter from './paths/users';
import path from 'path';
import LoginRouter from './paths/login';
import LogoutRouter from './paths/logout';

const Routes = Router();

Routes.use('/login', LoginRouter);
Routes.use('/logout', LogoutRouter);
Routes.use('/projects', ProjectsRouter);
Routes.use('/users', UsersRouter);
Routes.use('/static', statc(path.join(__dirname, '../static')));

export default Routes;
