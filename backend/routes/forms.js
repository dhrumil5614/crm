const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Form = require('../models/Form');
const { protect } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// @route   POST /api/forms
// @desc    Create a new form entry
// @access  Private
router.post(
  '/',
  protect,
  [
    body('mobileNumber').trim().notEmpty().withMessage('Mobile number is required'),
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('loanType').isIn(['Home Loan', 'Personal Loan', 'Car Loan', 'Business Loan', 'Education Loan', 'Gold Loan', 'Other']).withMessage('Invalid loan type'),
    body('interestedStatus').isIn(['Yes', 'No']).withMessage('Interested status must be Yes or No')
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
      const { mobileNumber, customerName, loanType, interestedStatus, agentRemarks } = req.body;

      // Auto-generate date and time
      const now = new Date();
      const submissionDate = now;
      const submissionTime = now.toLocaleTimeString('en-US', { hour12: false });

      // Auto-generate agent info from logged-in user
      const agentName = req.user.name;
      const agentId = req.user._id.toString();

      const form = await Form.create({
        userId: req.user._id,
        mobileNumber,
        customerName,
        loanType,
        interestedStatus,
        agentRemarks: agentRemarks || '',
        agentName,
        agentId,
        submissionDate,
        submissionTime,
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

// @route   POST /api/forms/:id/remarks
// @desc    Add a remark to a form
// @access  Private
router.post('/:id/remarks', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check authorization
    if (form.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add remarks to this form'
      });
    }

    const newRemark = {
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message
    };

    form.remarks.unshift(newRemark); // Add to beginning (newest first)
    await form.save();

    res.status(200).json({
      success: true,
      data: form.remarks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/forms/:id/remarks
// @desc    Get remarks for a form with optional date filtering
// @access  Private
router.get('/:id/remarks', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check authorization
    if (form.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view remarks for this form'
      });
    }

    let remarks = form.remarks;

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date

      remarks = remarks.filter(remark => {
        const remarkDate = new Date(remark.createdAt);
        return remarkDate >= start && remarkDate <= end;
      });
    }

    res.status(200).json({
      success: true,
      count: remarks.length,
      data: remarks
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
// @desc    Export form details and remarks to Excel
// @access  Private
router.get('/:id/export', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate('userId', 'name email');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check authorization
    if (form.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to export this form'
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Form Details');

    // Add Form Details
    worksheet.columns = [
      { header: 'Field', key: 'field', width: 20 },
      { header: 'Value', key: 'value', width: 50 }
    ];

    worksheet.addRows([
      { field: 'Form ID', value: form._id.toString() },
      { field: 'Status', value: form.status },
      { field: 'Customer Name', value: form.customerName },
      { field: 'Mobile Number', value: form.mobileNumber },
      { field: 'Loan Type', value: form.loanType },
      { field: 'Interested Status', value: form.interestedStatus },
      { field: 'Agent Name', value: form.agentName },
      { field: 'Submission Date', value: new Date(form.submissionDate).toLocaleDateString() },
      { field: 'Submission Time', value: form.submissionTime },
      { field: 'Supervisor Name', value: form.supervisorName },
      { field: 'Supervisor Remark', value: form.supervisorRemark },
      { field: 'ASM Name', value: form.asmName },
      { field: 'City', value: form.city },
      { field: 'Area Name', value: form.areaName }
    ]);

    // Add empty row
    worksheet.addRow([]);

    // Add Remarks Section
    worksheet.addRow(['Remarks History']);
    worksheet.addRow(['Date', 'Sender', 'Role', 'Message']);

    form.remarks.forEach(remark => {
      worksheet.addRow([
        new Date(remark.createdAt).toLocaleString(),
        remark.senderName,
        remark.senderRole,
        remark.message
      ]);
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    const remarksHeaderRowIndex = worksheet.rowCount - form.remarks.length - 1;
    worksheet.getRow(remarksHeaderRowIndex).font = { bold: true, size: 12 };
    worksheet.getRow(remarksHeaderRowIndex + 1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=form-${form._id}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/forms/reminders
// @desc    Get all reminders for current user (or all if admin)
// @access  Private
router.get('/reminders', protect, async (req, res) => {
  try {
    let query = { 'reminder.isSet': true };

    // If not admin, only show reminders for forms owned by user
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const forms = await Form.find(query)
      .populate('userId', 'name email')
      .select('_id customerName mobileNumber loanType status reminder userId')
      .sort({ 'reminder.isCompleted': 1, 'reminder.dateTime': 1 }); // Incomplete first, then by date

    res.status(200).json({
      success: true,
      count: forms.length,
      reminders: forms
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/forms/:id/reminder/complete
// @desc    Mark a reminder as complete
// @access  Private
router.put('/:id/reminder/complete', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user is authorized (owner or admin)
    if (form.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this reminder'
      });
    }

    if (!form.reminder.isSet) {
      return res.status(400).json({
        success: false,
        message: 'No reminder set on this form'
      });
    }

    // Toggle completion status
    form.reminder.isCompleted = !form.reminder.isCompleted;
    form.reminder.completedAt = form.reminder.isCompleted ? Date.now() : null;
    form.reminder.completedBy = form.reminder.isCompleted ? req.user._id : null;

    await form.save();

    res.status(200).json({
      success: true,
      message: form.reminder.isCompleted ? 'Reminder marked as complete' : 'Reminder marked as incomplete',
      reminder: form.reminder
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/forms/:id/status
// @desc    Update form progress status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { progressStatus } = req.body;

    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user is authorized (owner or admin)
    if (form.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this form'
      });
    }

    // Validate status
    const validStatuses = ['Active', 'Loss', 'Meeting', 'Communication', 'Login'];
    if (!validStatuses.includes(progressStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid progress status'
      });
    }

    form.progressStatus = progressStatus;
    await form.save();

    res.status(200).json({
      success: true,
      message: 'Progress status updated successfully',
      progressStatus: form.progressStatus
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
