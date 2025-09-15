# SHARPLE - Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Environment Setup

#### Backend Environment
Create `backend/.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/sharple

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SHARPLE
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🏗️ Project Structure

```
sharple-app/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand state management
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── hooks/           # Custom React hooks
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── utils/               # Utility functions
│   └── server.js            # Main server file
├── package.json             # Root package configuration
└── README.md
```

## 🔧 Features Implemented

### ✅ Completed Features

1. **Project Setup**
   - React 18 + Vite frontend
   - Node.js + Express backend
   - MongoDB with Mongoose
   - TypeScript support

2. **Authentication System**
   - JWT-based authentication
   - Role-based access control (Admin, Manager, Team Member)
   - Secure password handling
   - Session management

3. **Database Models**
   - User model with roles and permissions
   - Task model with status tracking
   - Project model with team management
   - Payroll model with calculations
   - Achievement model for gamification
   - Message model for chat system

4. **UI Components**
   - Glassmorphic design system
   - Neumorphic elements
   - Responsive layout
   - Modern component library

5. **Dashboard System**
   - Role-based dashboards
   - Performance metrics
   - Task and project overview
   - Gamification elements

### 🚧 Features in Development

1. **Task Management**
   - Task creation and assignment
   - Progress tracking
   - Comment system
   - File attachments

2. **Project Management**
   - Project creation and planning
   - Team assignment
   - Milestone tracking
   - Roadmap visualization

3. **Time Management**
   - Pomodoro timer
   - TAT (Turnaround Time) tracking
   - Attendance management
   - Leave requests

4. **Payroll System**
   - Automated salary calculations
   - Tax computations
   - Performance bonuses
   - Payslip generation

5. **Gamification**
   - Points and rewards system
   - Achievement badges
   - Leaderboards
   - Level progression

6. **Real-time Chat**
   - Direct messaging
   - Group chats
   - Project-specific channels
   - File sharing

7. **Analytics & Reporting**
   - Performance analytics
   - Business intelligence
   - Custom reports
   - Data visualization

## 🎨 Design System

### Color Palette
- Primary: Blue (#3B82F6)
- Secondary: Indigo (#6366F1)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Font Family: Inter, system-ui, sans-serif
- Headings: Font weights 600-700
- Body: Font weight 400

### Components
- Glassmorphic cards with backdrop blur
- Neumorphic buttons and inputs
- Consistent spacing and borders
- Smooth animations and transitions

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based permissions
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet security headers

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🚀 Deployment

### Frontend (Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

### Backend (Netlify Functions)
```bash
cd backend
# Configure for Netlify Functions
# Deploy to Netlify
```

### Database (MongoDB Atlas)
- Create MongoDB Atlas cluster
- Update MONGODB_URI in environment variables
- Configure network access and database user

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)

### Task Management
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Project Management
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**SHARPLE** - Comprehensive Workforce Management & Productivity Application
Built with ❤️ using React, Node.js, and MongoDB
