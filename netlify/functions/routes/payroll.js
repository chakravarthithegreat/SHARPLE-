const express = require('express');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payroll
// @desc    Get payroll records
// @access  Private (Admin/Manager)
router.get('/', authenticateToken, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { page = 1, limit = 20, year, month, employee } = req.query;
    
    const query = {};
    if (year) query['payPeriod.year'] = parseInt(year);
    if (month) query['payPeriod.month'] = parseInt(month);
    if (employee) query.employee = employee;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { 'payPeriod.year': -1, 'payPeriod.month': -1 },
      populate: 'employee'
    };

    const payrolls = await Payroll.paginate(query, options);

    res.json({
      payrolls: payrolls.docs,
      pagination: {
        page: payrolls.page,
        pages: payrolls.totalPages,
        total: payrolls.totalDocs,
        limit: payrolls.limit
      }
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      message: 'Failed to get payroll records',
      error: error.message
    });
  }
});

// @route   POST /api/payroll
// @desc    Create payroll record
// @access  Private (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const payrollData = req.body;
    const payroll = new Payroll(payrollData);
    await payroll.save();
    
    res.status(201).json({
      message: 'Payroll record created successfully',
      payroll
    });
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({
      message: 'Failed to create payroll record',
      error: error.message
    });
  }
});

module.exports = router;
