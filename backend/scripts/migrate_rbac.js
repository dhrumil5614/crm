const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const { RolePermissions, Roles } = require('../config/roles');

dotenv.config();

const migrateRBAC = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Found ${users.length} users to migrate.`);

        for (const user of users) {
            let permissions = [];

            if (user.role === 'admin') {
                permissions = RolePermissions[Roles.ADMIN];
            } else {
                // Default to user permissions
                permissions = RolePermissions[Roles.USER];
            }

            // Update user
            user.permissions = permissions;
            await user.save();
            console.log(`Migrated user: ${user.email} (${user.role})`);
        }

        console.log('✅ RBAC Migration Complete');
        process.exit();
    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

migrateRBAC();
