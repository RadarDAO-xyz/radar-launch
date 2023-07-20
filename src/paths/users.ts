import { Router } from 'express';
import { del, prefetch, read, readMany, update } from '../util/crud';
import User from '../models/User';
import { authenticate } from '../util/auth';
import Project from '../models/Project';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import { ImgurClient } from 'imgur';
import UsersVotesRouter from './users/votes';

const UsersRouter = Router();

UsersRouter.use(authenticate());

UsersRouter.get('/@me', (req, res) => {
    req.user ? res.json(req.user.toObject()) : res.status(401);
    res.end();
});

UsersRouter.use('/:id', prefetch(User));
UsersRouter.get('/:id', read(User));
UsersRouter.get('/:id/profile', (req, res) => res.redirect(req.doc?.profile));

UsersRouter.get(
    '/:id/projects',
    readMany(Project, () => true, {
        filter: (req) =>
            req.params.all
                ? { founder: req.params.id }
                : { founder: req.params.id, status: { $in: [2, 3] } }
    })
);

UsersRouter.use(authenticate(true));

UsersRouter.patch('/:id', (req, res, next) => {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                next(err);
                return;
            }
            req.body = {
                name: fields.name?.[0],
                bio: fields.bio?.[0],
                socials: fields.socials?.[0],
                email: fields.email?.[0]
            };
            console.log(files.profile);
            if (Array.isArray(files.profile)) {
                const client = new ImgurClient({
                    clientId: process.env.IMGUR_CLIENT_ID
                });
                const resp = await client.upload({
                    image: createReadStream(
                        files.profile[0]?.filepath
                    ) as unknown as ReadableStream,
                    type: 'stream'
                });
                console.log(resp.data.link);
                req.body.profile = resp.data.link;
            }
            next();
        });
    } else next();
});
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

UsersRouter.use('/:id/votes', UsersVotesRouter);

export default UsersRouter;
