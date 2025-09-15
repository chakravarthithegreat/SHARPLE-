const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authenticateToken, requireTaskAccess, requireProjectAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks (with pagination and filtering)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignee,
      project,
      category,
      search
    } = req.query;

    const query = { isArchived: false };

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (project) query.project = project;

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by assignee based on user role
    if (req.user.role === 'TEAM_MEMBER') {
      query.assignee = req.user._id;
    } else if (req.user.role === 'MANAGER') {
      // Manager can see tasks assigned to their team members
      const teamMembers = await User.find({ manager: req.user._id }).select('_id');
      const teamMemberIds = teamMembers.map(member => member._id);
      teamMemberIds.push(req.user._id); // Include manager's own tasks
      query.assignee = { $in: teamMemberIds };
    }
    // Admin can see all tasks (no additional filter)

    if (assignee) {
      query.assignee = assignee;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'assignee', select: 'firstName lastName email avatar' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'project', select: 'name code' },
        { path: 'reviewedBy', select: 'firstName lastName email' }
      ]
    };

    const tasks = await Task.paginate(query, options);

    res.json({
      tasks: tasks.docs,
      pagination: {
        page: tasks.page,
        pages: tasks.totalPages,
        total: tasks.totalDocs,
        limit: tasks.limit
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Failed to get tasks',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', authenticateToken, requireTaskAccess, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email')
      .populate('project', 'name code')
      .populate('reviewedBy', 'firstName lastName email')
      .populate('dependencies')
      .populate('subtasks')
      .populate('parentTask')
      .populate('comments.user', 'firstName lastName avatar');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      message: 'Failed to get task',
      error: error.message
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      assignee,
      project,
      priority = 'MEDIUM',
      category = 'OTHER',
      dueDate,
      estimatedHours,
      milestones,
      tags,
      reviewRequired = false
    } = req.body;

    // Validate required fields
    if (!title || !description || !assignee) {
      return res.status(400).json({
        message: 'Title, description, and assignee are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if assignee exists
    const User = require('../models/User');
    const assigneeUser = await User.findById(assignee);
    if (!assigneeUser) {
      return res.status(400).json({
        message: 'Assignee not found',
        code: 'ASSIGNEE_NOT_FOUND'
      });
    }

    // Check project access if project is specified
    if (project) {
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(400).json({
          message: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
      }
    }

    const task = new Task({
      title,
      description,
      assignee,
      createdBy: req.user._id,
      project,
      priority,
      category,
      dueDate,
      estimatedHours,
      milestones,
      tags,
      reviewRequired
    });

    await task.save();

    // Populate the created task
    await task.populate([
      { path: 'assignee', select: 'firstName lastName email avatar' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'project', select: 'name code' }
    ]);

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', authenticateToken, requireTaskAccess, async (req, res) => {
  try {
    const {
      title,
      description,
      assignee,
      priority,
      status,
      category,
      dueDate,
      estimatedHours,
      actualHours,
      progress,
      milestones,
      tags,
      reviewRequired,
      reviewComments,
      qualityScore
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    // Update allowed fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (assignee) task.assignee = assignee;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (category) task.category = category;
    if (dueDate) task.dueDate = dueDate;
    if (estimatedHours) task.estimatedHours = estimatedHours;
    if (actualHours) task.actualHours = actualHours;
    if (progress !== undefined) task.progress = progress;
    if (milestones) task.milestones = milestones;
    if (tags) task.tags = tags;
    if (reviewRequired !== undefined) task.reviewRequired = reviewRequired;
    if (reviewComments) task.reviewComments = reviewComments;
    if (qualityScore) task.qualityScore = qualityScore;

    // Handle status changes
    if (status === 'REVIEW' && task.reviewRequired) {
      // Task is ready for review
    } else if (status === 'DONE' && task.reviewRequired && !task.reviewedBy) {
      return res.status(400).json({
        message: 'Task requires review before completion',
        code: 'REVIEW_REQUIRED'
      });
    }

    await task.save();

    // Populate the updated task
    await task.populate([
      { path: 'assignee', select: 'firstName lastName email avatar' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'project', select: 'name code' },
      { path: 'reviewedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task (soft delete)
// @access  Private
router.delete('/:id', authenticateToken, requireTaskAccess, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    // Only creator or admin can delete
    if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Only task creator or admin can delete tasks',
        code: 'DELETE_PERMISSION_DENIED'
      });
    }

    // Soft delete - archive task
    task.isArchived = true;
    await task.save();

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', authenticateToken, requireTaskAccess, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        message: 'Comment content is required',
        code: 'MISSING_CONTENT'
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    await task.addComment(req.user._id, content);

    // Populate the updated task
    await task.populate([
      { path: 'comments.user', select: 'firstName lastName avatar' }
    ]);

    res.json({
      message: 'Comment added successfully',
      task
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// @route   POST /api/tasks/:id/review
// @desc    Review task
// @access  Private
router.post('/:id/review', authenticateToken, requireTaskAccess, async (req, res) => {
  try {
    const { approved, comments, qualityScore } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (!task.reviewRequired) {
      return res.status(400).json({
        message: 'Task does not require review',
        code: 'REVIEW_NOT_REQUIRED'
      });
    }

    if (task.status !== 'REVIEW') {
      return res.status(400).json({
        message: 'Task is not in review status',
        code: 'INVALID_STATUS'
      });
    }

    // Update review information
    task.reviewedBy = req.user._id;
    task.reviewedAt = new Date();
    task.reviewComments = comments;
    if (qualityScore) task.qualityScore = qualityScore;

    // Update status based on approval
    if (approved) {
      task.status = 'DONE';
      task.completedAt = new Date();
      task.progress = 100;
    } else {
      task.status = 'IN_PROGRESS';
    }

    await task.save();

    res.json({
      message: 'Task review completed',
      task
    });
  } catch (error) {
    console.error('Review task error:', error);
    res.status(500).json({
      message: 'Failed to review task',
      error: error.message
    });
  }
});

// @route   GET /api/tasks/stats/overview
// @desc    Get task statistics overview
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    let query = { isArchived: false };

    // Filter by user role
    if (req.user.role === 'TEAM_MEMBER') {
      query.assignee = req.user._id;
    } else if (req.user.role === 'MANAGER') {
      const User = require('../models/User');
      const teamMembers = await User.find({ manager: req.user._id }).select('_id');
      const teamMemberIds = teamMembers.map(member => member._id);
      teamMemberIds.push(req.user._id);
      query.assignee = { $in: teamMemberIds };
    }

    const taskStats = await Task.getTaskStats(query);
    const overdueTasks = await Task.getOverdueTasks();

    res.json({
      overview: {
        taskStats,
        overdueTasks: overdueTasks.length
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      message: 'Failed to get task statistics',
      error: error.message
    });
  }
});

module.exports = router;
