import { Schema, Types, model } from 'mongoose';

export interface IProjectVote {
    user: Types.ObjectId;
    project: Types.ObjectId;
}

const projectVoteSchema = new Schema<IProjectVote>(
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

const ProjectVote = model<IProjectVote>(
    'ProjectVote',
    projectVoteSchema,
    'projects.votes'
);

export default ProjectVote;
