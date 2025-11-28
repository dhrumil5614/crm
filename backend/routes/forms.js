const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Form = require('../models/Form');
const { protect } = require('../middleware/auth');
const XLSX = require('xlsx');

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
      .populate('remarks.userId', 'name email role')
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
      .populate('reviewedBy', 'name email')
      .populate('remarks.userId', 'name email role');

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

// @route   POST /api/forms/:id/remarks
// @desc    Add a remark to a form
// @access  Private
router.post(
  '/:id/remarks',
  protect,
  [
    body('message').trim().notEmpty().withMessage('Remark message is required')
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

      // Check if user is authorized (form owner or admin)
      if (form.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to add remarks to this form'
        });
      }

      // Add remark
      form.remarks.unshift({
        userId: req.user._id,
        message: req.body.message,
        createdAt: new Date()
      });

      await form.save();

      // Populate the remarks with user info
      await form.populate('remarks.userId', 'name email role');
      await form.populate('userId', 'name email');
      await form.populate('reviewedBy', 'name email');

      res.status(201).json({
        success: true,
        message: 'Remark added successfully',
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

// @route   GET /api/forms/:id/remarks
// @desc    Get remarks for a form with optional date range filtering
// @access  Private
router.get('/:id/remarks', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id)
      .populate('remarks.userId', 'name email role')
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user is authorized
    if (form.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access remarks for this form'
      });
    }

    let remarks = form.remarks;

    // Filter by date range if provided
    const { startDate, endDate } = req.query;
    if (startDate || endDate) {
      remarks = remarks.filter(remark => {
        const remarkDate = new Date(remark.createdAt);
        if (startDate && endDate) {
          return remarkDate >= new Date(startDate) && remarkDate <= new Date(endDate);
        } else if (startDate) {
          return remarkDate >= new Date(startDate);
        } else if (endDate) {
          return remarkDate <= new Date(endDate);
        }
        return true;
      });
    }

    // Sort by newest first
    remarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: remarks.length,
      remarks,
      form: {
        _id: form._id,
        title: form.title,
        status: form.status
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

// @route   GET /api/forms/:id/export
// @desc    Download form with remarks as Excel
// @access  Private
router.get('/:id/export', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('remarks.userId', 'name email role');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user is authorized
    if (form.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to export this form'
      });
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Form Details Sheet
    const formData = [
      ['Form ID', form._id.toString()],
      ['Title', form.title],
      ['Description', form.description],
      ['Category', form.category],
      ['Priority', form.priority],
      ['Status', form.status.toUpperCase()],
      ['Submitted By', form.userId.name],
      ['Submitted Email', form.userId.email],
      ['Submitted At', new Date(form.createdAt).toLocaleString()],
      [''],
      ['Review Status', ''],
      ['Reviewed By', form.reviewedBy ? form.reviewedBy.name : 'N/A'],
      ['Reviewed At', form.reviewedAt ? new Date(form.reviewedAt).toLocaleString() : 'N/A'],
      ['Review Comment', form.reviewComment || 'N/A']
    ];

    const formSheet = XLSX.utils.aoa_to_sheet(formData);
    XLSX.utils.book_append_sheet(workbook, formSheet, 'Form Details');

    // Remarks Sheet (sorted newest to oldest)
    const sortedRemarks = [...form.remarks].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    const remarksData = [
      ['Date & Time', 'Posted By', 'Role', 'Message']
    ];

    sortedRemarks.forEach(remark => {
      remarksData.push([
        new Date(remark.createdAt).toLocaleString(),
        remark.userId.name,
        remark.userId.role.toUpperCase(),
        remark.message
      ]);
    });

    const remarksSheet = XLSX.utils.aoa_to_sheet(remarksData);
    XLSX.utils.book_append_sheet(workbook, remarksSheet, 'Remarks');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Form_${form._id}_${Date.now()}.xlsx`);

    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
