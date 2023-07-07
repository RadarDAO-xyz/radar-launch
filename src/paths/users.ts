import { Router } from 'express';
import { del, prefetch, read, readMany, update } from '../util/crud';
import User from '../models/User';
import { authenticate } from '../util/auth';
import Project from '../models/Project';

const UsersRouter = Router();

UsersRouter.use(authenticate());

UsersRouter.get('/@me', (req, res) => {
    req.user ? res.json(req.user.toObject()) : res.status(401);
    res.end();
});

UsersRouter.use('/:id', prefetch(User));
UsersRouter.get('/:id', read(User));
UsersRouter.get('/:id/profile', (req, res) => {
    const data = req.doc?.profile as string;
    const img = Buffer.from(data.replace(/^data:.+\/.+;base64,/, ''), 'base64');

    res.writeHead(200, {
        'Content-Type': data.split(';')[0].split(':')[1],
        'Content-Length': img.length
    });
    res.write(img);
    res.end();
});

UsersRouter.use(authenticate(true));

UsersRouter.patch(
    '/:id',
    update(User, (req) => req.user?._id.toString() === req.params.id, {
        allowedFields: ['name', 'profile', 'bio', 'socials', 'email']
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

export default UsersRouter;
