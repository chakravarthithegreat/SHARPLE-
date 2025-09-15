import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckSquare, Plus, Filter, Search } from 'lucide-react';

const TasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage and track your tasks</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="h-5 w-5 mr-2" />
            Task Management
          </CardTitle>
          <CardDescription>
            Create, assign, and track tasks across your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Task Management Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              This feature is under development. You'll be able to create, assign, and track tasks here.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
