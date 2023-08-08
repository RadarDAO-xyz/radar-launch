import { Router } from 'express';
import { create, del, prefetch, read, readMany, update } from '../util/crud';
import User from '../models/User';
import { authenticate } from '../util/auth';
import Project, { ProjectStatus } from '../models/Project';
import UserVote from '../models/UserVote';
import rl from '../ratelimit';
import { isValidObjectId } from 'mongoose';
import { imageUpload } from '../util/upload';

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
            'all' in req.query
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

UsersRouter.patch(
    '/:id',
    rl('UserUpdate', 60, 5),
    imageUpload('profile', ['name', 'bio', 'socials', 'email']),
    update(User, (req) => req.user?._id.toString() === req.params.id, {
        allowedFields: ['name', 'profile', 'bio', 'socials', 'email']
    })
);

UsersRouter.delete(
    '/:id',
    rl('UserUpdate', 120, 1),
    del(User, (req) => req.user?._id.toString() === req.params.id)
);

// ------------------ Admin only section ------------------

UsersRouter.post(
    '/',
    create(User, () => false)
);

UsersRouter.post('/merge', async (req, res) => {
    if (!req.bypass) return res.status(403).end();

    if (
        (!req.body.primaryAuth || !req.body.secondaryAuth) &&
        (!req.body.primaryId || !req.body.secondaryId)
    )
        return res.status(400).end();

    if (
        !isValidObjectId(req.body.primaryId) ||
        !isValidObjectId(req.body.secondaryId)
    )
        return res.status(400).end();

    let primaryUser, secondaryUser;
    if (req.body.primaryId && req.body.secondaryId) {
        primaryUser = await User.findById(req.body.primaryId);
        secondaryUser = await User.findById(req.body.secondaryId);
    } else {
        primaryUser = await User.findByAuth(req.body.primaryAuth);
        secondaryUser = await User.findByAuth(req.body.secondaryAuth);
    }

    if (!primaryUser)
        return res.status(404).json({ message: 'Primary user not found' });
    if (!secondaryUser)
        return res.status(404).json({ message: 'Secondary user not found' });

    primaryUser.wallets.push(...secondaryUser.wallets);
    await primaryUser.save();
    await secondaryUser.deleteOne();

    res.status(200).json({
        message: 'Successfully merged users',
        from: secondaryUser._id,
        to: primaryUser._id
    });
});

export default UsersRouter;
