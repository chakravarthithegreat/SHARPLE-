const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharple', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('🔄 Running in demo mode without database...');
  }
};

connectDB();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });
  
  // Join project room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`📁 User joined project ${projectId}`);
  });
  
  // Join team room
  socket.on('join-team', (teamId) => {
    socket.join(`team-${teamId}`);
    console.log(`👥 User joined team ${teamId}`);
  });
  
  // Handle chat messages
  socket.on('send-message', (data) => {
    // Broadcast message to appropriate room
    if (data.type === 'project') {
      io.to(`project-${data.projectId}`).emit('new-message', data);
    } else if (data.type === 'team') {
      io.to(`team-${data.teamId}`).emit('new-message', data);
    } else if (data.type === 'direct') {
      io.to(`user-${data.recipientId}`).emit('new-message', data);
    }
  });
  
  // Handle task updates
  socket.on('task-update', (data) => {
    // Broadcast task updates to relevant users
    if (data.projectId) {
      io.to(`project-${data.projectId}`).emit('task-updated', data);
    }
    if (data.teamId) {
      io.to(`team-${data.teamId}`).emit('task-updated', data);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/chat', require('./routes/chat'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Demo endpoint for testing without database
app.get('/api/demo', (req, res) => {
  res.json({
    message: 'SHARPLE Backend is running!',
    features: [
      'JWT Authentication',
      'Role-based Access Control',
      'Task Management',
      'Project Management',
      'Real-time Chat',
      'Gamification System',
      'Analytics & Reporting'
    ],
    status: 'Demo Mode'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 SHARPLE Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
