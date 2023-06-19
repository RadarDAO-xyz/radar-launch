import { ObjectId, Schema, model } from 'mongoose';

export enum ProjectStatus {
    'In Review',
    'Approved',
    'Live',
    'Closed & Building'
}

export interface IProject {
    title: string;
    founder: ObjectId;
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
    milestones: string[];
    edition_price: number;
    mint_end_date: string;
    benefits: string[];
    admin_address: string;
    status: ProjectStatus;
}

const projectSchema = new Schema<IProject>({
    title: {
        type: String,
        required: true
    },
    founder: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Founder'
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
            { id: false }
        )
    ],
    collaborators: String,
    waitlist: {
        type: Boolean,
        required: true,
        default: false
    },
    milestones: [String],
    edition_price: {
        type: Number,
        required: true
    },
    mint_end_date: {
        type: String, // ISO Datestring
        required: true
    },
    benefits: [String],
    admin_address: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    }
});

const Project = model<IProject>('Project', projectSchema, 'projects');

export default Project;
