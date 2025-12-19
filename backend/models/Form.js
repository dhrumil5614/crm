const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Auto-generated month field (system entry)
  month: {
    type: Date,
    default: Date.now
  },

  // Product - Dropdown (required)
  product: {
    type: String,
    required: [true, 'Please provide product type'],
    enum: ['Business Loan', 'Machine Loan', 'Solar Loan', 'One loan', 'UBL'],
    default: 'Business Loan'
  },

  // Main Source - default "Call centre"
  mainSource: {
    type: String,
    trim: true,
    default: 'Call centre'
  },

  // Customer Name (required)
  customerName: {
    type: String,
    required: [true, 'Please provide customer name'],
    trim: true
  },

  // Lead ID / GL ID
  leadId: {
    type: String,
    trim: true,
    default: ''
  },

  // Company Name
  companyName: {
    type: String,
    trim: true,
    default: ''
  },

  // Contact Number (required)
  mobileNumber: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    trim: true
  },

  // Alternate Number
  alternateNumber: {
    type: String,
    trim: true,
    default: ''
  },

  // Loan Amount
  loanAmount: {
    type: Number,
    default: 0
  },

  // City
  city: {
    type: String,
    trim: true,
    default: ''
  },

  // State
  state: {
    type: String,
    trim: true,
    default: ''
  },

  // In Future Month - with year logic
  inFutureMonth: {
    type: String,
    trim: true,
    default: ''
  },

  // Remarks / Agent Remarks
  agentRemarks: {
    type: String,
    trim: true,
    default: ''
  },

  // Business Type
  businessType: {
    type: String,
    trim: true,
    default: ''
  },

  // Property Type - Dropdown with status list
  propertyType: {
    type: String,
    enum: [
      'already Sanctioned / Disbursed',
      'ASM Visit Done- Documents Pending',
      'Case Disbursed',
      'Case Logged In',
      'Case Rejected - Credit Manager',
      'Case Sanctioned',
      'Competitor offer taken',
      'Customer Not Contactable',
      'Customer Put on Hold Post Login',
      'Follow Ups',
      'High Charges',
      'Low Turn Over',
      'Machine not Finalised',
      'Meeting Fixed',
      'No Revert from ASM',
      'Not Doable',
      'Not Interested',
      'On Hold-Post Sanction',
      'Will take in future',
      ''
    ],
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
    default: function () {
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
  // Progress tracking status
  progressStatus: {
    type: String,
    enum: ['Active', 'Loss', 'Meeting', 'Communication', 'Login'],
    default: 'Active'
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
  // Reminder/Notification system - Multiple reminders supported
  reminders: [{
    dateTime: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    setByName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'incomplete', 'rescheduled'],
      default: 'pending'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Legacy single reminder field (for backward compatibility)
  reminder: {
    isSet: {
      type: Boolean,
      default: false
    },
    dateTime: {
      type: Date,
      default: null
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    setByName: {
      type: String,
      default: ''
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
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
formSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Form', formSchema);
