import { Router } from 'express';
import Project, { IProject } from '../models/Project';
import { authenticate } from '../util/auth';
import { create, del, prefetch, read, readMany, update } from '../util/crud';
import { HydratedDocument, Types } from 'mongoose';
import ProjectsUpdatesRouter from './projects/updates';
import ProjectsVotesRouter from './projects/votes';
import rl from '../ratelimit';
import ProjectsSupportersRouter from './projects/supporters';
import { retrieveVideoThumbnail } from '../util/regex';

const ProjectsRouter = Router();

// Path: /projects

// Fetches projects
// Query Param: `all` - Fetches projects without filtering through unapproved ones
ProjectsRouter.get(
    '/',
    readMany(Project, () => true, {
        filter: (req) => ('all' in req.query ? {} : { status: { $in: [2, 3] } })
    })
);

ProjectsRouter.use('/:id', prefetch(Project));

ProjectsRouter.get('/:id', read(Project));

ProjectsRouter.get('/:id/metadata', (req, res) => {
    const project = req.doc as HydratedDocument<IProject>;
    res.json({
        name: project.title,
        image: retrieveVideoThumbnail(project.video_url),
        description: project.description,
        external_url: `https://radarlaunch.app/projects/${project._id}`
    }).end();
});

ProjectsRouter.use('/:projectId/updates', ProjectsUpdatesRouter);

ProjectsRouter.use('/:projectId/votes', ProjectsVotesRouter);

ProjectsRouter.use('/:projectId/supporters', ProjectsSupportersRouter);

ProjectsRouter.use(authenticate(true)); // Authentication mandatory

ProjectsRouter.post(
    '/',
    rl('ProjectCreate', 60, 5),
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

const canSwitch = (c: number, a: number) => allowedSwitches[c]?.includes(a);

// Status modifier
ProjectsRouter.patch(
    '/:id',
    rl('ProjectChange', 60, 20),
    async (req, res, next) => {
        if (!req.body.status) return next();

        if (req.doc?.founder.toString() !== req.user?._id.toString())
            return res.status(403).end();
        if (!req.doc) return;

        if (!canSwitch(req.doc?.status, req.body.status))
            return res.status(400).end();

        if (req.doc.status === 1 && req.body.status === 2)
            req.doc.launched_at = new Date().toISOString();

        req.doc.status = req.body.status;
        await req.doc.save();
        return res.json(req.doc).end();
    },
    update(
        Project,
        (req) => req.doc?.founder.toString() === req.user?._id.toString(),
        { deniedFields: ['status', '__v', 'curation'] }
    )
);

ProjectsRouter.delete(
    '/:id',
    rl('ProjectChange', 60, 20),
    del(
        Project,
        (req) => req.doc?.founder.toString() === req.user?._id.toString()
    )
);

export default ProjectsRouter;
