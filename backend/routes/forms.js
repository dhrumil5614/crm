const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Form = require('../models/Form');
const { protect } = require('../middleware/auth');

// @route   POST /api/forms
// @desc    Create a new form entry
// @access  Private
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isIn(['Sales', 'Support', 'Marketing', 'HR', 'Other']).withMessage('Invalid category')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    try {
      const { title, description, category, priority } = req.body;

      const form = await Form.create({
        userId: req.user._id,
        title,
        description,
        category,
        priority: priority || 'Medium',
        status: 'pending'
      });

      // Populate user information
      await form.populate('userId', 'name email');

      res.status(201).json({
        success: true,
        message: 'Form submitted successfully and is pending approval',
        form
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   GET /api/forms
// @desc    Get all forms for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const forms = await Form.find(query)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: forms.length,
      forms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/forms/:id
// @desc    Get single form by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user is authorized to view this form
    if (form.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this form'
      });
    }

    res.status(200).json({
      success: true,
      form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/forms/:id
// @desc    Delete form (only if pending)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user owns the form
    if (form.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this form'
      });
    }

    // Only allow deletion if form is pending
    if (form.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a form that has been reviewed'
      });
    }

    await form.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
