const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'],
    default: 'TEAM_MEMBER',
    required: true
  },
  permissions: [{
    type: String,
    enum: [
      'READ_USERS', 'WRITE_USERS', 'DELETE_USERS',
      'READ_TASKS', 'WRITE_TASKS', 'DELETE_TASKS',
      'READ_PROJECTS', 'WRITE_PROJECTS', 'DELETE_PROJECTS',
      'READ_PAYROLL', 'WRITE_PAYROLL', 'DELETE_PAYROLL',
      'READ_ANALYTICS', 'WRITE_ANALYTICS',
      'MANAGE_SYSTEM', 'MANAGE_ROLES'
    ]
  }],
  
  // Organization Information
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Employment Information
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    base: {
      type: Number,
      min: [0, 'Salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Performance and Gamification
  level: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MASTER', 'LEGEND'],
    default: 'BEGINNER'
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  rewards: [{
    type: {
      type: String,
      enum: ['STAR', 'BUTTERFLY', 'TROPHY', 'CROWN', 'MEDAL', 'SHIELD', 'HEART', 'ZAP', 'FLOWER']
    },
    count: {
      type: Number,
      default: 1
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      taskUpdates: {
        type: Boolean,
        default: true
      },
      projectUpdates: {
        type: Boolean,
        default: true
      },
      chatMessages: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for total rewards count
userSchema.virtual('totalRewards').get(function() {
  return this.rewards.reduce((total, reward) => total + reward.count, 0);
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user's team members (if manager)
userSchema.methods.getTeamMembers = async function() {
  if (this.role === 'MANAGER' || this.role === 'ADMIN') {
    return await this.constructor.find({ manager: this._id });
  }
  return [];
};

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'ADMIN') return true;
  return this.permissions.includes(permission);
};

// Method to add points and check for level up
userSchema.methods.addPoints = async function(points) {
  this.points += points;
  
  // Check for level up
  const levelThresholds = {
    'BEGINNER': 0,
    'INTERMEDIATE': 100,
    'ADVANCED': 500,
    'MASTER': 1500,
    'LEGEND': 5000
  };
  
  const levels = Object.keys(levelThresholds);
  const currentLevelIndex = levels.indexOf(this.level);
  
  for (let i = currentLevelIndex + 1; i < levels.length; i++) {
    if (this.points >= levelThresholds[levels[i]]) {
      this.level = levels[i];
      break;
    }
  }
  
  await this.save();
  return this;
};

// Static method to get users by role
userSchema.statics.getByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get team hierarchy
userSchema.statics.getTeamHierarchy = async function() {
  const managers = await this.find({ role: { $in: ['MANAGER', 'ADMIN'] } }).populate('teamMembers');
  return managers;
};

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);
