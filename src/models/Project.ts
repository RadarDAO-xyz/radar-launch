import { Schema, model, Types } from 'mongoose';

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
    video_url: string;
    tldr: string;
    brief: string;
    tags: string[];
    inspiration: string;
    team: { name: string; bio?: string; email: string }[];
    collaborators?: string;
    waitlist: boolean;
    milestones: { amount: number; text: string }[];
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
                    amount: { type: Number, required: true },
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
    { timestamps: true }
);

projectSchema.method('toJSON', function () {
    return { ...this.toObject(), admin_address: undefined };
});

const Project = model<IProject>('Project', projectSchema, 'projects');

export default Project;
