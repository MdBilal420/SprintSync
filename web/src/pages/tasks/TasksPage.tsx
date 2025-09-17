/**
 * VIEW LAYER - Tasks page component
 * Pure UI component that receives data and callbacks from controller
 */

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, CheckSquare, Clock, Target } from 'lucide-react';
import { useTasksController } from '../../controllers/tasksController.ts';
import LoadingSpinner from '../../components/common/LoadingSpinner.tsx';
import ErrorMessage from '../../components/common/ErrorMessage.tsx';
import { getStatusColor, formatMinutes, formatStatus } from '../../utils/formatters.ts';
import type { Task } from '../../types/index.ts';

const TasksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  
  const { 
    tasks, 
    isLoading, 
    error, 
    loadTasks, 
    getTaskStats 
  } = useTasksController();

  useEffect(() => {
    const filters: any = { limit: 50 };
    if (statusFilter !== 'all') {
      filters.status = statusFilter;
    }
    if (searchTerm) {
      filters.search = searchTerm;
    }
    loadTasks(filters);
  }, [loadTasks, statusFilter, searchTerm]);

  const stats = getTaskStats();

  const filteredTasks = tasks?.filter((task: Task) => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage and track your project tasks</p>
        </div>
        <Link
          to="/tasks/new"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Task
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Todo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todo}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-gray-500"></div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        {error && <ErrorMessage message={error} className="mb-6" />}
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              {searchTerm ? 
                'Try adjusting your search terms or filters.' :
                'Create your first task to get started with project management.'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/tasks/new"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Task
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task: Task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={getStatusColor(task.status)}>
                      {formatStatus(task.status)}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {task.total_minutes > 0 && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatMinutes(task.total_minutes)} logged
                      </span>
                    )}
                    <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="ml-6 flex items-center space-x-3">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;