import { Router } from 'express';
import { del, prefetch, read, readMany, update } from '../util/crud';
import User from '../models/User';
import { authenticate } from '../util/auth';
import Project from '../models/Project';
import UsersVotesRouter from './users/votes';

const UsersRouter = Router();

UsersRouter.use(authenticate());

UsersRouter.get('/@me', (req, res) => {
    req.user ? res.json(req.user.toObject()) : res.status(401);
    res.end();
});

UsersRouter.get('/:id', read(User));

UsersRouter.use(authenticate(true));

UsersRouter.patch(
    '/:id',
    update(User, (req) => req.user?._id.toString() === req.params.id, {
        allowedFields: ['name', 'profile', 'email']
    })
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

UsersRouter.use('/:id', prefetch(User));

UsersRouter.use('/:id/votes', UsersVotesRouter);

export default UsersRouter;
