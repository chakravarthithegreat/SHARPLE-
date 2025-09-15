const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const projectSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Project description cannot exceed 2000 characters']
  },
  code: {
    type: String,
    unique: true,
    required: [true, 'Project code is required'],
    uppercase: true,
    trim: true,
    maxlength: [20, 'Project code cannot exceed 20 characters']
  },
  
  // Project Management
  status: {
    type: String,
    enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNING'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  category: {
    type: String,
    enum: ['DEVELOPMENT', 'DESIGN', 'RESEARCH', 'MARKETING', 'SALES', 'SUPPORT', 'OTHER'],
    default: 'OTHER'
  },
  
  // Timeline
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  deadline: {
    type: Date
  },
  estimatedDuration: {
    type: Number, // in days
    min: [1, 'Estimated duration must be at least 1 day']
  },
  actualDuration: {
    type: Number // in days
  },
  
  // Team and Ownership
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project creator is required']
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['LEAD', 'DEVELOPER', 'DESIGNER', 'TESTER', 'ANALYST', 'CONTRIBUTOR'],
      default: 'CONTRIBUTOR'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Client Information
  client: {
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Client name cannot exceed 200 characters']
    },
    contact: {
      name: String,
      email: String,
      phone: String
    },
    company: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // Budget and Resources
  budget: {
    allocated: {
      type: Number,
      min: [0, 'Allocated budget cannot be negative']
    },
    spent: {
      type: Number,
      min: [0, 'Spent budget cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  resources: [{
    type: {
      type: String,
      enum: ['HUMAN', 'TECHNICAL', 'FINANCIAL', 'MATERIAL'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    cost: Number,
    allocated: Number,
    used: {
      type: Number,
      default: 0
    }
  }],
  
  // Progress Tracking
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: {
      type: Date,
      required: true
    },
    completedAt: Date,
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'],
      default: 'PENDING'
    },
    deliverables: [String],
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone'
    }]
  }],
  
  // Roadmap and Planning
  roadmap: [{
    phase: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED'
    },
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    deliverables: [String]
  }],
  
  // Tasks and Deliverables
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  deliverables: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: ['DOCUMENT', 'CODE', 'DESIGN', 'REPORT', 'PRESENTATION', 'OTHER']
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED'],
      default: 'PENDING'
    },
    dueDate: Date,
    completedAt: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    files: [{
      filename: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
  // Risk Management
  risks: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    probability: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    impact: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['IDENTIFIED', 'MITIGATED', 'RESOLVED', 'ACCEPTED'],
      default: 'IDENTIFIED'
    },
    mitigation: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    identifiedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Communication and Documentation
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['REQUIREMENT', 'DESIGN', 'TEST_PLAN', 'USER_MANUAL', 'OTHER']
    },
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: String,
      default: '1.0'
    }
  }],
  
  // Performance Metrics
  metrics: {
    tasksCompleted: {
      type: Number,
      default: 0
    },
    tasksTotal: {
      type: Number,
      default: 0
    },
    onTimeDelivery: {
      type: Number,
      min: [0, 'On-time delivery cannot be negative'],
      max: [100, 'On-time delivery cannot exceed 100%']
    },
    budgetUtilization: {
      type: Number,
      min: [0, 'Budget utilization cannot be negative'],
      max: [100, 'Budget utilization cannot exceed 100%']
    },
    teamSatisfaction: {
      type: Number,
      min: [1, 'Team satisfaction must be at least 1'],
      max: [5, 'Team satisfaction cannot exceed 5']
    },
    clientSatisfaction: {
      type: Number,
      min: [1, 'Client satisfaction must be at least 1'],
      max: [5, 'Client satisfaction cannot exceed 5']
    }
  },
  
  // Settings and Configuration
  settings: {
    allowSelfAssignment: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoArchive: {
      type: Boolean,
      default: false
    },
    notificationSettings: {
      milestoneUpdates: {
        type: Boolean,
        default: true
      },
      taskUpdates: {
        type: Boolean,
        default: true
      },
      deadlineReminders: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Status and Archive
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archiveReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (this.endDate && this.startDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for days until deadline
projectSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.deadline) return null;
  return Math.ceil((this.deadline - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for budget remaining
projectSchema.virtual('budgetRemaining').get(function() {
  if (this.budget.allocated && this.budget.spent) {
    return this.budget.allocated - this.budget.spent;
  }
  return null;
});

// Virtual for team size
projectSchema.virtual('teamSize').get(function() {
  return this.team.filter(member => member.isActive).length;
});

// Indexes for better query performance
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ 'team.user': 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ code: 1 });

// Pre-save middleware to update completion date and calculate metrics
projectSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'COMPLETED' && !this.endDate) {
    this.endDate = new Date();
    this.actualDuration = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  
  // Update task completion metrics
  if (this.tasks && this.tasks.length > 0) {
    this.metrics.tasksTotal = this.tasks.length;
  }
  
  next();
});

// Method to add team member
projectSchema.methods.addTeamMember = function(userId, role = 'CONTRIBUTOR') {
  const existingMember = this.team.find(member => member.user.toString() === userId.toString());
  if (!existingMember) {
    this.team.push({
      user: userId,
      role: role
    });
  }
  return this.save();
};

// Method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.team = this.team.filter(member => member.user.toString() !== userId.toString());
  return this.save();
};

// Method to add milestone
projectSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push(milestoneData);
  return this.save();
};

// Method to update milestone status
projectSchema.methods.updateMilestoneStatus = function(milestoneId, status) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.status = status;
    if (status === 'COMPLETED') {
      milestone.completedAt = new Date();
    }
  }
  return this.save();
};

// Method to calculate progress
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const completedTasks = await Task.countDocuments({
    _id: { $in: this.tasks },
    status: 'DONE'
  });
  
  if (this.tasks.length > 0) {
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  }
  
  return this.save();
};

// Method to add risk
projectSchema.methods.addRisk = function(riskData) {
  this.risks.push(riskData);
  return this.save();
};

// Static method to get projects by status
projectSchema.statics.getByStatus = function(status) {
  return this.find({ status, isArchived: false }).populate('projectManager team.user');
};

// Static method to get projects by manager
projectSchema.statics.getByManager = function(managerId) {
  return this.find({ projectManager: managerId, isArchived: false }).populate('team.user');
};

// Static method to get overdue projects
projectSchema.statics.getOverdueProjects = function() {
  return this.find({
    deadline: { $lt: new Date() },
    status: { $nin: ['COMPLETED', 'CANCELLED'] },
    isArchived: false
  }).populate('projectManager team.user');
};

// Static method to get project statistics
projectSchema.statics.getProjectStats = async function(filters = {}) {
  const pipeline = [
    { $match: { isArchived: false, ...filters } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget.allocated' },
        totalSpent: { $sum: '$budget.spent' },
        avgProgress: { $avg: '$progress' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Add pagination plugin
projectSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Project', projectSchema);
