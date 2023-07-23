import { Router, urlencoded } from 'express';
import { create, del, read, readMany, update } from '../../util/crud';
import ProjectUpdate from '../../models/ProjectUpdate';

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

ProjectsUpdatesRouter.post('/', (req, res, next) => {
    req.body.project = req.doc?._id;
    next();
});
ProjectsUpdatesRouter.post(
    '/',
    create(
        ProjectUpdate,
        (req) => req.doc?.founder.toString() === req.user?._id.toString()
    )
);

ProjectsUpdatesRouter.patch(
    '/:id',
    update(
        ProjectUpdate,
        (req) => req.doc?.founder.toString() === req.user?._id.toString(),
        { allowedFields: ['text'] }
    )
);

ProjectsUpdatesRouter.delete(
    '/:id',
    del(
        ProjectUpdate,
        (req) => req.doc?.founder.toString() === req.user?._id.toString()
    )
);

export default ProjectsUpdatesRouter;
