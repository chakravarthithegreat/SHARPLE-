const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const taskSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [2000, 'Task description cannot exceed 2000 characters']
  },
  
  // Assignment and Ownership
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to someone']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task creator is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  
  // Task Properties
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'],
    default: 'TODO'
  },
  category: {
    type: String,
    enum: ['DEVELOPMENT', 'DESIGN', 'TESTING', 'DOCUMENTATION', 'RESEARCH', 'MEETING', 'OTHER'],
    default: 'OTHER'
  },
  
  // Timeline
  dueDate: {
    type: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  
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
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    dueDate: Date
  }],
  
  // Quality Control
  reviewRequired: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewComments: String,
  qualityScore: {
    type: Number,
    min: [1, 'Quality score must be at least 1'],
    max: [5, 'Quality score cannot exceed 5']
  },
  
  // Dependencies and Relations
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  
  // Files and Attachments
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments and Communication
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }],
  
  // Performance Metrics
  efficiency: {
    type: Number,
    min: [0, 'Efficiency cannot be negative'],
    max: [100, 'Efficiency cannot exceed 100%']
  },
  turnaroundTime: {
    type: Number, // in hours
    min: [0, 'Turnaround time cannot be negative']
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  
  // Tags and Labels
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Status and Settings
  isArchived: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: String,
  
  // Notifications
  notifications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['ASSIGNED', 'DUE_SOON', 'OVERDUE', 'COMPLETED', 'COMMENTED', 'STATUS_CHANGED']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task age in days
taskSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  return Math.ceil((this.dueDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'DONE') return 100;
  return this.progress;
});

// Indexes for better query performance
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1, status: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ createdAt: -1 });

// Pre-save middleware to update completion date
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'DONE' && !this.completedAt) {
    this.completedAt = new Date();
    this.progress = 100;
  }
  next();
});

// Method to add comment
taskSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Method to update progress
taskSchema.methods.updateProgress = function(progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  if (this.progress === 100 && this.status !== 'DONE') {
    this.status = 'DONE';
    this.completedAt = new Date();
  }
  return this.save();
};

// Method to assign task
taskSchema.methods.assignTo = function(userId) {
  this.assignee = userId;
  this.status = 'TODO';
  return this.save();
};

// Method to calculate efficiency
taskSchema.methods.calculateEfficiency = function() {
  if (this.estimatedHours && this.actualHours) {
    this.efficiency = Math.round((this.estimatedHours / this.actualHours) * 100);
  }
  return this.efficiency;
};

// Method to calculate turnaround time
taskSchema.methods.calculateTurnaroundTime = function() {
  if (this.completedAt && this.startDate) {
    this.turnaroundTime = (this.completedAt - this.startDate) / (1000 * 60 * 60);
  }
  return this.turnaroundTime;
};

// Static method to get tasks by status
taskSchema.statics.getByStatus = function(status) {
  return this.find({ status, isArchived: false }).populate('assignee createdBy project');
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['DONE', 'BLOCKED'] },
    isArchived: false
  }).populate('assignee createdBy project');
};

// Static method to get tasks by assignee
taskSchema.statics.getByAssignee = function(assigneeId) {
  return this.find({ assignee: assigneeId, isArchived: false }).populate('createdBy project');
};

// Static method to get task statistics
taskSchema.statics.getTaskStats = async function(filters = {}) {
  const pipeline = [
    { $match: { isArchived: false, ...filters } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        avgProgress: { $avg: '$progress' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Add pagination plugin
taskSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Task', taskSchema);
