const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Account = require('./models/Account');
const Contact = require('./models/Contact');
const Opportunity = require('./models/Opportunity');
const User = require('./models/User'); // Dependency
const AuditLog = require('./models/AuditLog'); // Dependency
const Form = require('./models/Form'); // Dependency

const verifyModels = () => {
    try {
        console.log('Verifying Schemas...');

        // Check Lead Fields
        const leadPaths = Lead.schema.paths;
        if (!leadPaths['companyName'] || !leadPaths['status'] || !leadPaths['owner']) {
            throw new Error('Lead schema missing critical fields');
        }
        console.log('✅ Lead Model Verified');

        // Check Account Fields
        const accountPaths = Account.schema.paths;
        if (!accountPaths['name'] || !accountPaths['industry'] || !accountPaths['billingAddress.city']) {
            throw new Error('Account schema missing critical fields');
        }
        console.log('✅ Account Model Verified');

        // Check Opportunity Fields
        const oppPaths = Opportunity.schema.paths;
        if (!oppPaths['amount'] || !oppPaths['stage'] || !oppPaths['account']) {
            throw new Error('Opportunity schema missing critical fields');
        }
        console.log('✅ Opportunity Model Verified');

        console.log('All Models Loaded Successfully.');
    } catch (error) {
        console.error('❌ Model Verification Failed:', error.message);
        process.exit(1);
    }
};

verifyModels();
