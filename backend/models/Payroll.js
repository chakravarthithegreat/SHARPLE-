const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  // Employee Information
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  
  // Pay Period
  payPeriod: {
    startDate: {
      type: Date,
      required: [true, 'Pay period start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Pay period end date is required']
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  
  // Salary Components
  salary: {
    base: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [0, 'Base salary cannot be negative']
    },
    overtime: {
      type: Number,
      default: 0,
      min: [0, 'Overtime pay cannot be negative']
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative']
    },
    commission: {
      type: Number,
      default: 0,
      min: [0, 'Commission cannot be negative']
    },
    allowances: [{
      type: {
        type: String,
        enum: ['HOUSING', 'TRANSPORT', 'MEAL', 'MEDICAL', 'OTHER'],
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Allowance amount cannot be negative']
      },
      description: String
    }]
  },
  
  // Deductions
  deductions: [{
    type: {
      type: String,
      enum: ['TAX', 'INSURANCE', 'RETIREMENT', 'LOAN', 'ADVANCE', 'OTHER'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Deduction amount cannot be negative']
    },
    description: String,
    isPercentage: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100%']
    }
  }],
  
  // Tax Information
  tax: {
    grossIncome: {
      type: Number,
      required: true,
      min: [0, 'Gross income cannot be negative']
    },
    taxableIncome: {
      type: Number,
      required: true,
      min: [0, 'Taxable income cannot be negative']
    },
    federalTax: {
      type: Number,
      default: 0,
      min: [0, 'Federal tax cannot be negative']
    },
    stateTax: {
      type: Number,
      default: 0,
      min: [0, 'State tax cannot be negative']
    },
    socialSecurity: {
      type: Number,
      default: 0,
      min: [0, 'Social security tax cannot be negative']
    },
    medicare: {
      type: Number,
      default: 0,
      min: [0, 'Medicare tax cannot be negative']
    },
    totalTax: {
      type: Number,
      required: true,
      min: [0, 'Total tax cannot be negative']
    }
  },
  
  // Attendance and Hours
  attendance: {
    totalDays: {
      type: Number,
      required: true,
      min: [0, 'Total days cannot be negative']
    },
    workingDays: {
      type: Number,
      required: true,
      min: [0, 'Working days cannot be negative']
    },
    presentDays: {
      type: Number,
      required: true,
      min: [0, 'Present days cannot be negative']
    },
    absentDays: {
      type: Number,
      required: true,
      min: [0, 'Absent days cannot be negative']
    },
    leaveDays: {
      type: Number,
      default: 0,
      min: [0, 'Leave days cannot be negative']
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: [0, 'Overtime hours cannot be negative']
    },
    regularHours: {
      type: Number,
      required: true,
      min: [0, 'Regular hours cannot be negative']
    }
  },
  
  // Performance-based Calculations
  performance: {
    points: {
      type: Number,
      default: 0,
      min: [0, 'Performance points cannot be negative']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    bonusMultiplier: {
      type: Number,
      default: 1,
      min: [0, 'Bonus multiplier cannot be negative']
    },
    efficiency: {
      type: Number,
      min: [0, 'Efficiency cannot be negative'],
      max: [100, 'Efficiency cannot exceed 100%']
    }
  },
  
  // Final Calculations
  calculations: {
    grossPay: {
      type: Number,
      required: true,
      min: [0, 'Gross pay cannot be negative']
    },
    totalDeductions: {
      type: Number,
      required: true,
      min: [0, 'Total deductions cannot be negative']
    },
    netPay: {
      type: Number,
      required: true,
      min: [0, 'Net pay cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['BANK_TRANSFER', 'CHECK', 'CASH', 'CRYPTO'],
      default: 'BANK_TRANSFER'
    },
    bankDetails: {
      accountNumber: String,
      routingNumber: String,
      bankName: String
    },
    paymentDate: {
      type: Date
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'FAILED', 'CANCELLED'],
      default: 'PENDING'
    }
  },
  
  // Approval and Processing
  approval: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
      default: 'DRAFT'
    },
    comments: String,
    rejectionReason: String
  },
  
  // Payslip Information
  payslip: {
    generatedAt: {
      type: Date,
      default: Date.now
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadUrl: String,
    isDownloaded: {
      type: Boolean,
      default: false
    },
    downloadedAt: Date
  },
  
  // Status and Archive
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for attendance percentage
payrollSchema.virtual('attendancePercentage').get(function() {
  if (this.attendance.workingDays > 0) {
    return Math.round((this.attendance.presentDays / this.attendance.workingDays) * 100);
  }
  return 0;
});

// Virtual for pay period duration
payrollSchema.virtual('payPeriodDuration').get(function() {
  return Math.ceil((this.payPeriod.endDate - this.payPeriod.startDate) / (1000 * 60 * 60 * 24)) + 1;
});

// Indexes for better query performance
payrollSchema.index({ employee: 1, 'payPeriod.year': -1, 'payPeriod.month': -1 });
payrollSchema.index({ 'payPeriod.year': -1, 'payPeriod.month': -1 });
payrollSchema.index({ 'approval.status': 1 });
payrollSchema.index({ 'payment.status': 1 });
payrollSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
payrollSchema.pre('save', function(next) {
  // Calculate gross pay
  let grossPay = this.salary.base + this.salary.overtime + this.salary.bonus + this.salary.commission;
  
  // Add allowances
  if (this.salary.allowances && this.salary.allowances.length > 0) {
    grossPay += this.salary.allowances.reduce((total, allowance) => total + allowance.amount, 0);
  }
  
  this.calculations.grossPay = grossPay;
  this.tax.grossIncome = grossPay;
  
  // Calculate total deductions
  let totalDeductions = this.tax.totalTax;
  if (this.deductions && this.deductions.length > 0) {
    totalDeductions += this.deductions.reduce((total, deduction) => {
      if (deduction.isPercentage) {
        return total + (grossPay * deduction.percentage / 100);
      }
      return total + deduction.amount;
    }, 0);
  }
  
  this.calculations.totalDeductions = totalDeductions;
  this.calculations.netPay = grossPay - totalDeductions;
  
  next();
});

// Method to calculate tax
payrollSchema.methods.calculateTax = function() {
  const grossIncome = this.calculations.grossPay;
  
  // Simple tax calculation (this should be replaced with actual tax calculation logic)
  const federalTaxRate = 0.22; // 22% federal tax
  const stateTaxRate = 0.05;   // 5% state tax
  const socialSecurityRate = 0.062; // 6.2% social security
  const medicareRate = 0.0145; // 1.45% medicare
  
  this.tax.federalTax = Math.round(grossIncome * federalTaxRate);
  this.tax.stateTax = Math.round(grossIncome * stateTaxRate);
  this.tax.socialSecurity = Math.round(grossIncome * socialSecurityRate);
  this.tax.medicare = Math.round(grossIncome * medicareRate);
  this.tax.totalTax = this.tax.federalTax + this.tax.stateTax + this.tax.socialSecurity + this.tax.medicare;
  
  return this.tax;
};

// Method to approve payroll
payrollSchema.methods.approve = function(approvedBy, comments = '') {
  this.approval.status = 'APPROVED';
  this.approval.approvedBy = approvedBy;
  this.approval.approvedAt = new Date();
  this.approval.comments = comments;
  return this.save();
};

// Method to reject payroll
payrollSchema.methods.reject = function(rejectedBy, reason) {
  this.approval.status = 'REJECTED';
  this.approval.approvedBy = rejectedBy;
  this.approval.approvedAt = new Date();
  this.approval.rejectionReason = reason;
  return this.save();
};

// Method to process payment
payrollSchema.methods.processPayment = function(transactionId) {
  this.payment.status = 'PROCESSED';
  this.payment.paymentDate = new Date();
  this.payment.transactionId = transactionId;
  return this.save();
};

// Static method to get payroll by employee and period
payrollSchema.statics.getByEmployeeAndPeriod = function(employeeId, year, month) {
  return this.findOne({
    employee: employeeId,
    'payPeriod.year': year,
    'payPeriod.month': month
  }).populate('employee');
};

// Static method to get payroll by period
payrollSchema.statics.getByPeriod = function(year, month) {
  return this.find({
    'payPeriod.year': year,
    'payPeriod.month': month
  }).populate('employee');
};

// Static method to get pending approvals
payrollSchema.statics.getPendingApprovals = function() {
  return this.find({
    'approval.status': 'PENDING_APPROVAL'
  }).populate('employee');
};

// Static method to get payroll statistics
payrollSchema.statics.getPayrollStats = async function(filters = {}) {
  const pipeline = [
    { $match: { ...filters } },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        totalGrossPay: { $sum: '$calculations.grossPay' },
        totalDeductions: { $sum: '$calculations.totalDeductions' },
        totalNetPay: { $sum: '$calculations.netPay' },
        avgGrossPay: { $avg: '$calculations.grossPay' },
        avgNetPay: { $avg: '$calculations.netPay' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Payroll', payrollSchema);
