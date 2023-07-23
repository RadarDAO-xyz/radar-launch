import { Router } from 'express';
import { readMany } from '../../util/crud';
import UserVote from '../../models/UserVote';
import { authenticate } from '../../util/auth';

const UsersVotesRouter = Router();

// Path: /users/:id/votes

UsersVotesRouter.use(authenticate(true)); // Mandatory Authentification

// Fetches a user's votes
// Query Param: `today` - Fetch only current voting session's votes
UsersVotesRouter.get(
    '/',
    readMany(UserVote, (req) => req.user?._id === req.doc?._id, {
        filter: (req) => {
            if (req.query.today) {
                // ?today query: fetch only current voting session's votes
                const beginDateRange = new Date();
                beginDateRange.setUTCHours(0, 0, 0, 0);

                const endDateRange = new Date();
                endDateRange.setUTCHours(23, 59, 59, 999);
                return {
                    user: req.user?._id,
                    createdAt: { $gte: beginDateRange, $lte: endDateRange }
                };
            } else {
                // fetches all votes
                return { user: req.user?._id };
            }
        }
    })
);

export default UsersVotesRouter;
