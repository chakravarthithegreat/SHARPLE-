import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  CheckSquare, 
  FolderOpen, 
  Users, 
  TrendingUp,
  Clock,
  Star,
  Trophy,
  Target
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // Mock data - in real app, this would come from API
  const stats = {
    tasks: {
      total: 24,
      completed: 18,
      inProgress: 4,
      overdue: 2
    },
    projects: {
      total: 8,
      active: 5,
      completed: 2,
      onHold: 1
    },
    team: {
      total: 12,
      online: 8,
      offline: 4
    },
    performance: {
      points: user?.points || 0,
      level: user?.level || 'BEGINNER',
      efficiency: 87
    }
  };

  const recentTasks = [
    { id: 1, title: 'Update user dashboard', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2024-01-15' },
    { id: 2, title: 'Fix authentication bug', status: 'REVIEW', priority: 'URGENT', dueDate: '2024-01-14' },
    { id: 3, title: 'Design new landing page', status: 'TODO', priority: 'MEDIUM', dueDate: '2024-01-20' },
    { id: 4, title: 'Write API documentation', status: 'DONE', priority: 'LOW', dueDate: '2024-01-12' },
  ];

  const recentProjects = [
    { id: 1, name: 'E-commerce Platform', status: 'ACTIVE', progress: 75 },
    { id: 2, name: 'Mobile App Redesign', status: 'ACTIVE', progress: 45 },
    { id: 3, name: 'Data Analytics Dashboard', status: 'PLANNING', progress: 15 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'REVIEW': return 'text-yellow-600 bg-yellow-100';
      case 'TODO': return 'text-gray-600 bg-gray-100';
      case 'BLOCKED': return 'text-red-600 bg-red-100';
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'PLANNING': return 'text-blue-600 bg-blue-100';
      case 'ON_HOLD': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your work today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.tasks.total}</div>
            <p className="text-xs text-white/80">
              {stats.tasks.completed} completed, {stats.tasks.overdue} overdue
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.projects.total}</div>
            <p className="text-xs text-white/80">
              {stats.projects.active} active, {stats.projects.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Team</CardTitle>
            <Users className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.team.total}</div>
            <p className="text-xs text-white/80">
              {stats.team.online} online, {stats.team.offline} offline
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.performance.points}</div>
            <p className="text-xs text-white/80">
              {stats.performance.level} • {stats.performance.efficiency}% efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="h-5 w-5 mr-2" />
              Recent Tasks
            </CardTitle>
            <CardDescription>
              Your latest task updates and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              Recent Projects
            </CardTitle>
            <CardDescription>
              Projects you're working on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{project.progress}% complete</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Projects
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Section */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Trophy className="h-5 w-5 mr-2" />
            Your Progress
          </CardTitle>
          <CardDescription className="text-white/80">
            Keep up the great work! Earn more points and unlock achievements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-white">Points</h3>
              <p className="text-2xl font-bold text-white">{stats.performance.points}</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-white">Level</h3>
              <p className="text-2xl font-bold text-white">{stats.performance.level}</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-white">Efficiency</h3>
              <p className="text-2xl font-bold text-white">{stats.performance.efficiency}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
