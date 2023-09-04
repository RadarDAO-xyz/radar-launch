import { Router, urlencoded } from 'express';
import { authenticate } from '../../util/auth';
import { create, readMany } from '../../util/crud';
import ProjectSupporter, {
    ProjectSupporterType
} from '../../models/ProjectSupporter';
import { json2csv } from 'json-2-csv';
import contentDisposition from 'content-disposition';
import rl from '../../ratelimit';
import Project, { ProjectDocument } from '../../models/Project';

const ProjectsSupportersRouter = Router();

ProjectsSupportersRouter.use(urlencoded({ extended: true }));
ProjectsSupportersRouter.post(
    '/',
    rl('ProjectSupportersCreate', 30, 5),
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

ProjectsSupportersRouter.get(
    '/believers',
    rl('ProjectSupportersFetch', 30, 15),
    async (req, res) => {
        const project = req.doc as ProjectDocument;
        const believers = await project.getBelievers();
        project.updateSupporterCount({ believerCount: believers.length });
        res.json(believers).end();
    }
);

ProjectsSupportersRouter.use(authenticate(true));

ProjectsSupportersRouter.get(
    '/',
    rl('ProjectSupportersFetch', 30, 2),
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

ProjectsSupportersRouter.get(
    '/csv',
    rl('ProjectSupportersFetch', 30, 1),
    async (req, res) => {
        if (req.user?._id !== req.doc?.founder && !req.bypass)
            return res.status(403).end();

        if (!req.doc?.nftTokenCache) {
            await Project.cacheNFTTokens();
            req.doc = (await Project.findOne({
                _id: req.doc?._id
            })) as ProjectDocument;
        }

        const [nftOwners, believers, supporters] = await Promise.all([
            (req.doc as ProjectDocument).getNFTOwners().then((ows) =>
                ows.map((o) => {
                    if (typeof o === 'string') {
                        return {
                            type: 'Collector',
                            address: o.toLowerCase()
                        };
                    } else {
                        return {
                            type: 'Collector',
                            name: o.name === 'Your name' ? undefined : o.name,
                            email: o.email,
                            address: o.wallets
                                .find((x) => x.address)
                                ?.address?.toLowerCase(),
                            social: o.socials
                        };
                    }
                })
            ),
            (req.doc as ProjectDocument).getBelievers().then((bvs) =>
                bvs.map((b) => {
                    if (typeof b === 'string') {
                        return {
                            type: 'Believer',
                            address: b.toLowerCase()
                        };
                    } else {
                        return {
                            type: 'Believer',
                            name: b.name === 'Your name' ? undefined : b.name,
                            email: b.email,
                            address: b.wallets
                                .find((x) => x.address)
                                ?.address?.toLowerCase(),
                            social: b.socials
                        };
                    }
                })
            ),
            ProjectSupporter.find(
                Object.assign(
                    { project: { $eq: req.doc?._id } },
                    'signups' in req.query
                        ? { type: 0 }
                        : 'contributors' in req.query
                        ? { type: 1 }
                        : {}
                )
            ).then((a) =>
                a.map((x) => ({
                    ...x.toObject(),
                    type: ProjectSupporterType[x.type]
                }))
            )
        ]);

        (req.doc as ProjectDocument).updateSupporterCount({
            believerCount: believers.length,
            supporterCount: supporters.length
        });

        const csv = await json2csv(
            [...nftOwners, ...believers, ...supporters],
            {
                keys: [
                    'type',
                    'name',
                    'address',
                    'email',
                    'social',
                    'skillset',
                    'contribution',
                    'signatureHash',
                    'signedMessage',
                    'signingAddress'
                ],
                emptyFieldValue: ''
            }
        );

        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', contentDisposition(req.doc?.title));
        res.send(Buffer.from(csv)).end();
    }
);

export default ProjectsSupportersRouter;
