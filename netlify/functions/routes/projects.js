const express = require('express');
const Project = require('../models/Project');
const { authenticateToken, requireProjectAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects (with pagination and filtering)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      projectManager,
      search
    } = req.query;

    const query = { isArchived: false };

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (projectManager) query.projectManager = projectManager;

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by user role
    if (req.user.role === 'TEAM_MEMBER') {
      query['team.user'] = req.user._id;
    } else if (req.user.role === 'MANAGER') {
      query.$or = [
        { projectManager: req.user._id },
        { 'team.user': req.user._id }
      ];
    }
    // Admin can see all projects (no additional filter)

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'projectManager', select: 'firstName lastName email avatar' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'team.user', select: 'firstName lastName email avatar' }
      ]
    };

    const projects = await Project.paginate(query, options);

    res.json({
      projects: projects.docs,
      pagination: {
        page: projects.page,
        pages: projects.totalPages,
        total: projects.totalDocs,
        limit: projects.limit
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      message: 'Failed to get projects',
      error: error.message
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('projectManager', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email avatar role')
      .populate('tasks')
      .populate('milestones');

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      message: 'Failed to get project',
      error: error.message
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin/Manager)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      code,
      priority = 'MEDIUM',
      category = 'OTHER',
      deadline,
      estimatedDuration,
      projectManager,
      team,
      client,
      budget
    } = req.body;

    // Validate required fields
    if (!name || !description || !code) {
      return res.status(400).json({
        message: 'Name, description, and code are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if project code already exists
    const existingProject = await Project.findOne({ code: code.toUpperCase() });
    if (existingProject) {
      return res.status(400).json({
        message: 'Project code already exists',
        code: 'CODE_EXISTS'
      });
    }

    // Set project manager (default to creator if not specified)
    const managerId = projectManager || req.user._id;

    const project = new Project({
      name,
      description,
      code: code.toUpperCase(),
      priority,
      category,
      deadline,
      estimatedDuration,
      projectManager: managerId,
      createdBy: req.user._id,
      team: team || [],
      client,
      budget
    });

    await project.save();

    // Populate the created project
    await project.populate([
      { path: 'projectManager', select: 'firstName lastName email avatar' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'team.user', select: 'firstName lastName email avatar' }
    ]);

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const {
      name,
      description,
      priority,
      status,
      category,
      deadline,
      estimatedDuration,
      projectManager,
      team,
      client,
      budget,
      roadmap,
      milestones
    } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    // Update allowed fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (priority) project.priority = priority;
    if (status) project.status = status;
    if (category) project.category = category;
    if (deadline) project.deadline = deadline;
    if (estimatedDuration) project.estimatedDuration = estimatedDuration;
    if (projectManager) project.projectManager = projectManager;
    if (team) project.team = team;
    if (client) project.client = client;
    if (budget) project.budget = budget;
    if (roadmap) project.roadmap = roadmap;
    if (milestones) project.milestones = milestones;

    await project.save();

    // Populate the updated project
    await project.populate([
      { path: 'projectManager', select: 'firstName lastName email avatar' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'team.user', select: 'firstName lastName email avatar' }
    ]);

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project (soft delete)
// @access  Private
router.delete('/:id', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    // Only project manager or admin can delete
    if (project.projectManager.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Only project manager or admin can delete projects',
        code: 'DELETE_PERMISSION_DENIED'
      });
    }

    // Soft delete - archive project
    project.isArchived = true;
    project.archivedAt = new Date();
    await project.save();

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// @route   POST /api/projects/:id/team
// @desc    Add team member to project
// @access  Private
router.post('/:id/team', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const { userId, role = 'CONTRIBUTOR' } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
        code: 'USER_ID_REQUIRED'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    await project.addTeamMember(userId, role);

    res.json({
      message: 'Team member added successfully',
      project
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      message: 'Failed to add team member',
      error: error.message
    });
  }
});

// @route   DELETE /api/projects/:id/team/:userId
// @desc    Remove team member from project
// @access  Private
router.delete('/:id/team/:userId', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    await project.removeTeamMember(req.params.userId);

    res.json({
      message: 'Team member removed successfully',
      project
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      message: 'Failed to remove team member',
      error: error.message
    });
  }
});

// @route   POST /api/projects/:id/milestones
// @desc    Add milestone to project
// @access  Private
router.post('/:id/milestones', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const { title, description, dueDate, deliverables } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        message: 'Title and due date are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    const milestoneData = {
      title,
      description,
      dueDate,
      deliverables: deliverables || []
    };

    await project.addMilestone(milestoneData);

    res.json({
      message: 'Milestone added successfully',
      project
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({
      message: 'Failed to add milestone',
      error: error.message
    });
  }
});

// @route   PUT /api/projects/:id/milestones/:milestoneId
// @desc    Update milestone status
// @access  Private
router.put('/:id/milestones/:milestoneId', authenticateToken, requireProjectAccess, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status is required',
        code: 'STATUS_REQUIRED'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    await project.updateMilestoneStatus(req.params.milestoneId, status);

    res.json({
      message: 'Milestone updated successfully',
      project
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      message: 'Failed to update milestone',
      error: error.message
    });
  }
});

// @route   GET /api/projects/stats/overview
// @desc    Get project statistics overview
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    let query = { isArchived: false };

    // Filter by user role
    if (req.user.role === 'TEAM_MEMBER') {
      query['team.user'] = req.user._id;
    } else if (req.user.role === 'MANAGER') {
      query.$or = [
        { projectManager: req.user._id },
        { 'team.user': req.user._id }
      ];
    }

    const projectStats = await Project.getProjectStats(query);
    const overdueProjects = await Project.getOverdueProjects();

    res.json({
      overview: {
        projectStats,
        overdueProjects: overdueProjects.length
      }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      message: 'Failed to get project statistics',
      error: error.message
    });
  }
});

module.exports = router;
