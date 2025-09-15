const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireRole, requireManagerAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (with pagination and filtering)
// @access  Private (Admin/Manager)
router.get('/', authenticateToken, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      department,
      isActive,
      search
    } = req.query;

    const query = {};

    // Apply filters
    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // If manager, only show their team members
    if (req.user.role === 'MANAGER') {
      query.$or = [
        { manager: req.user._id },
        { _id: req.user._id }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'manager', select: 'firstName lastName email' },
        { path: 'teamMembers', select: 'firstName lastName email role' }
      ]
    };

    const users = await User.paginate(query, options);

    res.json({
      users: users.docs,
      pagination: {
        page: users.page,
        pages: users.totalPages,
        total: users.totalDocs,
        limit: users.limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticateToken, requireManagerAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('manager', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email role')
      .populate('achievements');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to get user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin/Manager or self)
router.put('/:id', authenticateToken, requireManagerAccess, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      role,
      department,
      position,
      manager,
      salary,
      isActive,
      permissions
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Only admin can change role and permissions
    if (req.user.role !== 'ADMIN') {
      delete req.body.role;
      delete req.body.permissions;
      delete req.body.salary;
      delete req.body.isActive;
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (department) user.department = department;
    if (position) user.position = position;
    if (manager) user.manager = manager;
    if (salary) user.salary = salary;
    if (isActive !== undefined) user.isActive = isActive;
    if (permissions) user.permissions = permissions;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Soft delete - deactivate user
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id/team
// @desc    Get user's team members
// @access  Private
router.get('/:id/team', authenticateToken, requireManagerAccess, async (req, res) => {
  try {
    const teamMembers = await User.find({ manager: req.params.id, isActive: true })
      .select('firstName lastName email role department position points level');

    res.json({ teamMembers });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      message: 'Failed to get team members',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id/performance
// @desc    Get user's performance metrics
// @access  Private
router.get('/:id/performance', authenticateToken, requireManagerAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('achievements');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get task statistics
    const Task = require('../models/Task');
    const taskStats = await Task.getTaskStats({ assignee: user._id });

    // Get project statistics
    const Project = require('../models/Project');
    const projectStats = await Project.getProjectStats({
      'team.user': user._id
    });

    const performance = {
      user: {
        id: user._id,
        name: user.fullName,
        role: user.role,
        level: user.level,
        points: user.points,
        totalRewards: user.totalRewards
      },
      tasks: taskStats,
      projects: projectStats,
      achievements: user.achievements,
      rewards: user.rewards
    };

    res.json({ performance });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
});

// @route   POST /api/users/:id/points
// @desc    Add points to user
// @access  Private (Admin/Manager)
router.post('/:id/points', authenticateToken, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        message: 'Valid points amount is required',
        code: 'INVALID_POINTS'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    await user.addPoints(points);

    res.json({
      message: 'Points added successfully',
      user: {
        id: user._id,
        points: user.points,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({
      message: 'Failed to add points',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview
// @access  Private (Admin/Manager)
router.get('/stats/overview', authenticateToken, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const usersByDepartment = await User.aggregate([
      { $match: { isActive: true, department: { $exists: true } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt');

    res.json({
      overview: {
        totalUsers,
        usersByRole,
        usersByDepartment,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
});

module.exports = router;
