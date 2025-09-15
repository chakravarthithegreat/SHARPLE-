const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Message Content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message content cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'TASK_UPDATE', 'PROJECT_UPDATE'],
    default: 'TEXT'
  },
  
  // Participants
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message sender is required']
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: Date,
    deliveredAt: Date
  }],
  
  // Chat Context
  chatType: {
    type: String,
    enum: ['DIRECT', 'GROUP', 'PROJECT', 'TASK', 'TEAM'],
    required: [true, 'Chat type is required']
  },
  chatId: {
    type: String,
    required: [true, 'Chat ID is required']
  },
  
  // Context References
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  
  // Attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    thumbnail: String
  }],
  
  // Message Status
  status: {
    type: String,
    enum: ['SENT', 'DELIVERED', 'READ', 'FAILED'],
    default: 'SENT'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reply and Thread
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isThread: {
    type: Boolean,
    default: false
  },
  threadCount: {
    type: Number,
    default: 0
  },
  
  // Mentions and Tags
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    position: {
      start: Number,
      end: Number
    }
  }],
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // System Messages
  systemData: {
    action: {
      type: String,
      enum: ['USER_JOINED', 'USER_LEFT', 'TASK_CREATED', 'TASK_UPDATED', 'PROJECT_CREATED', 'PROJECT_UPDATED']
    },
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // Privacy and Security
  isEncrypted: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flaggedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationAction: {
    type: String,
    enum: ['APPROVED', 'HIDDEN', 'DELETED', 'WARNING']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for message age
messageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for read count
messageSchema.virtual('readCount').get(function() {
  return this.recipients.filter(recipient => recipient.readAt).length;
});

// Virtual for delivery count
messageSchema.virtual('deliveryCount').get(function() {
  return this.recipients.filter(recipient => recipient.deliveredAt).length;
});

// Indexes for better query performance
messageSchema.index({ chatType: 1, chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ 'recipients.user': 1, createdAt: -1 });
messageSchema.index({ project: 1, createdAt: -1 });
messageSchema.index({ task: 1, createdAt: -1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ status: 1 });

// Pre-save middleware to extract hashtags and mentions
messageSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Extract hashtags
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(this.content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }
    this.hashtags = [...new Set(hashtags)]; // Remove duplicates
    
    // Store edit history if content is being modified
    if (this.isEdited && this.editHistory.length === 0) {
      this.editHistory.push({
        content: this.content,
        editedAt: new Date()
      });
    }
  }
  next();
});

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient && !recipient.readAt) {
    recipient.readAt = new Date();
    this.status = 'READ';
  }
  return this.save();
};

// Method to mark as delivered to user
messageSchema.methods.markAsDelivered = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient && !recipient.deliveredAt) {
    recipient.deliveredAt = new Date();
    if (this.status === 'SENT') {
      this.status = 'DELIVERED';
    }
  }
  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newContent) {
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to delete message
messageSchema.methods.deleteMessage = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Method to flag message
messageSchema.methods.flagMessage = function(userId, reason) {
  const existingFlag = this.flaggedBy.find(flag => flag.user.toString() === userId.toString());
  if (!existingFlag) {
    this.flaggedBy.push({
      user: userId,
      reason: reason
    });
    this.isFlagged = true;
  }
  return this.save();
};

// Static method to get messages by chat
messageSchema.statics.getByChat = function(chatType, chatId, limit = 50, skip = 0) {
  return this.find({
    chatType,
    chatId,
    isDeleted: false
  })
  .populate('sender', 'firstName lastName avatar')
  .populate('recipients.user', 'firstName lastName')
  .populate('replyTo', 'content sender')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get unread messages for user
messageSchema.statics.getUnreadForUser = function(userId) {
  return this.find({
    'recipients.user': userId,
    'recipients.readAt': { $exists: false },
    sender: { $ne: userId },
    isDeleted: false
  })
  .populate('sender', 'firstName lastName avatar')
  .sort({ createdAt: -1 });
};

// Static method to get message statistics
messageSchema.statics.getMessageStats = async function(filters = {}) {
  const pipeline = [
    { $match: { isDeleted: false, ...filters } },
    {
      $group: {
        _id: '$chatType',
        count: { $sum: 1 },
        avgLength: { $avg: { $strLenCP: '$content' } },
        totalAttachments: { $sum: { $size: '$attachments' } }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Static method to search messages
messageSchema.statics.searchMessages = function(query, userId, limit = 20) {
  return this.find({
    $text: { $search: query },
    $or: [
      { sender: userId },
      { 'recipients.user': userId }
    ],
    isDeleted: false
  })
  .populate('sender', 'firstName lastName avatar')
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

module.exports = mongoose.model('Message', messageSchema);
