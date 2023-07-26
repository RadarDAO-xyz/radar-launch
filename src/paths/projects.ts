import { Router } from 'express';
import Project from '../models/Project';
import { authenticate } from '../util/auth';
import { create, del, prefetch, read, readMany, update } from '../util/crud';
import { Types } from 'mongoose';
import ProjectsUpdatesRouter from './projects/updates';
import ProjectsVotesRouter from './projects/votes';

const ProjectsRouter = Router();

// Path: /projects

// Fetches projects
// Query Param: `all` - Fetches projects without filtering through unapproved ones
ProjectsRouter.get(
    '/',
    readMany(Project, () => true, {
        filter: (req) => (req.params.all ? {} : { status: { $in: [2, 3] } })
    })
);
ProjectsRouter.get('/:id', read(Project));

ProjectsRouter.use('/:id', prefetch(Project));

ProjectsRouter.use('/:projectId/updates', ProjectsUpdatesRouter);

ProjectsRouter.use('/:projectId/votes', ProjectsVotesRouter);

ProjectsRouter.use(authenticate(true)); // Authentication mandatory

ProjectsRouter.post(
    '/',
    async (req, res, next) => {
        (req.body as Record<string, Types.ObjectId>).founder = req.user
            ?._id as Types.ObjectId;
        next();
    },
    create(Project)
);

const allowedSwitches = {
    0: [5],
    1: [2]
} as Record<number, number[]>;

// Status modifier
ProjectsRouter.patch(
    '/:id',
    async (req, res, next) => {
        if (!req.body.status) return next();

        if (req.doc?.founder.toString() !== req.user?._id.toString())
            return res.status(403).end();
        if (!req.doc) return;

        if (
            !allowedSwitches[req.doc?.status as number]?.includes(
                req.body.status
            )
        )
            return res.status(400).end();

        req.doc.status = req.body.status;
        await req.doc.save();
        return res.json(req.doc).end();
    },
    update(
        Project,
        (req) => req.doc?.founder.toString() === req.user?._id.toString(),
        { deniedFields: ['status', '__v'] }
    )
);

ProjectsRouter.delete(
    '/:id',
    del(
        Project,
        (req) => req.doc?.founder.toString() === req.user?._id.toString()
    )
);

export default ProjectsRouter;
