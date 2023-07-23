import { Router } from 'express';
import { del, prefetch, read, readMany, update } from '../util/crud';
import User from '../models/User';
import { authenticate } from '../util/auth';
import Project, { ProjectStatus } from '../models/Project';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import { ImgurClient } from 'imgur';
import UserVote from '../models/UserVote';

const UsersRouter = Router();

// Path: /users

UsersRouter.use(authenticate());

// Fetches self (authenticated user). Note: This is the only endpoint that supports @me, all following endpoints must use :id
UsersRouter.get('/@me', (req, res) => {
    req.user ? res.json(req.user.toObject()) : res.status(401);
    res.end();
});

UsersRouter.use('/:id', prefetch(User));
UsersRouter.get('/:id', read(User));
UsersRouter.get('/:id/profile', (req, res) => res.redirect(req.doc?.profile)); // Redirects to the hosted link (imgur)

// Fetches a user's projects
// Query Param: `all` - Fetches projects without filtering through unapproved ones
UsersRouter.get(
    '/:id/projects',
    readMany(Project, () => true, {
        filter: (req) =>
            req.params.all
                ? { founder: req.params.id }
                : {
                      founder: req.params.id,
                      status: {
                          $in: [ProjectStatus.Live, ProjectStatus.Building]
                      }
                  }
    })
);

// Fetches a user's votes
// Query Param: `today` - Fetch only current voting session's votes
UsersRouter.get(
    '/:id/votes',
    readMany(UserVote, (req) => req.user?._id === req.doc?._id, {
        filter: (req) => {
            if (req.query.today) {
                // ?today query: fetch only current voting session's votes
                const beginDateRange = new Date();
                beginDateRange.setUTCHours(0, 0, 0, 0);

                const endDateRange = new Date();
                endDateRange.setUTCHours(23, 59, 59, 999);
                return {
                    user: req.user?._id,
                    createdAt: { $gte: beginDateRange, $lte: endDateRange }
                };
            } else {
                // fetches all votes
                return { user: req.user?._id };
            }
        }
    })
);

UsersRouter.use(authenticate(true)); // Mandatory Authentication

UsersRouter.patch('/:id', (req, res, next) => {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024
        });

        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400);

            // Prepare fields for the next patch handler
            req.body = {
                name: fields.name?.[0],
                bio: fields.bio?.[0],
                socials: fields.socials?.[0],
                email: fields.email?.[0]
            };

            // If profile file is present, upload file to imgur and set link as profile
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
                req.body.profile = resp.data.link; // Prepare field for the next patch handler
            }
            next();
        });
    } else {
        delete req.body.profile; // Remove any manual links from being set (must be upload via the API to imgur)
        next();
    }
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

export default UsersRouter;
