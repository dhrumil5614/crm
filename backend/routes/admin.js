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
    body('asmEmailId').optional({ checkFalsy: true }).trim().isEmail().withMessage('Please provide a valid ASM email'),
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
    body('asmEmailId').optional({ checkFalsy: true }).trim().isEmail().withMessage('Please provide a valid ASM email'),
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

// @route   GET /api/admin/forms/export
// @desc    Export all forms to Excel with remarks as columns
// @access  Private/Admin
router.get('/forms/export', async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const { startDate, endDate } = req.query;

    // Build query with optional date filtering
    const query = {};
    if (startDate && endDate) {
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be before or equal to end date'
        });
      }

      // Set time to start of day for startDate and end of day for endDate
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    // Fetch forms with populated user data
    const forms = await Form.find(query)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    // Find maximum number of remarks across all forms
    const maxRemarks = forms.reduce((max, form) => {
      return Math.max(max, form.remarks ? form.remarks.length : 0);
    }, 0);

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('All Forms');

    // Define fixed columns
    const fixedColumns = [
      { header: 'Form ID', key: 'formId', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Progress Status', key: 'progressStatus', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Mobile Number', key: 'mobileNumber', width: 15 },
      { header: 'Loan Type', key: 'loanType', width: 15 },
      { header: 'Interested Status', key: 'interestedStatus', width: 15 },
      { header: 'Agent Name', key: 'agentName', width: 20 },
      { header: 'Agent ID', key: 'agentId', width: 25 },
      { header: 'Agent Remarks', key: 'agentRemarks', width: 30 },
      { header: 'Submission Date', key: 'submissionDate', width: 15 },
      { header: 'Submission Time', key: 'submissionTime', width: 12 },
      { header: 'Supervisor Name', key: 'supervisorName', width: 20 },
      { header: 'Supervisor ID', key: 'supervisorId', width: 25 },
      { header: 'ASM Name', key: 'asmName', width: 20 },
      { header: 'ASM Contact No', key: 'asmContactNo', width: 15 },
      { header: 'ASM Email ID', key: 'asmEmailId', width: 25 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Area Name', key: 'areaName', width: 20 },
      { header: 'Supervisor Remark', key: 'supervisorRemark', width: 30 },
      { header: 'Supervisor Name', key: 'supervisorName', width: 20 },
      { header: 'Supervisor ID', key: 'supervisorId', width: 25 },
      { header: 'Review Comment', key: 'reviewComment', width: 30 },
      { header: 'Reviewed By', key: 'reviewedBy', width: 20 },
      { header: 'Reviewed At', key: 'reviewedAt', width: 18 },
      { header: 'Submitted By', key: 'submittedBy', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 18 }
    ];

    // Add dynamic remark columns
    const remarkColumns = [];
    for (let i = 1; i <= maxRemarks; i++) {
      remarkColumns.push({
        header: `Remark ${i} - Sender`,
        key: `remark${i}Sender`,
        width: 25
      });
      remarkColumns.push({
        header: `Remark ${i} - Role`,
        key: `remark${i}Role`,
        width: 12
      });
      remarkColumns.push({
        header: `Remark ${i} - Date`,
        key: `remark${i}Date`,
        width: 18
      });
      remarkColumns.push({
        header: `Remark ${i} - Message`,
        key: `remark${i}Message`,
        width: 40
      });
    }

    // Set all columns
    worksheet.columns = [...fixedColumns, ...remarkColumns];

    // Add data rows
    forms.forEach(form => {
      const rowData = {
        formId: form._id.toString(),
        status: form.status,
        progressStatus: form.progressStatus || 'Active',
        customerName: form.customerName || '',
        mobileNumber: form.mobileNumber || '',
        loanType: form.loanType || '',
        interestedStatus: form.interestedStatus || '',
        agentName: form.agentName || '',
        agentId: form.agentId || '',
        agentRemarks: form.agentRemarks || '',
        submissionDate: form.submissionDate ? new Date(form.submissionDate).toLocaleDateString() : '',
        submissionTime: form.submissionTime || '',
        supervisorName: form.supervisorName || '',
        supervisorId: form.supervisorId || '',
        asmName: form.asmName || '',
        asmContactNo: form.asmContactNo || '',
        asmEmailId: form.asmEmailId || '',
        city: form.city || '',
        areaName: form.areaName || '',
        supervisorRemark: form.supervisorRemark || '',
        reviewComment: form.reviewComment || '',
        reviewedBy: form.reviewedBy?.name || '',
        reviewedAt: form.reviewedAt ? new Date(form.reviewedAt).toLocaleString() : '',
        submittedBy: form.userId?.name || '',
        createdAt: new Date(form.createdAt).toLocaleString()
      };

      // Add remark data
      if (form.remarks && form.remarks.length > 0) {
        // Sort remarks by date ascending (Oldest -> Newest)
        const sortedRemarks = [...form.remarks].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        sortedRemarks.forEach((remark, index) => {
          const remarkNum = index + 1;
          rowData[`remark${remarkNum}Sender`] = remark.senderName || '';
          rowData[`remark${remarkNum}Role`] = remark.senderRole || '';
          rowData[`remark${remarkNum}Date`] = remark.createdAt ? new Date(remark.createdAt).toLocaleString() : '';
          rowData[`remark${remarkNum}Message`] = remark.message || '';
        });
      }

      worksheet.addRow(rowData);
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 11 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Auto-filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: fixedColumns.length + remarkColumns.length }
    };

    // Freeze first row
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ];

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=all-forms-${Date.now()}.xlsx`);

    // Write to response
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

// @route   POST /api/admin/forms/:id/reminder
// @desc    Add a reminder to a form
// @access  Private/Admin
router.post('/forms/:id/reminder', [
  body('dateTime').notEmpty().isISO8601().withMessage('Valid date and time is required'),
  body('message').optional().trim()
], async (req, res) => {
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

    // Add new reminder to reminders array
    const newReminder = {
      dateTime: new Date(req.body.dateTime),
      message: req.body.message || '',
      setBy: req.user._id,
      setByName: req.user.name,
      isCompleted: false,
      completedAt: null,
      completedBy: null,
      createdAt: Date.now()
    };

    form.reminders.push(newReminder);
    await form.save();
    await form.populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Reminder added successfully',
      form,
      reminder: form.reminders[form.reminders.length - 1]
    });
  } catch (error) {
    console.error('Add reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
