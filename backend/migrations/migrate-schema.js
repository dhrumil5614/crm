/**
 * Database Migration Script
 * 
 * WARNING: This script will DROP the existing forms collection and create a fresh one.
 * ALL EXISTING DATA WILL BE PERMANENTLY DELETED.
 * 
 * Make sure to backup your database before running this in production!
 * 
 * Usage:
 *   node migrations/migrate-schema.js [--dry-run] [--backup]
 * 
 * Options:
 *   --dry-run: Show what would be done without actually doing it
 *   --backup: Create a JSON backup of existing forms before migration
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Form = require('../models/Form');

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldBackup = args.includes('--backup');

const BACKUP_DIR = path.join(__dirname, 'backups');

async function connectDB() {
    try {
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function backupForms() {
    if (!shouldBackup) {
        console.log('⏭️  Skipping backup (use --backup flag to create one)');
        return null;
    }

    try {
        console.log('📦 Creating backup of existing forms...');

        // Ensure backup directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        // Fetch all forms
        const forms = await Form.find({}).lean();
        console.log(`   Found ${forms.length} forms to backup`);

        if (forms.length === 0) {
            console.log('   No forms to backup');
            return null;
        }

        // Create backup file with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(BACKUP_DIR, `forms-backup-${timestamp}.json`);

        fs.writeFileSync(backupFile, JSON.stringify(forms, null, 2));
        console.log(`✅ Backup created: ${backupFile}`);

        return backupFile;
    } catch (error) {
        console.error('❌ Error creating backup:', error);
        throw error;
    }
}

async function dropFormsCollection() {
    try {
        console.log('🗑️  Dropping forms collection...');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const formsCollectionExists = collections.some(col => col.name === 'forms');

        if (formsCollectionExists) {
            await mongoose.connection.db.dropCollection('forms');
            console.log('✅ Forms collection dropped');
        } else {
            console.log('   Forms collection does not exist, nothing to drop');
        }
    } catch (error) {
        if (error.message.includes('ns not found')) {
            console.log('   Forms collection does not exist, nothing to drop');
        } else {
            throw error;
        }
    }
}

async function verifyNewSchema() {
    try {
        console.log('🔍 Verifying new schema...');

        // Try to create a test form to verify schema
        const testFormData = {
            userId: new mongoose.Types.ObjectId(),
            customerName: 'Test Customer',
            mobileNumber: '1234567890',
            product: 'Business Loan',
            agentName: 'Test Agent',
            agentId: new mongoose.Types.ObjectId().toString()
        };

        const testForm = new Form(testFormData);
        const validationError = testForm.validateSync();

        if (validationError) {
            console.error('❌ Schema validation failed:', validationError);
            return false;
        }

        console.log('✅ New schema is valid');
        console.log('\n📋 Schema includes the following new fields:');
        console.log('   - product (replaces loanType)');
        console.log('   - mainSource, leadId, companyName');
        console.log('   - alternateNumber, loanAmount');
        console.log('   - state, inFutureMonth');
        console.log('   - businessType, propertyType');
        console.log('   - cbil, turnOverMonthly, collateral');
        console.log('   - stage, campaign');
        console.log('   - status, category, asmStatus');
        console.log('   - bestDispo, leadCreatedVertical, dataReceivedDate');

        return true;
    } catch (error) {
        console.error('❌ Error verifying schema:', error);
        return false;
    }
}

async function migrate() {
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE SCHEMA MIGRATION');
    console.log('='.repeat(60) + '\n');

    if (isDryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');
    } else {
        console.log('⚠️  LIVE MODE - Database will be modified!\n');
    }

    await connectDB();

    try {
        // Step 1: Get current stats
        const currentCount = await Form.countDocuments();
        console.log(`📊 Current forms count: ${currentCount}`);

        // Step 2: Backup if requested
        if (!isDryRun) {
            await backupForms();
        } else {
            console.log('⏭️  Skipping backup (dry run mode)');
        }

        // Step 3: Drop collection
        if (!isDryRun) {
            await dropFormsCollection();
        } else {
            console.log('⏭️  Would drop forms collection (dry run mode)');
        }

        // Step 4: Verify new schema
        const schemaValid = await verifyNewSchema();
        if (!schemaValid) {
            console.error('\n❌ Migration aborted due to schema validation errors');
            process.exit(1);
        }

        console.log('\n' + '='.repeat(60));
        if (isDryRun) {
            console.log('✅ DRY RUN COMPLETE - No changes were made');
            console.log('   Run without --dry-run to perform actual migration');
        } else {
            console.log('✅ MIGRATION COMPLETE');
            console.log('   The forms collection has been reset with the new schema');
            console.log('   You can now start using the application with the new fields');
        }
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run migration
migrate().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
