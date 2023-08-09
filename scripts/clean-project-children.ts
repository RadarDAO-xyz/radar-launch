import '../src/globals';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import ProjectSupporter from '../src/models/ProjectSupporter';
import ProjectUpdate from '../src/models/ProjectUpdate';
config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agg = (model: mongoose.Model<any>) =>
    model.aggregate([
        {
            $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'projects'
            }
        },
        {
            $match: {
                'projects.0': {
                    $exists: true
                }
            }
        },
        {
            $unset: 'projects'
        },
        {
            $out: model.collection.name
        }
    ]);

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
    await Promise.all([agg(ProjectSupporter), agg(ProjectUpdate)]);
    await mongoose.disconnect();
    console.log('Done! Cleaned ProjectSupporters and ProjectUpdates');
}

main();
