import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Folder, 
  CheckSquare2, 
  Users, 
  BarChart3, 
  Settings, 
  UserCog,
  Calendar,
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const features = [
    {
      title: 'Project Management',
      description: 'Create and manage projects with team collaboration',
      icon: Folder,
      path: '/projects',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Task Tracking',
      description: 'Track tasks with status, time logging, and assignments',
      icon: CheckSquare2,
      path: '/tasks',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Team Collaboration',
      description: 'Assign tasks and manage team members',
      icon: Users,
      path: '/projects',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Analytics & Reporting',
      description: 'View project progress and team performance',
      icon: BarChart3,
      path: '/admin',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Admin Panel',
      description: 'System-wide management for administrators',
      icon: UserCog,
      path: '/admin',
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Settings',
      description: 'Configure your preferences and account settings',
      icon: Settings,
      path: '/settings',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to SprintSync - Your collaborative sprint planning tool
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Folder className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckSquare2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-100 p-3">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hours Logged</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Link 
              key={index} 
              to={feature.path}
              className="card hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-blue-600 text-sm font-medium group-hover:underline">
                  Get started →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
        
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No recent activity
          </h3>
          <p className="text-gray-500">
            Your recent project and task activities will appear here
          </p>
        </div>
      </div>
    </div>
  );
};