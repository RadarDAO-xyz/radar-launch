import { Schema, model } from 'mongoose';

export interface IUser {
    name: string;
    profile?: string;
    wallet_address: string;
    email?: string;
    session_cookie: string;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        default: 'Your name'
    },
    profile: String,
    wallet_address: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String
    },
    session_cookie: String
});

const User = model<IUser>('User', userSchema, 'users');

export default User;
