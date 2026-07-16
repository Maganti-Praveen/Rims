const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Seed Super Admin user
        const existingAdmin = await User.findOne({ role: { $in: ['super_admin', 'admin'] } });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
        } else {
            const admin = await User.create({
                name: 'System Admin',
                employeeId: 'ADMIN001',
                email: 'admin@rcee.ac.in',
                password: 'admin123',
                role: 'super_admin',
                department: 'Administration',
                designation: 'Central Administrator',
            });
            console.log('Super Admin user created successfully:');
            console.log(`  Email: ${admin.email}`);
            console.log('  Password: admin123');
        }

        // Academic years are auto-created on every server startup
        // via utils/autoSeedAcademicYears.js — no manual seeding needed.

        // Score/points system has been removed.
        // Rankings are count-based (number of uploads).

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seed();
