import { Router } from 'express';
import { Types } from 'mongoose';
import Project, { ProjectDocument } from '../models/Project';
import rl from '../ratelimit';
import { authenticate } from '../util/auth';
import { create, del, prefetch, read, readMany, update } from '../util/crud';
import ProjectsSupportersRouter from './projects/supporters';
import ProjectsUpdatesRouter from './projects/updates';
import ProjectsVotesRouter from './projects/votes';
import { imageUpload } from '../util/upload';
import { EmailTemplates, sendMail } from '../util/email';

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

ProjectsRouter.use('/:projectId/updates', ProjectsUpdatesRouter);

ProjectsRouter.use('/:projectId/votes', ProjectsVotesRouter);

ProjectsRouter.use('/:projectId/supporters', ProjectsSupportersRouter);

ProjectsRouter.use(authenticate(true)); // Authentication mandatory

ProjectsRouter.post(
    '/',
    rl('ProjectCreate', 60, 5),
    imageUpload('thumbnail'),
    async (req, res, next) => {
        (req.body as Record<string, Types.ObjectId>).founder = req.user
            ?._id as Types.ObjectId;
        next();
    },
    create(Project, () => true, true),
    async (req, res) => {
        const project = req.result as ProjectDocument | undefined;
        if (!project) return res.status(500).end();
        res.json(project).end();
        // Send emails (separate thread)
        sendMail(EmailTemplates.CREATED(project));
    }
);

const allowedSwitches = {
    0: [5],
    1: [2]
} as Record<number, number[]>;

const canSwitch = (c: number, a: number) => allowedSwitches[c]?.includes(a);

ProjectsRouter.patch(
    '/:id',
    rl('ProjectChange', 60, 20),
    imageUpload('thumbnail'),
    async (req, res, next) => {
        // Status modifier
        const nextStatus = req.body.status;
        if (!nextStatus) return next();

        const project = req.doc as ProjectDocument;
        if (!project) return res.status(404).end();

        const oldStatus = project?.status as number;

        if (project.founder.toString() !== req.user?._id.toString())
            return res.status(403).end();

        if (!canSwitch(oldStatus, nextStatus) && !req.bypass)
            return res.status(400).end();

        if (oldStatus === 0 && nextStatus === 1) {
            // Being approved
            // Send emails out (separate thread)
            sendMail(EmailTemplates.APPROVED(project));
        }

        if (oldStatus === 1 && nextStatus === 2) {
            // Going live
            project.launched_at = new Date().toISOString();
            // Send emails out (separate thread)
            sendMail(EmailTemplates.LAUNCHED(project));
        }

        project.status = nextStatus;
        next();
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
