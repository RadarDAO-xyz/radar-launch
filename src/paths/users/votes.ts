import { Router } from 'express';
import { readMany } from '../../util/crud';
import UserVote from '../../models/UserVote';
import { authenticate } from '../../util/auth';

const UsersVotesRouter = Router();

UsersVotesRouter.use(authenticate(true));

UsersVotesRouter.get(
    '/',
    readMany(UserVote, (req) => req.user?._id === req.doc?._id, {
        filter: (req) => {
            if (req.query.today) {
                const beginDateRange = new Date();
                beginDateRange.setUTCHours(0, 0, 0, 0);

                const endDateRange = new Date();
                endDateRange.setUTCHours(23, 59, 59, 999);
                return {
                    user: req.user?._id,
                    createdAt: { $gte: beginDateRange, $lte: endDateRange }
                };
            } else {
                return { user: req.user?._id };
            }
        }
    })
);

export default UsersVotesRouter;
