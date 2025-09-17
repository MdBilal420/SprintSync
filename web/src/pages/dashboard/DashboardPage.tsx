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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Time Logged</p>
              <p className="text-2xl font-bold text-gray-900">{formatMinutes(stats.totalMinutes)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="p-6">
          {error && <ErrorMessage message={error} className="mb-4" />}
          
          {(!tasks || tasks.length === 0) ? (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first task.</p>
              <Link
                to="/tasks"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {(tasks || []).map((task: Task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={getStatusColor(task.status)}>
                        {formatStatus(task.status)}
                      </span>
                      {task.total_minutes > 0 && (
                        <span className="text-xs text-gray-500">
                          {formatMinutes(task.total_minutes)} logged
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to={`/tasks/${task.id}`}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link
            to="/tasks?action=create"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Link>
          <Link
            to="/tasks?status=in_progress"
            className="btn-secondary inline-flex items-center"
          >
            <Clock className="h-4 w-4 mr-2" />
            Active Tasks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;