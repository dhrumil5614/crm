const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Account name is required'],
        trim: true,
        unique: true // Prevent duplicate companies
    },
    accountNumber: {
        type: String,
        unique: true
    },

    // Classification
    type: {
        type: String,
        enum: ['Customer', 'Prospect', 'Partner', 'Vendor', 'Competitor', 'Other'],
        default: 'Prospect'
    },
    industry: {
        type: String,
        enum: [
            'Agriculture', 'Apparel', 'Banking', 'Biotechnology', 'Chemicals',
            'Communications', 'Construction', 'Consulting', 'Education',
            'Electronics', 'Energy', 'Engineering', 'Entertainment', 'Finance',
            'Food & Beverage', 'Government', 'Healthcare', 'Hospitality',
            'Insurance', 'Machinery', 'Manufacturing', 'Media', 'Not For Profit',
            'Retail', 'Technology', 'Telecommunications', 'Transportation',
            'Utilities', 'Other'
        ],
        default: 'Other'
    },
    rating: {
        type: String,
        enum: ['Hot', 'Warm', 'Cold'],
        default: 'Warm'
    },
    annualRevenue: Number,
    employees: Number,

    // Contact Info
    phone: String,
    fax: String,
    website: String,

    // Addresses
    billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },

    // Ownership
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    description: String,

    // Parent/Child hierarchy
    parentAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }

}, {
    timestamps: true
});

accountSchema.index({ name: 'text' });
accountSchema.index({ owner: 1 });

module.exports = mongoose.model('Account', accountSchema);
