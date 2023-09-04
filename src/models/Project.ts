import { Schema, model, Types, Model, HydratedDocument } from 'mongoose';
import { retrieveVideoThumbnail } from '../util/regex';
import ProjectSupporter from './ProjectSupporter';
import ProjectUpdate from './ProjectUpdate';
import UserVote from './UserVote';
import { ArrayType } from '../globals';
import {
    AlchemyAPI,
    ProjectContractAddress,
    getEditions,
    getLogs
} from '../util/alchemy';
import User, { UserDocument } from './User';

export enum ProjectStatus {
    'In Review',
    'Approved',
    'Live',
    'Building',
    'Rejected',
    'Cancelled'
}

export interface IProject {
    title: string;
    pool: Types.ObjectId;
    founder: Types.ObjectId;
    description: string;
    thumbnail?: string;
    video_url: string;
    tldr: string;
    brief: string;
    tags: string[];
    inspiration: string;
    team: { name: string; bio?: string; email: string }[];
    collaborators?: string;
    waitlist: boolean;
    milestones: { amount: string; text: string }[];
    edition_price: number;
    mint_end_date: string; // ISO Datestring
    benefits: { amount: number; text: string }[];
    admin_address: string;
    supporter_count: number;
    vote_count: number;
    status: ProjectStatus;
    launched_at: string; // ISO Datestring
    curation: {
        start: string; // ISO Datestring
        end: string; // ISO Datestring
    };
    nftTokenCache?: string;
    lastSupporterUpdate?: string;
}

export interface IProjectMethods {
    getUrl(): string;
    getEmails(): string[];
    getNFTOwners(): Promise<(UserDocument | string)[]>;
    getBelievers(): Promise<(UserDocument | string)[]>;
    updateSupporterCount(args: {
        believerCount?: number;
        supporterCount?: number;
    }): Promise<void>;
}

// Create a new Model type that knows about IUserMethods...
export interface ProjectModel extends Model<IProject, object, IProjectMethods> {
    cacheNFTTokens(): ReturnType<ProjectModel['bulkWrite']>;
}
export type ProjectDocument = HydratedDocument<IProject, IProjectMethods>;

const projectSchema = new Schema<IProject, ProjectModel, IProjectMethods>(
    {
        title: {
            type: String,
            required: true
        },
        pool: {
            type: Schema.Types.ObjectId,
            ref: 'Pool'
        },
        founder: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        description: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            get: function (val: string) {
                const tthis = this as IProject;
                return val ?? retrieveVideoThumbnail(tthis.video_url);
            }
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
            required: true
        },
        tags: [String],
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
                { _id: false }
            )
        ],
        collaborators: String,
        waitlist: {
            type: Boolean,
            required: true,
            default: false
        },
        milestones: [
            new Schema(
                {
                    amount: { type: String, required: true },
                    text: { type: String, required: true }
                },
                { _id: false }
            )
        ],
        edition_price: {
            type: Number,
            required: true
        },
        mint_end_date: {
            type: String, // ISO Datestring
            required: true
        },
        benefits: [
            new Schema(
                {
                    amount: { type: Number, required: true },
                    text: { type: String, required: true }
                },
                { _id: false }
            )
        ],
        admin_address: {
            type: String,
            required: true
        },
        supporter_count: {
            type: Number,
            required: true,
            default: 0
        },
        vote_count: {
            type: Number,
            required: true,
            default: 0
        },
        status: {
            type: Number,
            required: true,
            emum: [0, 1, 2, 3, 4, 5],
            default: 0
        },
        launched_at: {
            type: String // ISO Datestring
        },
        curation: new Schema(
            {
                start: String, // ISO Datestring
                end: String // ISO Datestring
            },
            { _id: false }
        ),
        nftTokenCache: String,
        lastSupporterUpdate: String
    },
    { timestamps: true, toJSON: { getters: true } }
);

projectSchema.method('getUrl', function () {
    return `https://radarlaunch.app/project/${this._id}`;
});

projectSchema.method('getEmails', function () {
    return this.team.map((x: ArrayType<IProject['team']>) => x.email);
});

projectSchema.method('getNFTOwners', async function () {
    if (!this.nftTokenCache) return [];
    const addresses = (await AlchemyAPI.nft
        .getOwnersForNft(ProjectContractAddress, this.nftTokenCache)
        .then((r) => r.owners)) as string[];
    const users = await User.findManyByAuth(addresses);
    return addresses.map(
        (addr) =>
            users.find((u) =>
                u.wallets.find(
                    (w) => w.address?.toLowerCase() === addr.toLowerCase()
                )
            ) ?? addr
    ) as (UserDocument | string)[];
});

projectSchema.method('getBelievers', async function () {
    if (!this.nftTokenCache) return [];
    const addresses = (await getLogs(this.nftTokenCache).then((logs) =>
        logs.map((x) => x.args.believer)
    )) as string[];

    const users = await User.findManyByAuth(addresses);
    return [...new Set(addresses).values()].map(
        (addr) =>
            users.find((u) =>
                u.wallets.find(
                    (w) => w.address?.toLowerCase() === addr.toLowerCase()
                )
            ) ?? addr
    ) as (UserDocument | string)[];
});

projectSchema.method(
    'updateSupporterCount',
    async function (args: { believerCount?: number; supporterCount?: number }) {
        let { believerCount, supporterCount } = args;
        if (!believerCount)
            believerCount = await this.getBelievers().then(
                (x: unknown[]) => x.length
            );

        if (!supporterCount)
            supporterCount = await ProjectSupporter.find({
                project: this._id
            }).then((x) => x.length);

        this.supporter_count = (believerCount || 0) + (believerCount || 0);
        this.lastSupporterUpdate = new Date().toISOString();
        return this.save();
    }
);

projectSchema.static('cacheNFTTokens', async function () {
    const editions = await getEditions();
    return Project.bulkWrite(
        editions.map((x) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(x.id) },
                update: { $set: { nftTokenCache: x.tokenId } }
            }
        }))
    );
});

projectSchema.post(
    'deleteOne',
    { query: false, document: true, errorHandler: false },
    async function () {
        const s = { project: this._id };
        await Promise.all([
            ProjectSupporter.deleteMany(s),
            ProjectUpdate.deleteMany(s),
            UserVote.deleteMany(s)
        ]);
    }
);

const Project = model<IProject, ProjectModel>(
    'Project',
    projectSchema,
    'projects'
);

export default Project;
