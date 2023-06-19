import { Schema, model } from 'mongoose';

export interface IFounder {
    name: string;
    profile?: string;
    eth_address: string;
    email: string;
}

const founderSchema = new Schema<IFounder>({
    name: {
        type: String,
        required: true
    },
    profile: String,
    eth_address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const Founder = model<IFounder>('Founder', founderSchema, 'founders');

export default Founder;
