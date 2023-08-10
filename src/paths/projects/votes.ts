import { Router } from 'express';
import { create } from '../../util/crud';
import UserVote from '../../models/UserVote';
import { authenticate } from '../../util/auth';

const ProjectsVotesRouter = Router();

// Path: /projects/:id/votes

ProjectsVotesRouter.use(authenticate(true)); // Mandatory Authentication

ProjectsVotesRouter.post(
    '/',
    // Prepares the (already fetched) data for the create handler
    (req, res, next) => {
        req.body.project = req.doc?._id;
        req.body.user = req.user?._id;
        next();
    },
    // Create the vote doc
    create(UserVote, () => true, true),
    // Update the project's vote count and return the project in the body
    async (req, res) => {
        if (req.doc) req.doc.vote_count += 1;
        await req.doc?.save();
        res.json(req.doc?.toJSON()).end();
    }
);

// Deletes a vote for this project that was done during the current vote period (today).
ProjectsVotesRouter.delete('/', async (req, res) => {
    const beginDateRange = new Date(); // Today date
    beginDateRange.setUTCHours(0, 0, 0, 0); // Beginning of the day

    const endDateRange = new Date();
    endDateRange.setUTCHours(23, 59, 59, 999); // End of the day

    const result = await UserVote.deleteOne({
        project: req.doc?._id,
        user: req.user?._id,
        createdAt: { $gte: beginDateRange, $lte: endDateRange }
    });

    if (result.deletedCount > 0) {
        if (req.doc) req.doc.vote_count -= 1; // Change the Project's vote_count
        await req.doc?.save({ validateModifiedOnly: true });
        res.status(204).end();
    } else {
        res.status(404).end();
    }
});

export default ProjectsVotesRouter;
