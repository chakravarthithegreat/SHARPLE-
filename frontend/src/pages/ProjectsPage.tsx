import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FolderOpen, Plus } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Project Management
          </CardTitle>
          <CardDescription>
            Create and manage projects with team collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Management Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              This feature is under development. You'll be able to create and manage projects here.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsPage;
