import { HydratedDocument, Model, Schema, model } from 'mongoose';

export type Wallet = {
    type: string;
};

export type SocialLoginWallet = {
    public_key: string;
    curve: string;
} & Wallet;

export type ExternalWallet = {
    address: string;
} & Wallet;

export type WalletResolvable = SocialLoginWallet | ExternalWallet;

export interface IUser {
    name: string;
    profile?: string;
    bio?: string;
    socials?: string;
    wallets: WalletResolvable[];
    email?: string;
}

interface UserModel extends Model<IUser> {
    findByAuth(name: string): Promise<HydratedDocument<IUser>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userSchema = new Schema<IUser, UserModel>(
    {
        name: {
            type: String,
            required: true,
            default: 'Your name'
        },
        profile: String,
        bio: String,
        socials: String,
        wallets: [
            new Schema(
                {
                    type: String,
                    public_key: String,
                    curve: String,
                    address: String
                },
                { _id: false }
            )
        ],
        email: {
            type: String
        }
    },
    { timestamps: true }
);

userSchema.method('toJSON', function () {
    return {
        _id: this._id,
        name: this.name,
        profile: this.profile,
        bio: this.bio,
        socials: this.socials
    };
});

userSchema.static('findByAuth', async function (tokenId: string) {
    return User.findOne({
        $or: [
            {
                'wallets.address': {
                    $eq: tokenId
                }
            },
            {
                'wallets.public_key': {
                    $eq: tokenId
                }
            }
        ]
    });
});

const User = model<IUser, UserModel>('User', userSchema, 'users');

export default User;
