import { Router, urlencoded } from 'express';
import { authenticate } from '../../util/auth';
import { create, readMany } from '../../util/crud';
import ProjectSupporter, {
    ProjectSupporterType
} from '../../models/ProjectSupporter';
import { json2csv } from 'json-2-csv';

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

ProjectsSupportersRouter.get('/csv', async (req, res) => {
    if (req.user?._id !== req.doc?.founder) return res.status(403).end();
    const supporters = await ProjectSupporter.find(
        'signups' in req.query
            ? { type: 0 }
            : 'contributors' in req.query
            ? { type: 1 }
            : {}
    ).then((a) =>
        a.map((x) => ({ ...x.toObject(), type: ProjectSupporterType[x.type] }))
    );

    const csv = await json2csv(supporters, {
        keys: ['type', 'email', 'social', 'skillset', 'contribution'],
        emptyFieldValue: ''
    });

    res.set('Content-Type', 'text/csv');
    res.set(
        'Content-Disposition',
        `inline; filename=${req.doc?.title} contributors.csv`
    );
    res.send(Buffer.from(csv)).end();
});

export default ProjectsSupportersRouter;