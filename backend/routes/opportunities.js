const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { protect } = require('../middleware/auth');
const { audit } = require('../middleware/auditLogger');
const { Roles } = require('../config/roles');

// @route   POST /api/opportunities
// @desc    Create a new opportunity
// @access  Private
router.post('/', protect, audit('CREATE_OPP', 'Opportunity'), async (req, res) => {
    try {
        const oppData = { ...req.body, owner: req.user._id };
        const opportunity = await Opportunity.create(oppData);
        res.status(201).json({ success: true, data: opportunity });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/opportunities
// @desc    Get all opportunities (Pipeline)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === Roles.ADMIN ? {} : { owner: req.user._id };

        if (req.query.stage) query.stage = req.query.stage;

        const opportunities = await Opportunity.find(query)
            .populate('account', 'name')
            .populate('owner', 'name');

        res.status(200).json({ success: true, count: opportunities.length, data: opportunities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/opportunities/:id/stage
// @desc    Update opportunity stage (Drag & Drop)
// @access  Private
router.put('/:id/stage', protect, audit('UPDATE_OPP_STAGE', 'Opportunity'), async (req, res) => {
    try {
        const { stage } = req.body;
        const opportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            { stage },
            { new: true, runValidators: true }
        );

        if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

        res.status(200).json({ success: true, data: opportunity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
