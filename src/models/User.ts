import { Schema, model } from 'mongoose';

export interface IUser {
    name: string;
    profile?: string;
    bio?: string;
    socials?: string;
    wallet_address: string;
    email?: string;
    session_cookie: string;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            default: 'Your name'
        },
        profile: String,
        bio: String,
        socials: String,
        wallet_address: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String
        },
        session_cookie: String
    },
    { timestamps: true }
);

userSchema.method('toJSON', function () {
    return {
        name: this.name,
        profile: this.profile,
        wallet_address: this.wallet_address
    };
});

const User = model<IUser>('User', userSchema, 'users');

export default User;
