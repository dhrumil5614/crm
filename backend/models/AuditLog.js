const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for failed logins or system actions
    },
    action: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    resource: {
        type: String, // e.g., 'Form', 'User', 'Auth'
        required: true,
        trim: true
    },
    resourceId: {
        type: String, // Store as string for flexibility
        default: null
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // JSON object for extra metadata
        default: {}
    },
    ip: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'WARNING'],
        default: 'SUCCESS'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 90 // Auto-delete after 90 days (Compliance)
    }
});

// Index for fast searching
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
