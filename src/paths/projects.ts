import { Router } from 'express';
import Project from '../models/Project';
import { authenticate } from '../util/auth';
import { create, del, prefetch, read, readMany, update } from '../util/crud';
import { Types } from 'mongoose';
import ProjectsUpdatesRouter from './projects/updates';

const ProjectsRouter = Router();

ProjectsRouter.get('/', readMany(Project));
ProjectsRouter.get('/:id', read(Project));

ProjectsRouter.use(authenticate(true));

ProjectsRouter.post('/', async (req, res, next) => {
    (req.body as Record<string, Types.ObjectId>).founder = req.user
        ?._id as Types.ObjectId;
    next();
});
ProjectsRouter.post('/', create(Project));

ProjectsRouter.use('/:id', prefetch(Project));

ProjectsRouter.patch(
    '/:id',
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

ProjectsRouter.use('/:projectId/updates', ProjectsUpdatesRouter);

export default ProjectsRouter;
