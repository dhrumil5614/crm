const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');
const dotenv = require('dotenv');

dotenv.config();

const verifyAudit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Create a test log
        const testLog = await AuditLog.create({
            action: 'TEST_ACTION',
            resource: 'TestResource',
            details: { message: 'Verification Test' },
            status: 'SUCCESS'
        });

        console.log('Test Log Created:', testLog._id);

        // Retrieve it
        const logs = await AuditLog.find({ action: 'TEST_ACTION' });
        console.log(`Found ${logs.length} logs with action TEST_ACTION`);

        if (logs.length > 0) {
            console.log('✅ Audit Logging System Vefified');
        } else {
            console.log('❌ Audit Logging Verification Failed');
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

verifyAudit();
