import { Router, urlencoded } from 'express';
import { authenticate } from '../../util/auth';
import { create, readMany } from '../../util/crud';
import ProjectSupporter, {
    ProjectSupporterType
} from '../../models/ProjectSupporter';
import { json2csv } from 'json-2-csv';
import contentDisposition from 'content-disposition';

const ProjectsSupportersRouter = Router();

ProjectsSupportersRouter.use(urlencoded({ extended: true }));
ProjectsSupportersRouter.post(
    '/',
    (req, res, next) => {
        req.body.project = req.doc?._id;
        next();
    },
    create(ProjectSupporter, () => true, true),
    // Update the project's supporter count and return the project in the body
    async (req, res) => {
        if (req.doc) req.doc.supporter_count += 1;
        await req.doc?.save({ validateModifiedOnly: true });
        res.json(req.result?.toJSON()).end();
    }
);

ProjectsSupportersRouter.use(authenticate(true));

ProjectsSupportersRouter.get(
    '/',
    readMany(ProjectSupporter, (req) => req.user?._id === req.doc?.founder, {
        filter: (req) =>
            Object.assign(
                { project: { $eq: req.doc?._id } },
                'signups' in req.query
                    ? { type: 0 }
                    : 'contributors' in req.query
                    ? { type: 1 }
                    : {}
            )
    })
);

ProjectsSupportersRouter.get('/csv', async (req, res) => {
    if (req.user?._id !== req.doc?.founder && !req.bypass)
        return res.status(403).end();
    const supporters = await ProjectSupporter.find(
        Object.assign(
            { project: { $eq: req.doc?._id } },
            'signups' in req.query
                ? { type: 0 }
                : 'contributors' in req.query
                ? { type: 1 }
                : {}
        )
    ).then((a) =>
        a.map((x) => ({ ...x.toObject(), type: ProjectSupporterType[x.type] }))
    );

    const csv = await json2csv(supporters, {
        keys: ['type', 'email', 'social', 'skillset', 'contribution'],
        emptyFieldValue: ''
    });

    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', contentDisposition(req.doc?.title));
    res.send(Buffer.from(csv)).end();
});

export default ProjectsSupportersRouter;
