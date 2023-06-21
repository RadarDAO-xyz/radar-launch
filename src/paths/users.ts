import { Router } from 'express';
import { create, del, read, update } from '../util/crud';
import User from '../models/User';
import { authenticate } from '../util/auth';

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

export default UsersRouter;
