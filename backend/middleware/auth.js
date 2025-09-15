const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to check if user has specific role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permission
      });
    }

    next();
  };
};

// Middleware to check if user can access resource (owner or admin/manager)
const requireOwnershipOrRole = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    // Admin and Manager can access any resource
    if (['ADMIN', 'MANAGER'].includes(req.user.role)) {
      return next();
    }

    // User can only access their own resources
    if (req.user._id.toString() === resourceUserId) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  };
};

// Middleware to check if user is manager of the target user
const requireManagerAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const targetUserId = req.params.userId || req.body.userId;
    
    // Admin can access any user
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Manager can access their team members
    if (req.user.role === 'MANAGER') {
      const targetUser = await User.findById(targetUserId);
      if (targetUser && targetUser.manager && targetUser.manager.toString() === req.user._id.toString()) {
        return next();
      }
    }

    // User can access their own data
    if (req.user._id.toString() === targetUserId) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Manager access required',
      code: 'MANAGER_ACCESS_REQUIRED'
    });
  } catch (error) {
    console.error('Manager access check error:', error);
    return res.status(500).json({ 
      message: 'Access check error',
      code: 'ACCESS_CHECK_ERROR'
    });
  }
};

// Middleware to check if user can access project
const requireProjectAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({ 
        message: 'Project ID required',
        code: 'PROJECT_ID_REQUIRED'
      });
    }

    const Project = require('../models/Project');
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    // Admin can access any project
    if (req.user.role === 'ADMIN') {
      req.project = project;
      return next();
    }

    // Project manager can access their project
    if (project.projectManager.toString() === req.user._id.toString()) {
      req.project = project;
      return next();
    }

    // Team members can access their projects
    const isTeamMember = project.team.some(member => 
      member.user.toString() === req.user._id.toString() && member.isActive
    );

    if (isTeamMember) {
      req.project = project;
      return next();
    }

    return res.status(403).json({ 
      message: 'Project access denied',
      code: 'PROJECT_ACCESS_DENIED'
    });
  } catch (error) {
    console.error('Project access check error:', error);
    return res.status(500).json({ 
      message: 'Project access check error',
      code: 'PROJECT_ACCESS_CHECK_ERROR'
    });
  }
};

// Middleware to check if user can access task
const requireTaskAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const taskId = req.params.taskId || req.body.taskId;
    
    if (!taskId) {
      return res.status(400).json({ 
        message: 'Task ID required',
        code: 'TASK_ID_REQUIRED'
      });
    }

    const Task = require('../models/Task');
    const task = await Task.findById(taskId).populate('project');
    
    if (!task) {
      return res.status(404).json({ 
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    // Admin can access any task
    if (req.user.role === 'ADMIN') {
      req.task = task;
      return next();
    }

    // Task assignee can access their task
    if (task.assignee.toString() === req.user._id.toString()) {
      req.task = task;
      return next();
    }

    // Task creator can access their task
    if (task.createdBy.toString() === req.user._id.toString()) {
      req.task = task;
      return next();
    }

    // Project team members can access project tasks
    if (task.project) {
      const isProjectMember = task.project.team.some(member => 
        member.user.toString() === req.user._id.toString() && member.isActive
      );

      if (isProjectMember) {
        req.task = task;
        return next();
      }
    }

    return res.status(403).json({ 
      message: 'Task access denied',
      code: 'TASK_ACCESS_DENIED'
    });
  } catch (error) {
    console.error('Task access check error:', error);
    return res.status(500).json({ 
      message: 'Task access check error',
      code: 'TASK_ACCESS_CHECK_ERROR'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnershipOrRole,
  requireManagerAccess,
  requireProjectAccess,
  requireTaskAccess,
  optionalAuth
};
