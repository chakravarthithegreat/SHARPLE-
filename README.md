# SHARPLE - Workforce Management & Productivity App

A comprehensive business ecosystem for modern organizations featuring role-based authentication, real-time collaboration, and gamified productivity tracking.

## 🚀 Features

- **Role-Based Access Control**: Admin, Manager, and Team Member roles
- **Task Management**: Intelligent assignment and progress tracking
- **Project Management**: Roadmap creation and milestone tracking
- **Time Management**: Pomodoro timer, TAT tracking, and attendance
- **Payroll System**: Automated salary processing and tax calculations
- **Gamification**: Rewards, achievements, and leaderboards
- **Real-time Chat**: Direct, group, and project-based messaging
- **Analytics**: Performance metrics and business intelligence
- **PWA Ready**: Mobile-optimized with offline capabilities

## 🏗️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS with glassmorphic design
- Zustand for state management
- shadcn/ui components
- Framer Motion animations

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- WebSocket for real-time features

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
sharple-app/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── package.json       # Root package configuration
└── README.md         # This file
```

## 🔧 Environment Setup

Create `.env` files in both frontend and backend directories with the required environment variables.

## 📱 PWA Features

- Offline capabilities
- Push notifications
- Mobile-optimized interface
- Fast loading with optimized assets

## 🎯 User Roles

- **ADMIN**: Complete system oversight and employee management
- **MANAGER**: Team oversight and project management
- **TEAM_MEMBER**: Personal task management and tracking

## 🏆 Gamification

- Rewards wallet with collectible items
- Achievement system with badges
- Progressive level system
- Performance-based point calculations
- Daily/weekly/monthly challenges

## 📊 Analytics

- Individual and team productivity metrics
- Time tracking and attendance patterns
- Project analytics and progress tracking
- Financial reporting and payroll analytics

## 🚀 Deployment

The application is configured for Netlify deployment with serverless functions and MongoDB Atlas for database hosting.
