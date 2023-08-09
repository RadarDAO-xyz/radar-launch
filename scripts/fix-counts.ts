import '../src/globals';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import Project from '../src/models/Project';
config();

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
    await Project.aggregate([
        {
            $lookup: {
                from: 'projects.supporters',
                localField: '_id',
                foreignField: 'project',
                as: 'supporters'
            }
        },
        {
            $lookup: {
                from: 'users.votes',
                localField: '_id',
                foreignField: 'project',
                as: 'votes'
            }
        },
        {
            $set: {
                supporter_count: {
                    $size: '$supporters'
                }
            }
        },
        {
            $set: {
                vote_count: {
                    $size: '$votes'
                }
            }
        },
        {
            $unset: 'supporters'
        },
        {
            $unset: 'votes'
        },
        {
            $out: 'projects'
        }
    ]);
    await mongoose.disconnect();
    console.log('Done! Fixed supporter and vote counts');
}

main();
