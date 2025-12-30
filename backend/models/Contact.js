const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    // Name
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },

    // Relationship
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true // Contacts should generally belong to an account
    },
    title: String,
    department: String,

    // Communication
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: String,
    mobile: String,

    // Functional
    leadSource: {
        type: String,
        enum: ['Web', 'Referral', 'Call Center', 'Partner', 'Trade Show', 'Other']
    },

    // Address (Mailing)
    mailingAddress: {
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

    // Tracking
    lastContacted: Date,
    doNotCall: { type: Boolean, default: false },
    emailOptOut: { type: Boolean, default: false }

}, {
    timestamps: true
});

// Compound index to prevent duplicate contacts within same account? 
// Or just globally unique email? Usually email is unique per person.
contactSchema.index({ email: 1 });
contactSchema.index({ account: 1 });
contactSchema.index({ firstName: 'text', lastName: 'text' });

module.exports = mongoose.model('Contact', contactSchema);
