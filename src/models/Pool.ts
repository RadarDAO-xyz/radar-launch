import { Schema, model } from 'mongoose';

export type Sponsor = {
    logo?: string;
    name: string;
    contribution: number;
};

export interface IPool {
    title: string;
    subtitle: string;
    description: string;
    pool_amount: number;
    hero_image?: string;
    sponsors: Sponsor[];
    video?: string;
    briefButtonLink: string;
    eventButtonLink: string;
    is_hidden: boolean;
}

const poolSchema = new Schema<IPool>(
    {
        title: {
            type: String,
            required: true
        },
        subtitle: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        pool_amount: {
            type: Number,
            required: true
        },
        hero_image: {
            type: String,
            required: true
        },
        briefButtonLink: {
            type: String,
            required: true
        },
        eventButtonLink: {
            type: String,
            required: true
        },
        sponsors: [
            new Schema(
                {
                    logo: {
                        type: String
                    },
                    name: {
                        type: String,
                        required: true
                    },
                    contribution: {
                        type: Number,
                        required: true
                    }
                },
                { _id: false }
            )
        ],
        video: {
            type: String
        },
        is_hidden: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Pool = model<IPool>('Pool', poolSchema, 'pools');

export default Pool;
