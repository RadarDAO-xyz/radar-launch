import { Schema, model, Types } from 'mongoose';

export enum ProjectStatus {
    'In Review',
    'Approved',
    'Live',
    'Closed & Building'
}

export interface IProject {
    title: string;
    founder: Types.ObjectId;
    description: string;
    video_url: string;
    tldr: string;
    brief:
        | 'The Enchantress'
        | 'The Healer'
        | 'The Mediator'
        | 'The Teacher'
        | 'The Artist'
        | 'Other';
    inspiration: string;
    team: { name: string; bio?: string; email: string }[];
    collaborators?: string;
    waitlist: boolean;
    milestones: { amount: number; text: string }[];
    edition_price: number;
    mint_end_date: string;
    benefits: { amount: number; text: string }[];
    admin_address: string;
    status: ProjectStatus;
}

const projectSchema = new Schema<IProject>(
    {
        title: {
            type: String,
            required: true
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
            required: true,
            enum: [
                'The Enchantress',
                'The Healer',
                'The Mediator',
                'The Teacher',
                'The Artist',
                'Other'
            ]
        },
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
        status: {
            type: Number,
            required: true,
            emum: [0, 1, 2, 3],
            default: 0
        }
    },
    { timestamps: true }
);

projectSchema.method('toJSON', function () {
    return { ...this.toObject(), admin_address: undefined, team: undefined };
});

const Project = model<IProject>('Project', projectSchema, 'projects');

export default Project;
