const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User side fields
  mobileNumber: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    trim: true
  },
  customerName: {
    type: String,
    required: [true, 'Please provide customer name'],
    trim: true
  },
  loanType: {
    type: String,
    required: [true, 'Please provide loan type'],
    enum: ['Home Loan', 'Personal Loan', 'Car Loan', 'Business Loan', 'Education Loan', 'Gold Loan', 'Other'],
    default: 'Other'
  },
  interestedStatus: {
    type: String,
    required: [true, 'Please provide interested status'],
    enum: ['Yes', 'No'],
    default: 'No'
  },
  agentRemarks: {
    type: String,
    trim: true,
    default: ''
  },
  // Auto-generated agent info
  agentName: {
    type: String,
    required: true,
    trim: true
  },
  agentId: {
    type: String,
    required: true,
    trim: true
  },
  // Auto-generated date and time
  submissionDate: {
    type: Date,
    default: Date.now
  },
  submissionTime: {
    type: String,
    default: function() {
      return new Date().toLocaleTimeString('en-US', { hour12: false });
    }
  },
  // Supervisor side fields
  supervisorName: {
    type: String,
    trim: true,
    default: ''
  },
  supervisorId: {
    type: String,
    trim: true,
    default: ''
  },
  asmName: {
    type: String,
    trim: true,
    default: ''
  },
  asmContactNo: {
    type: String,
    trim: true,
    default: ''
  },
  asmEmailId: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  areaName: {
    type: String,
    trim: true,
    default: ''
  },
  supervisorRemark: {
    type: String,
    trim: true,
    default: ''
  },
  // Legacy fields (keeping for backward compatibility)
  title: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['Sales', 'Support', 'Marketing', 'HR', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewComment: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  remarks: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Update the updatedAt field before saving
formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Form', formSchema);
