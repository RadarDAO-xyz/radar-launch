import { Schema, Types, model } from 'mongoose';

export interface IUserVote {
    user: Types.ObjectId;
    project: Types.ObjectId;
}

const userVoteSchema = new Schema<IUserVote>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        project: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Project'
        }
    },
    { timestamps: true }
);

const UserVote = model<IUserVote>('UserVote', userVoteSchema, 'users.votes');

export default UserVote;
