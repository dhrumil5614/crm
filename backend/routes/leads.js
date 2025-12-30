const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { audit } = require('../middleware/auditLogger');
const Permissions = require('../config/permissions');
const { Roles } = require('../config/roles');

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private (Permission: LEAD_CREATE)
router.post(
    '/',
    protect,
    checkPermission(Permissions.LEAD_CREATE),
    audit('CREATE_LEAD', 'Lead'),
    [
        body('firstName').trim().notEmpty().withMessage('First Name is required'),
        body('lastName').trim().notEmpty().withMessage('Last Name is required'),
        body('companyName').trim().notEmpty().withMessage('Company Name is required'),
        body('phone').trim().notEmpty().withMessage('Phone is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const leadData = {
                ...req.body,
                owner: req.user._id, // Default owner is creator
                createdBy: req.user._id
            };

            const lead = await Lead.create(leadData);

            res.status(201).json({
                success: true,
                data: lead
            });
        } catch (error) {
            console.error('Create Lead Error:', error);
            res.status(500).json({ success: false, message: 'Server error', error: error.message });
        }
    }
);

// @route   GET /api/leads
// @desc    Get all leads (Filtered by RBAC)
// @access  Private
router.get(
    '/',
    protect,
    async (req, res) => {
        try {
            let query = {};

            const hasViewAll = req.user.permissions.includes(Permissions.LEAD_READ_ALL) || req.user.role === Roles.ADMIN;

            // If not admin/authorized to view all, only show own leads
            if (!hasViewAll) {
                query.owner = req.user._id;
            }

            // Query String Filters
            if (req.query.status) query.status = req.query.status;
            if (req.query.rating) query.rating = req.query.rating;
            if (req.query.search) {
                query.$text = { $search: req.query.search };
            }

            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const skip = (page - 1) * limit;

            const leads = await Lead.find(query)
                .populate('owner', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Lead.countDocuments(query);

            res.status(200).json({
                success: true,
                count: leads.length,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                data: leads
            });
        } catch (error) {
            console.error('Get Leads Error:', error);
            res.status(500).json({ success: false, message: 'Server error', error: error.message });
        }
    }
);

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get(
    '/:id',
    protect,
    async (req, res) => {
        try {
            const lead = await Lead.findById(req.params.id).populate('owner', 'name email');

            if (!lead) {
                return res.status(404).json({ success: false, message: 'Lead not found' });
            }

            // Check access
            const hasViewAll = req.user.permissions.includes(Permissions.LEAD_READ_ALL) || req.user.role === Roles.ADMIN;
            if (!hasViewAll && lead.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this lead' });
            }

            res.status(200).json({
                success: true,
                data: lead
            });
        } catch (error) {
            console.error('Get Lead Error:', error);
            res.status(500).json({ success: false, message: 'Server error', error: error.message });
        }
    }
);

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Private
router.put(
    '/:id',
    protect,
    audit('UPDATE_LEAD', 'Lead'),
    async (req, res) => {
        try {
            let lead = await Lead.findById(req.params.id);

            if (!lead) {
                return res.status(404).json({ success: false, message: 'Lead not found' });
            }

            // Check Permissions
            const isAdmin = req.user.role === Roles.ADMIN;
            const hasUpdateAll = req.user.permissions.includes(Permissions.LEAD_UPDATE_ALL);
            const isOwner = lead.owner.toString() === req.user._id.toString();
            const hasUpdateOwn = req.user.permissions.includes(Permissions.LEAD_UPDATE_OWN);

            if (!isAdmin && !hasUpdateAll && !(isOwner && hasUpdateOwn)) {
                return res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
            }

            lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });

            res.status(200).json({
                success: true,
                data: lead
            });
        } catch (error) {
            console.error('Update Lead Error:', error);
            res.status(500).json({ success: false, message: 'Server error', error: error.message });
        }
    }
);

module.exports = router;
