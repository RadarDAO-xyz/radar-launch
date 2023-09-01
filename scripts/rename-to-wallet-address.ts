import '../src/globals';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User';
config();

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Mongoose connected!');
    const users = await User.find({});
    console.log('Fetched', users.length, 'users');
    let i = 0;
    for (const user of users) {
        if (user.name === 'Your name' && user.wallets.find((x) => x.address)) {
            console.log('Updating user on index', i);
            user.name =
                user.wallets.find((x) => x.address)?.address?.toLowerCase() ||
                'Your name';
        }
        i++;
    }
    console.log('Saving changes...');
    await User.bulkSave(users);
    await mongoose.disconnect();
    console.log('Done! Updated the names!');
}

main();
