import { Router, urlencoded } from 'express';
import { create, del, read, readMany, update } from '../../util/crud';
import ProjectUpdate from '../../models/ProjectUpdate';
import rl from '../../ratelimit';

const ProjectsUpdatesRouter = Router();

// Path: /projects/:id/updates

ProjectsUpdatesRouter.get(
    '/',
    readMany(ProjectUpdate, () => true, {
        filter: (req) => ({ project: req.doc?._id })
    })
);
ProjectsUpdatesRouter.get('/:id', read(ProjectUpdate));

ProjectsUpdatesRouter.use(urlencoded({ extended: true }));

ProjectsUpdatesRouter.post(
    '/',
    rl('ProjectUpdateCreate', 60, 5),
    (req, res, next) => {
        req.body.project = req.doc?._id;
        next();
    },
    create(
        ProjectUpdate,
        (req) => req.doc?.founder.toString() === req.user?._id.toString()
    )
);

ProjectsUpdatesRouter.patch(
    '/:id',
    rl('ProjectUpdateChange', 60, 5),
    update(
        ProjectUpdate,
        (req) => req.doc?.founder.toString() === req.user?._id.toString(),
        { allowedFields: ['text'] }
    )
);

ProjectsUpdatesRouter.delete(
    '/:id',
    rl('ProjectUpdateChange', 60, 5),
    del(
        ProjectUpdate,
        (req) => req.doc?.founder.toString() === req.user?._id.toString()
    )
);

export default ProjectsUpdatesRouter;
