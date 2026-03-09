import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        // Remove existing if any
        await User.deleteMany({ email: 'kaviya18@gmail.com' });

        // Seed admin user
        const adminUser = new User({
            name: 'Kaviya Admin',
            email: 'kaviya18@gmail.com',
            password: '18032004',
            role: 'admin',
            skillLevel: 'Advanced',
        });

        await adminUser.save();
        console.log('Admin user seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
