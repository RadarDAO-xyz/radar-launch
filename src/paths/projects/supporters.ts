import { Router, urlencoded } from 'express';
import { authenticate } from '../../util/auth';
import { create, readMany } from '../../util/crud';
import ProjectSupporter from '../../models/ProjectSupporter';

const ProjectsSupportersRouter = Router();

ProjectsSupportersRouter.use(urlencoded({ extended: true }));
ProjectsSupportersRouter.post(
    '/',
    (req, res, next) => {
        req.body.project = req.doc?._id;
        next();
    },
    create(ProjectSupporter)
);

ProjectsSupportersRouter.use(authenticate(true));

ProjectsSupportersRouter.get(
    '/',
    readMany(ProjectSupporter, (req) => req.user?._id === req.doc?.founder, {
        filter: (req) =>
            'signups' in req.query
                ? { type: 0 }
                : 'contributors' in req.query
                ? { type: 1 }
                : {}
    })
);

export default ProjectsSupportersRouter;
