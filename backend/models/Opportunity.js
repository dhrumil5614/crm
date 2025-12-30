const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    // Core Info
    name: {
        type: String,
        required: [true, 'Opportunity name is required'],
        trim: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    primaryContact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },

    // Deal metrics
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    closeDate: {
        type: Date,
        required: true
    },

    // Pipeline
    stage: {
        type: String,
        enum: [
            'Prospecting',
            'Qualification',
            'Needs Analysis',
            'Value Proposition',
            'Id. Decision Makers',
            'Perception Analysis',
            'Proposal/Price Quote',
            'Negotiation/Review',
            'Closed Won',
            'Closed Lost'
        ],
        default: 'Prospecting',
        required: true
    },
    type: {
        type: String,
        enum: ['New Business', 'Existing Business', 'Upgrade', 'Replacement'],
        default: 'New Business'
    },
    probability: {
        type: Number, // Percentage 0-100
        default: 10
    },

    // Source
    leadSource: String,

    // Ownership
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    description: String,
    nextStep: String

}, {
    timestamps: true
});

opportunitySchema.index({ account: 1 });
opportunitySchema.index({ owner: 1 });
opportunitySchema.index({ stage: 1 });
opportunitySchema.index({ closeDate: 1 });
opportunitySchema.index({ name: 'text' });

module.exports = mongoose.model('Opportunity', opportunitySchema);
