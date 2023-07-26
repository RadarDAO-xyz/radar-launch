import { Schema, model } from 'mongoose';

export type Sponsor = {
    logo: string;
    name: string;
    contribution: number;
};

export interface IPool {
    title: string;
    subtitle: string;
    description: string;
    pool_amount: number;
    sponsors: Sponsor[];
    video: string;
}

const poolSchema = new Schema<IPool>(
    {
        title: {
            type: String,
            required: true
        },
        subtitle: {
            type: String
        },
        description: {
            type: String
        },
        pool_amount: {
            type: Number
        },
        sponsors: [
            new Schema(
                {
                    logo: {
                        type: String
                    },
                    name: {
                        type: String
                    },
                    contribution: {
                        type: String
                    }
                },
                { _id: false }
            )
        ],
        video: {
            type: String
        }
    },
    { timestamps: true }
);

const Pool = model<IPool>('Pool', poolSchema, 'pools');

export default Pool;
