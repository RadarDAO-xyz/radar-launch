import { Schema, Types, model } from 'mongoose';

interface IUserToken {
    user: Types.ObjectId;
    token: string;
}

const userTokenSchema = new Schema<IUserToken>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        token: {
            type: String,
            required: true,
            unique: true
        }
    },
    { timestamps: true }
);

const UserToken = model<IUserToken>(
    'UserToken',
    userTokenSchema,
    'users.tokens'
);

export default UserToken;
