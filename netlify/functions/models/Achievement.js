const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    trim: true,
    maxlength: [100, 'Achievement name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true,
    maxlength: [500, 'Achievement description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Achievement icon is required']
  },
  
  // Achievement Properties
  type: {
    type: String,
    enum: ['TASK_COMPLETION', 'PROJECT_COMPLETION', 'TIME_TRACKING', 'ATTENDANCE', 'PERFORMANCE', 'COLLABORATION', 'LEADERSHIP', 'SPECIAL'],
    required: [true, 'Achievement type is required']
  },
  category: {
    type: String,
    enum: ['PRODUCTIVITY', 'TEAMWORK', 'INNOVATION', 'LEADERSHIP', 'CONSISTENCY', 'MILESTONE', 'SPECIAL'],
    required: [true, 'Achievement category is required']
  },
  
  // Requirements
  requirements: {
    criteria: {
      type: String,
      enum: ['TASK_COUNT', 'PROJECT_COUNT', 'HOURS_WORKED', 'DAYS_PRESENT', 'POINTS_EARNED', 'STREAK_DAYS', 'CUSTOM'],
      required: [true, 'Achievement criteria is required']
    },
    value: {
      type: Number,
      required: [true, 'Achievement value is required'],
      min: [1, 'Achievement value must be at least 1']
    },
    timeframe: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ALL_TIME'],
      default: 'ALL_TIME'
    },
    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'NOT_EQUALS']
      },
      value: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Rewards
  rewards: {
    points: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative']
    },
    items: [{
      type: {
        type: String,
        enum: ['STAR', 'BUTTERFLY', 'TROPHY', 'CROWN', 'MEDAL', 'SHIELD', 'HEART', 'ZAP', 'FLOWER']
      },
      count: {
        type: Number,
        default: 1,
        min: [1, 'Item count must be at least 1']
      }
    }],
    badge: {
      name: String,
      color: String,
      description: String
    }
  },
  
  // Visibility and Access
  visibility: {
    type: String,
    enum: ['PUBLIC', 'PRIVATE', 'TEAM_ONLY', 'ROLE_BASED'],
    default: 'PUBLIC'
  },
  roles: [{
    type: String,
    enum: ['ADMIN', 'MANAGER', 'TEAM_MEMBER']
  }],
  
  // Status and Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isRepeatable: {
    type: Boolean,
    default: false
  },
  maxEarnings: {
    type: Number,
    default: 1,
    min: [1, 'Max earnings must be at least 1']
  },
  
  // Statistics
  statistics: {
    totalEarned: {
      type: Number,
      default: 0
    },
    uniqueEarners: {
      type: Number,
      default: 0
    },
    lastEarned: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
achievementSchema.index({ type: 1, category: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ 'requirements.criteria': 1 });
achievementSchema.index({ createdAt: -1 });

// Method to check if user meets requirements
achievementSchema.methods.checkRequirements = async function(userId) {
  const User = mongoose.model('User');
  const Task = mongoose.model('Task');
  const Project = mongoose.model('Project');
  
  const user = await User.findById(userId);
  if (!user) return false;
  
  switch (this.requirements.criteria) {
    case 'TASK_COUNT':
      const taskCount = await Task.countDocuments({
        assignee: userId,
        status: 'DONE'
      });
      return taskCount >= this.requirements.value;
      
    case 'PROJECT_COUNT':
      const projectCount = await Project.countDocuments({
        'team.user': userId,
        status: 'COMPLETED'
      });
      return projectCount >= this.requirements.value;
      
    case 'HOURS_WORKED':
      // This would need to be calculated from time tracking data
      return user.points >= this.requirements.value;
      
    case 'DAYS_PRESENT':
      // This would need to be calculated from attendance data
      return user.points >= this.requirements.value;
      
    case 'POINTS_EARNED':
      return user.points >= this.requirements.value;
      
    default:
      return false;
  }
};

// Method to award achievement to user
achievementSchema.methods.awardToUser = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) throw new Error('User not found');
  
  // Check if user already has this achievement
  const hasAchievement = user.achievements.some(achievement => 
    achievement.toString() === this._id.toString()
  );
  
  if (hasAchievement && !this.isRepeatable) {
    return false;
  }
  
  // Add achievement to user
  user.achievements.push(this._id);
  
  // Add points
  if (this.rewards.points > 0) {
    await user.addPoints(this.rewards.points);
  }
  
  // Add reward items
  if (this.rewards.items && this.rewards.items.length > 0) {
    this.rewards.items.forEach(item => {
      const existingReward = user.rewards.find(reward => reward.type === item.type);
      if (existingReward) {
        existingReward.count += item.count;
      } else {
        user.rewards.push({
          type: item.type,
          count: item.count
        });
      }
    });
  }
  
  await user.save();
  
  // Update achievement statistics
  this.statistics.totalEarned += 1;
  this.statistics.lastEarned = new Date();
  
  // Update unique earners count
  const uniqueEarners = await User.countDocuments({
    achievements: this._id
  });
  this.statistics.uniqueEarners = uniqueEarners;
  
  await this.save();
  
  return true;
};

// Static method to get achievements by type
achievementSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to get achievements by category
achievementSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method to get available achievements for user
achievementSchema.statics.getAvailableForUser = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) return [];
  
  const query = { isActive: true };
  
  // Filter by role if achievement is role-based
  const roleBasedAchievements = await this.find({
    ...query,
    visibility: 'ROLE_BASED',
    roles: user.role
  });
  
  // Filter by team if achievement is team-only
  const teamAchievements = await this.find({
    ...query,
    visibility: 'TEAM_ONLY'
  });
  
  // Get public achievements
  const publicAchievements = await this.find({
    ...query,
    visibility: 'PUBLIC'
  });
  
  return [...roleBasedAchievements, ...teamAchievements, ...publicAchievements];
};

// Static method to get achievement statistics
achievementSchema.statics.getAchievementStats = async function() {
  const pipeline = [
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalEarned: { $sum: '$statistics.totalEarned' },
        avgEarners: { $avg: '$statistics.uniqueEarners' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Achievement', achievementSchema);
