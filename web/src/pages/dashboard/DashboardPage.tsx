/**
 * VIEW LAYER - Dashboard page component
 * Pure UI component that receives data and callbacks from controller
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, Clock, Target, TrendingUp, FolderOpen, Users } from 'lucide-react';
import { useAuthController } from '../../controllers/authController.ts';
import { useTasksController } from '../../controllers/tasksController.ts';
import LoadingSpinner from '../../components/common/LoadingSpinner.tsx';
import ErrorMessage from '../../components/common/ErrorMessage.tsx';
import AIStatusCard from '../../components/common/AIStatusCard.tsx';
import { getStatusColor, formatMinutes, formatStatus } from '../../utils/formatters.ts';
import type { Task } from '../../types/index.ts';

const DashboardPage: React.FC = () => {
  const { user } = useAuthController();
  const { 
    tasks, 
    isLoading, 
    error, 
    loadTasks,
    updateFilters,
    getTaskStats 
  } = useTasksController();

  useEffect(() => {
    // Set filters for recent tasks and load them in a single effect
    updateFilters({ 
      sortBy: 'updated_at', 
      sortOrder: 'desc' 
    });
    
    // Load tasks with limit
    loadTasks({ limit: 5 });
  }, []); // Empty dependency array to run only once

  const stats = getTaskStats();

  // Pure UI functions are imported from view utilities

  if (isLoading && (!tasks || tasks.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="section-header">
        <h1 className="section-title">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="section-subtitle">
          Here's an overview of your project progress and recent activity.
        </p>
      </div>

      {/* AI Status and Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Status Card */}
        <div className="lg:col-span-1">
          <AIStatusCard />
        </div>
        
        {/* Statistics Cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Time Logged</p>
                  <p className="text-2xl font-bold text-gray-900">{formatMinutes(stats.totalMinutes)}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Management Quick Links */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/projects"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">Projects</h3>
              <p className="text-sm text-gray-500 mt-1">View and manage your projects</p>
            </div>
          </Link>
          
          <Link
            to="/team-members"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">Team Members</h3>
              <p className="text-sm text-gray-500 mt-1">View all team members</p>
            </div>
          </Link>
          
          {user?.is_admin && (
            <Link
              to="/admin"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
                <Target className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Admin Panel</h3>
                <p className="text-sm text-gray-500 mt-1">System-wide management</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          <Link
            to="/tasks"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
          >
            View All Tasks →
          </Link>
        </div>

        {error && <ErrorMessage message={error} className="mb-6" />}
        
        {(!tasks || tasks.length === 0) ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Get started by creating your first task to track your project progress.
            </p>
            <Link
              to="/tasks"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(tasks || []).map((task: Task) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex-1 mb-3 sm:mb-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={getStatusColor(task.status)}>
                      {formatStatus(task.status)}
                    </span>
                    {task.total_minutes > 0 && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatMinutes(task.total_minutes)} logged
                      </span>
                    )}
                  </div>
                </div>
                
                <Link
                  to={`/tasks/${task.id}`}
                  className="btn-secondary text-sm py-2 px-4 w-full sm:w-auto"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/tasks?action=create"
            className="btn-primary flex items-center justify-center py-4"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Task
          </Link>
          <Link
            to="/tasks?status=in_progress"
            className="btn-secondary flex items-center justify-center py-4"
          >
            <Clock className="h-5 w-5 mr-2" />
            View Active Tasks
          </Link>
          <Link
            to="/tasks?status=done"
            className="btn-secondary flex items-center justify-center py-4"
          >
            <Target className="h-5 w-5 mr-2" />
            View Completed
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;