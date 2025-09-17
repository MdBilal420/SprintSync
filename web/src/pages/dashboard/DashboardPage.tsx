/**
 * VIEW LAYER - Dashboard page component
 * Pure UI component that receives data and callbacks from controller
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, Clock, Target, TrendingUp } from 'lucide-react';
import { useAuthController } from '../../controllers/authController.ts';
import { useTasksController } from '../../controllers/tasksController.ts';
import LoadingSpinner from '../../components/common/LoadingSpinner.tsx';
import ErrorMessage from '../../components/common/ErrorMessage.tsx';
import { getStatusColor, formatMinutes, formatStatus } from '../../utils/formatters.ts';
import type { Task } from '../../types/index.ts';

const DashboardPage: React.FC = () => {
  const { user } = useAuthController();
  const { 
    tasks, 
    isLoading, 
    error, 
    loadTasks, 
    getTaskStats 
  } = useTasksController();

  useEffect(() => {
    loadTasks({ limit: 5, sort_by: 'updated_at', sort_order: 'desc' });
  }, [loadTasks]);

  const stats = getTaskStats();

  // Pure UI functions are imported from view utilities

  if (isLoading) {
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Time Logged</p>
              <p className="text-3xl font-bold text-gray-900">{formatMinutes(stats.totalMinutes)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          <Link
            to="/tasks"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center space-x-4">
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
                  className="btn-secondary text-sm py-2 px-4"
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