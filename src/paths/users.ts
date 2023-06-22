import { Router } from 'express';
import { create, del, read, readMany, update } from '../util/crud';
import User from '../models/User';
import { authenticate } from '../util/auth';
import Project from '../models/Project';

const UsersRouter = Router();

UsersRouter.get('/:id', read(User));
UsersRouter.post('/', create(User));

UsersRouter.use(authenticate(true));

UsersRouter.put(
    '/:id',
    update(User, (req) => req.user?._id.toString() === req.params.id)
);
UsersRouter.delete(
    '/:id',
    del(User, (req) => req.user?._id.toString() === req.params.id)
);

UsersRouter.get(
    '/:id/projects',
    readMany(Project, () => true, {
        filter: (req) => ({ founder: req.params.id })
    })
);

export default UsersRouter;
