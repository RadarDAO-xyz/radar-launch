import { Schema, model, Types } from 'mongoose';
import { retrieveVideoThumbnail } from '../util/regex';
import ProjectSupporter from './ProjectSupporter';
import ProjectUpdate from './ProjectUpdate';
import UserVote from './UserVote';

export enum ProjectStatus {
    'In Review',
    'Approved',
    'Live',
    'Building',
    'Rejected',
    'Cancelled'
}

export interface IProject {
    title: string;
    pool: Types.ObjectId;
    founder: Types.ObjectId;
    description: string;
    thumbnail?: string;
    video_url: string;
    tldr: string;
    brief: string;
    tags: string[];
    inspiration: string;
    team: { name: string; bio?: string; email: string }[];
    collaborators?: string;
    waitlist: boolean;
    milestones: { amount: string; text: string }[];
    edition_price: number;
    mint_end_date: string; // ISO Datestring
    benefits: { amount: number; text: string }[];
    admin_address: string;
    supporter_count: number;
    vote_count: number;
    status: ProjectStatus;
    launched_at: string; // ISO Datestring
    curation: {
        start: string; // ISO Datestring
        end: string; // ISO Datestring
    };
}

const projectSchema = new Schema<IProject>(
    {
        title: {
            type: String,
            required: true
        },
        pool: {
            type: Schema.Types.ObjectId,
            ref: 'Pool'
        },
        founder: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        description: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            get: function (val: string) {
                const tthis = this as IProject;
                return val ?? retrieveVideoThumbnail(tthis.video_url);
            }
        },
        video_url: {
            type: String,
            required: true
        },
        tldr: {
            type: String,
            required: true
        },
        brief: {
            type: String,
            required: true
        },
        tags: [String],
        inspiration: {
            type: String,
            required: true
        },
        team: [
            new Schema(
                {
                    name: { type: String, required: true },
                    bio: String,
                    email: { type: String, required: true }
                },
                { _id: false }
            )
        ],
        collaborators: String,
        waitlist: {
            type: Boolean,
            required: true,
            default: false
        },
        milestones: [
            new Schema(
                {
                    amount: { type: String, required: true },
                    text: { type: String, required: true }
                },
                { _id: false }
            )
        ],
        edition_price: {
            type: Number,
            required: true
        },
        mint_end_date: {
            type: String, // ISO Datestring
            required: true
        },
        benefits: [
            new Schema(
                {
                    amount: { type: Number, required: true },
                    text: { type: String, required: true }
                },
                { _id: false }
            )
        ],
        admin_address: {
            type: String,
            required: true
        },
        supporter_count: {
            type: Number,
            required: true,
            default: 0
        },
        vote_count: {
            type: Number,
            required: true,
            default: 0
        },
        status: {
            type: Number,
            required: true,
            emum: [0, 1, 2, 3, 4, 5],
            default: 0
        },
        launched_at: {
            type: String // ISO Datestring
        },
        curation: new Schema(
            {
                start: String, // ISO Datestring
                end: String // ISO Datestring
            },
            { _id: false }
        )
    },
    { timestamps: true, toJSON: { getters: true } }
);

projectSchema.post(
    'deleteOne',
    { query: false, document: true, errorHandler: false },
    async function () {
        const s = { project: this._id };
        await Promise.all([
            ProjectSupporter.deleteMany(s),
            ProjectUpdate.deleteMany(s),
            UserVote.deleteMany(s)
        ]);
    }
);

const Project = model<IProject>('Project', projectSchema, 'projects');

export default Project;
