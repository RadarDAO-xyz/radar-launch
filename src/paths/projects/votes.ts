import { Router } from 'express';
import { create } from '../../util/crud';
import UserVote from '../../models/UserVote';
import { authenticate } from '../../util/auth';

const ProjectsVotesRouter = Router();

ProjectsVotesRouter.use(authenticate(true));

ProjectsVotesRouter.post('/', (req, res, next) => {
    req.body.project = req.doc?._id;
    req.body.user = req.user?._id;
    next();
});
ProjectsVotesRouter.post(
    '/',
    create(UserVote, () => true, true)
);
ProjectsVotesRouter.post('/', async (req, res) => {
    if (req.doc) req.doc.vote_count += 1;
    await req.doc?.save();
    res.json(req.doc?.toJSON()).end();
});

ProjectsVotesRouter.delete('/', async (req, res) => {
    const beginDateRange = new Date();
    beginDateRange.setUTCHours(0, 0, 0, 0);

    const endDateRange = new Date();
    endDateRange.setUTCHours(23, 59, 59, 999);

    const result = await UserVote.deleteOne({
        project: req.doc?._id,
        user: req.user?._id,
        createdAt: { $gte: beginDateRange, $lte: endDateRange }
    });

    if (result.deletedCount > 0) {
        if (req.doc) req.doc.vote_count -= 1;
        await req.doc?.save();
        res.status(204).end();
    } else {
        res.status(404).end();
    }
});

export default ProjectsVotesRouter;
