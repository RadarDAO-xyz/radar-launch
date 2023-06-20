import { Schema, model } from 'mongoose';

export interface IUser {
    name: string;
    profile?: string;
    eth_address: string;
    email: string;
}

const userSchema = new Schema<IUser>({
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

const User = model<IUser>('User', userSchema, 'users');

export default User;
