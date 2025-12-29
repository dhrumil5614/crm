const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@crm.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            // console.log('Admin account already exists');
            return;
        }

        // Create admin
        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            isEmailVerified: true
        });

        console.log(`Admin account created: ${adminEmail} / ${adminPassword}`);
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

module.exports = seedAdmin;
