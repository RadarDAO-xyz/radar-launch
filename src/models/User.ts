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

export type WalletResolvable = Partial<SocialLoginWallet> &
    Partial<ExternalWallet> &
    Wallet;

export interface IUser {
    name: string;
    profile?: string;
    bio?: string;
    socials?: string;
    wallets: WalletResolvable[];
    email?: string;
    bypasser: boolean;
    did?: string;
}

interface UserModel extends Model<IUser> {
    findByDidOrAuth(
        did: string,
        wallets: string[]
    ): Promise<HydratedDocument<IUser>> | null;
    findByAuth(idToken: string): Promise<HydratedDocument<IUser>> | null;
    findManyByAuth(idTokens: string[]): Promise<HydratedDocument<IUser>[]> | [];
}

export type UserDocument = HydratedDocument<IUser>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userSchema = new Schema<IUser, UserModel>(
    {
        name: {
            type: String,
            required: true,
            default: function () {
                return (
                    (this as UserDocument).wallets.find((w) => w.address)
                        ?.address || 'Your name'
                );
            }
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
        email: String,
        bypasser: { type: Boolean, default: false, immutable: true },
        did: String
    },
    { timestamps: true }
);

userSchema.method('toJSON', function () {
    return {
        _id: this._id,
        name: this.name,
        profile: this.profile,
        bio: this.bio,
        socials: this.socials,
        wallets: this.wallets
            .map((w: WalletResolvable) => w.address)
            .filter((x: string | undefined) => x),
        did: this.did
    };
});

userSchema.pre('save', function () {
    this.wallets.forEach((wallet) => {
        if (wallet.address) wallet.address = wallet.address.toUpperCase();
    });
});

userSchema.static(
    'findByDidOrAuth',
    async function (did: string, addresses: string[]) {
        return User.findOne({
            $or: [
                {
                    did: {
                        $eq: did
                    }
                },
                {
                    'wallets.address': {
                        $in: addresses.map((x) => x.toUpperCase())
                    }
                }
            ]
        });
    }
);

userSchema.static('findByAuth', async function (tokenId: string) {
    return User.findOne({
        $or: [
            {
                'wallets.address': {
                    $eq: tokenId.toUpperCase()
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

userSchema.static('findManyByAuth', async function (tokenIds: string[]) {
    return User.find({
        $or: [
            {
                'wallets.address': {
                    $in: tokenIds.map((x) => x.toUpperCase())
                }
            },
            {
                'wallets.public_key': {
                    $in: tokenIds.map((x) => x.toUpperCase())
                }
            }
        ]
    });
});

const User = model<IUser, UserModel>('User', userSchema, 'users');

export default User;
