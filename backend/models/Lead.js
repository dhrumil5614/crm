const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    // Basic Info
    firstName: {
        type: String,
        required: [true, 'Please provide first name'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name'],
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    companyName: {
        type: String,
        required: [true, 'Please provide company name'], // Crucial for B2B
        trim: true
    },

    // Contact
    email: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        trim: true
    },
    mobile: {
        type: String,
        trim: true
    },

    // Address
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },

    // Qualification
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Working', 'Qualified', 'Unqualified'],
        default: 'New'
    },
    source: {
        type: String,
        enum: ['Web', 'Referral', 'Call Center', 'Partner', 'Trade Show', 'Other'],
        default: 'Web'
    },
    rating: {
        type: String,
        enum: ['Hot', 'Warm', 'Cold'],
        default: 'Warm'
    },
    industry: {
        type: String,
        trim: true
    },

    // Ownership
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // System
    isConverted: {
        type: Boolean,
        default: false
    },
    convertedAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    convertedContactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },
    convertedOpportunityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity'
    },

    description: String,

    // Custom Fields from original Form
    productInterest: {
        type: String,
        enum: ['Business Loan', 'Machine Loan', 'Solar Loan', 'One loan', 'UBL', 'Other']
    }

}, {
    timestamps: true
});

// Indexes
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ companyName: 'text', firstName: 'text', lastName: 'text' }); // Text search
leadSchema.index({ owner: 1 });
leadSchema.index({ status: 1 });

module.exports = mongoose.model('Lead', leadSchema);
