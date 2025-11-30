const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Form = require('../models/Form');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/forms
// @desc    Get all forms (for admin)
// @access  Private/Admin
router.get('/forms', async (req, res) => {
  try {
    const { status } = req.query;

    // Build query
    const query = {};
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

// @route   GET /api/admin/forms/pending
// @desc    Get all pending forms
// @access  Private/Admin
router.get('/forms/pending', async (req, res) => {
  try {
    const forms = await Form.find({ status: 'pending' })
      .populate('userId', 'name email')
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

// @route   PUT /api/admin/forms/:id/approve
// @desc    Approve a form
// @access  Private/Admin
router.put(
  '/forms/:id/approve',
  [
    body('reviewComment').optional().trim(),
    body('asmName').optional().trim(),
    body('asmContactNo').optional().trim(),
    body('asmEmailId').optional().trim().isEmail().withMessage('Please provide a valid ASM email'),
    body('city').optional().trim(),
    body('areaName').optional().trim(),
    body('supervisorRemark').optional().trim()
  ],
  async (req, res) => {
    try {
      const form = await Form.findById(req.params.id);

      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }

      if (form.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Form has already been reviewed'
        });
      }

      // Auto-generate supervisor info from logged-in admin
      const supervisorName = req.user.name;
      const supervisorId = req.user._id.toString();

      form.status = 'approved';
      form.reviewedBy = req.user._id;
      form.reviewedAt = Date.now();
      form.reviewComment = req.body.reviewComment || 'Approved';

      // Set supervisor fields
      form.supervisorName = supervisorName;
      form.supervisorId = supervisorId;
      form.asmName = req.body.asmName || '';
      form.asmContactNo = req.body.asmContactNo || '';
      form.asmEmailId = req.body.asmEmailId || '';
      form.city = req.body.city || '';
      form.areaName = req.body.areaName || '';
      form.supervisorRemark = req.body.supervisorRemark || '';

      await form.save();
      await form.populate('userId', 'name email');
      await form.populate('reviewedBy', 'name email');

      res.status(200).json({
        success: true,
        message: 'Form approved successfully',
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

// @route   PUT /api/admin/forms/:id/reject
// @desc    Reject a form
// @access  Private/Admin
router.put(
  '/forms/:id/reject',
  [
    body('reviewComment').trim().notEmpty().withMessage('Review comment is required for rejection'),
    body('asmName').optional().trim(),
    body('asmContactNo').optional().trim(),
    body('asmEmailId').optional().trim().isEmail().withMessage('Please provide a valid ASM email'),
    body('city').optional().trim(),
    body('areaName').optional().trim(),
    body('supervisorRemark').optional().trim()
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
      const form = await Form.findById(req.params.id);

      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }

      if (form.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Form has already been reviewed'
        });
      }

      // Auto-generate supervisor info from logged-in admin
      const supervisorName = req.user.name;
      const supervisorId = req.user._id.toString();

      form.status = 'rejected';
      form.reviewedBy = req.user._id;
      form.reviewedAt = Date.now();
      form.reviewComment = req.body.reviewComment;

      // Set supervisor fields
      form.supervisorName = supervisorName;
      form.supervisorId = supervisorId;
      form.asmName = req.body.asmName || '';
      form.asmContactNo = req.body.asmContactNo || '';
      form.asmEmailId = req.body.asmEmailId || '';
      form.city = req.body.city || '';
      form.areaName = req.body.areaName || '';
      form.supervisorRemark = req.body.supervisorRemark || '';

      await form.save();
      await form.populate('userId', 'name email');
      await form.populate('reviewedBy', 'name email');

      res.status(200).json({
        success: true,
        message: 'Form rejected successfully',
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

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalForms = await Form.countDocuments();
    const pendingForms = await Form.countDocuments({ status: 'pending' });
    const approvedForms = await Form.countDocuments({ status: 'approved' });
    const rejectedForms = await Form.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      stats: {
        total: totalForms,
        pending: pendingForms,
        approved: approvedForms,
        rejected: rejectedForms
      }
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
