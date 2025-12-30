const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const Permissions = require('../config/permissions');

// @route   GET /api/audit
// @desc    Get audit logs (Admin/Authorized only)
// @access  Private
router.get(
    '/',
    protect,
    checkPermission(Permissions.AUDIT_VIEW),
    async (req, res) => {
        try {
            const { user, action, resource, startDate, endDate, limit = 50, page = 1 } = req.query;

            const query = {};

            if (user) query.user = user;
            if (action) query.action = action;
            if (resource) query.resource = resource;

            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = new Date(startDate);
                if (endDate) query.timestamp.$lte = new Date(endDate);
            }

            const skip = (page - 1) * limit;

            const logs = await AuditLog.find(query)
                .populate('user', 'name email role')
                .sort({ timestamp: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            const total = await AuditLog.countDocuments(query);

            res.status(200).json({
                success: true,
                count: logs.length,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                data: logs
            });
        } catch (error) {
            console.error('Audit Log Fetch Error:', error);
            res.status(500).json({ success: false, message: 'Server error fetching logs' });
        }
    }
);

module.exports = router;
