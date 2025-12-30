const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { protect } = require('../middleware/auth');
const { audit } = require('../middleware/auditLogger');
const { Roles } = require('../config/roles');

// @route   POST /api/accounts
// @desc    Create a new account
// @access  Private
router.post('/', protect, audit('CREATE_ACCOUNT', 'Account'), async (req, res) => {
    try {
        const accountData = { ...req.body, owner: req.user._id };
        const account = await Account.create(accountData);
        res.status(201).json({ success: true, data: account });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/accounts
// @desc    Get all accounts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // Admin/Supervisor sees all, User sees own (Simple logic for now)
        const query = req.user.role === Roles.ADMIN ? {} : { owner: req.user._id };

        // Add text search
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        const accounts = await Account.find(query).populate('owner', 'name');
        res.status(200).json({ success: true, count: accounts.length, data: accounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/accounts/:id
// @desc    Get single account
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const account = await Account.findById(req.params.id).populate('owner', 'name');
        if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
        res.status(200).json({ success: true, data: account });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
