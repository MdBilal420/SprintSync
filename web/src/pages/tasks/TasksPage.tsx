/**
 * VIEW LAYER - Tasks Page
 * Main task management interface with list view and filtering
 */

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  CheckSquare2, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  Edit3,
  Trash2,
  Timer,
  Users,
  Folder
} from 'lucide-react';
import { useTasksController } from '../../controllers/tasksController';
import { useProjectsController } from '../../controllers/projectsController';
import { useUIController } from '../../controllers/uiController';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import EditTaskModal from '../../components/tasks/EditTaskModal';
import DeleteTaskModal from '../../components/tasks/DeleteTaskModal';
import { TaskAssignmentModal } from '../../components/tasks/TaskAssignmentModal';
import { getStatusColor, formatMinutes, formatStatus, getRelativeTime } from '../../utils/formatters';
import type { TaskStatus } from '../../types';

const TasksPage: React.FC = () => {
  const {
    tasks,
    isLoading,
    error,
    filters,
    loadTasks,
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleLogTime,
    updateFilters,
    clearTaskError,
    openCreateTaskModal,
    openEditTaskModal,
    openDeleteTaskModal,
    closeTaskModal,
  } = useTasksController();

  const {
    projects,
    loadProjects,
  } = useProjectsController();

  const { showNotification, modal } = useUIController();
  const [assignTask, setAssignTask] = useState<{taskId: string, projectId: string} | null>(null);

  // Load tasks and projects on component mount
  useEffect(() => {
    loadTasks();
    loadProjects();
  }, [loadTasks, loadProjects]);

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter tasks based on search and filters
  const filteredTasks = (tasks || []).filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesProject = !filters.project_id || task.project_id === filters.project_id;
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await handleUpdateTaskStatus(taskId, newStatus);
      showNotification('success', `Task moved to ${formatStatus(newStatus)}`);
    } catch (error) {
      showNotification('error', 'Failed to update task status');
    }
  };

  // Handle quick time logging
  const handleQuickTimeLog = async (taskId: string, minutes: number) => {
    try {
      await handleLogTime(taskId, minutes);
      showNotification('success', `Logged ${minutes} minutes`);
    } catch (error) {
      showNotification('error', 'Failed to log time');
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <CheckSquare2 className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'done':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <CheckSquare2 className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    switch (currentStatus) {
      case 'todo':
        return 'in_progress';
      case 'in_progress':
        return 'done';
      case 'done':
        return null; // No next status
      default:
        return null;
    }
  };

  const getPrevStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    switch (currentStatus) {
      case 'done':
        return 'in_progress';
      case 'in_progress':
        return 'todo';
      case 'todo':
        return null; // No previous status
      default:
        return null;
    }
  };

  if (isLoading && (!tasks || tasks.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your tasks and track progress
          </p>
        </div>
        
        <button
          onClick={openCreateTaskModal}
          className="btn-primary inline-flex items-center w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="input-field pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary inline-flex items-center w-full sm:w-auto justify-center ${showFilters ? 'bg-blue-50 border-blue-200' : ''}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>

        {/* Sort */}
        <button
          onClick={() => updateFilters({ 
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
          })}
          className="btn-secondary inline-flex items-center w-full sm:w-auto justify-center"
        >
          {filters.sortOrder === 'asc' ? 
            <SortAsc className="h-4 w-4 mr-2" /> : 
            <SortDesc className="h-4 w-4 mr-2" />
          }
          Sort
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-4">Filter Tasks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="input-field w-full"
                value={filters.status || ''}
                onChange={(e) => updateFilters({ status: e.target.value || undefined })}
              >
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                className="input-field w-full"
                value={filters.project_id || ''}
                onChange={(e) => updateFilters({ project_id: e.target.value || undefined })}
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="input-field w-full"
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
              >
                <option value="updated_at">Last Updated</option>
                <option value="created_at">Created Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => updateFilters({ status: undefined, project_id: undefined })}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error} 
          className="mb-4"
        />
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="card text-center py-12">
          <CheckSquare2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filters.status ? 'No matching tasks' : 'No tasks yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filters.status 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first task'
            }
          </p>
          {!searchTerm && !filters.status && (
            <button
              onClick={openCreateTaskModal}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              {/* Mobile Task Header */}
              <div className="flex items-start justify-between mb-3 md:hidden">
                <div className="flex items-center space-x-2">
                  {/* Status Badge */}
                  <span className={`${getStatusColor(task.status)} inline-flex items-center text-xs px-2 py-1`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{formatStatus(task.status)}</span>
                  </span>
                  
                  {/* Time Logged */}
                  {task.total_minutes > 0 && (
                    <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded">
                      <Timer className="h-3 w-3 mr-1" />
                      {formatMinutes(task.total_minutes)}
                    </span>
                  )}
                </div>
                
                {/* Mobile Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {selectedTask === task.id && (
                    <div className="absolute right-0 top-6 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            openEditTaskModal(task);
                            setSelectedTask(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Task
                        </button>
                        <button
                          onClick={() => {
                            openDeleteTaskModal(task.id, task.title);
                            setSelectedTask(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </button>
                        {task.project_id && (
                          <button
                            onClick={() => {
                              setAssignTask({ taskId: task.id, projectId: task.project_id || '' });
                              setSelectedTask(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Assign Task
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Desktop Task Header */}
              <div className="hidden md:flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Status Badge */}
                  <span className={`${getStatusColor(task.status)} inline-flex items-center`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{formatStatus(task.status)}</span>
                  </span>
                  
                  {/* Time Logged */}
                  {task.total_minutes > 0 && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <Timer className="h-3 w-3 mr-1" />
                      {formatMinutes(task.total_minutes)}
                    </span>
                  )}
                  
                  {/* Project */}
                  {task.project_id && (
                    <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded">
                      <Folder className="h-3 w-3 mr-1" />
                      {/* Project name would need to be looked up from projects array */}
                      Project
                    </span>
                  )}
                  
                  {/* Assigned To */}
                  {task.assigned_to_id && task.assigned_to_id !== task.user_id && (
                    <span className="text-xs text-gray-500 flex items-center bg-blue-100 px-2 py-1 rounded">
                      <Users className="h-3 w-3 mr-1" />
                      Assigned
                    </span>
                  )}
                </div>
                
                {/* Desktop Actions */}
                <div className="flex items-center space-x-2">
                  {/* Status Navigation */}
                  <div className="flex items-center space-x-1">
                    {getPrevStatus(task.status) && (
                      <button
                        onClick={() => handleStatusChange(task.id, getPrevStatus(task.status)!)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={`Move to ${formatStatus(getPrevStatus(task.status)!)}`}
                      >
                        ←
                      </button>
                    )}
                    
                    {getNextStatus(task.status) && (
                      <button
                        onClick={() => handleStatusChange(task.id, getNextStatus(task.status)!)}
                        className="p-1 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                        title={`Move to ${formatStatus(getNextStatus(task.status)!)}`}
                      >
                        →
                      </button>
                    )}
                  </div>

                  {/* Quick Time Log */}
                  {task.status === 'in_progress' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleQuickTimeLog(task.id, 15)}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        +15m
                      </button>
                      <button
                        onClick={() => handleQuickTimeLog(task.id, 30)}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        +30m
                      </button>
                    </div>
                  )}

                  {/* More Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {selectedTask === task.id && (
                      <div className="absolute right-0 top-8 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              openEditTaskModal(task);
                              setSelectedTask(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Task
                          </button>
                          <button
                            onClick={() => {
                              openDeleteTaskModal(task.id, task.title);
                              setSelectedTask(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                          </button>
                          {task.project_id && (
                            <button
                              onClick={() => {
                                setAssignTask({ taskId: task.id, projectId: task.project_id || '' });
                                setSelectedTask(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Assign Task
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>Created {getRelativeTime(task.created_at)}</span>
                  {task.updated_at !== task.created_at && (
                    <span>• Updated {getRelativeTime(task.updated_at)}</span>
                  )}
                </div>
              </div>
              
              {/* Mobile Actions - Status Navigation and Quick Time Log */}
              <div className="mt-4 pt-4 border-t border-gray-100 md:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Status Navigation */}
                  <div className="flex items-center space-x-2">
                    {getPrevStatus(task.status) && (
                      <button
                        onClick={() => handleStatusChange(task.id, getPrevStatus(task.status)!)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        ← {formatStatus(getPrevStatus(task.status)!)}
                      </button>
                    )}
                    
                    {getNextStatus(task.status) && (
                      <button
                        onClick={() => handleStatusChange(task.id, getNextStatus(task.status)!)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        {formatStatus(getNextStatus(task.status)!)} →
                      </button>
                    )}
                  </div>
                  
                  {/* Quick Time Log */}
                  {task.status === 'in_progress' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Quick log:</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleQuickTimeLog(task.id, 15)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          +15m
                        </button>
                        <button
                          onClick={() => handleQuickTimeLog(task.id, 30)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          +30m
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay for updates */}
      {isLoading && tasks && tasks.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <LoadingSpinner size="md" />
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={modal.type === 'createTask'}
        onClose={closeTaskModal}
      />
      
      <EditTaskModal
        isOpen={modal.type === 'editTask'}
        task={modal.data || null}
        onClose={closeTaskModal}
      />
      
      <DeleteTaskModal
        isOpen={modal.type === 'deleteTask'}
        taskId={modal.data?.taskId || null}
        taskTitle={modal.data?.taskTitle}
        onClose={closeTaskModal}
      />
      
      {assignTask && (
        <TaskAssignmentModal
          isOpen={true}
          onClose={() => setAssignTask(null)}
          task={tasks.find(t => t.id === assignTask.taskId) || tasks[0]}
          projectId={assignTask.projectId}
        />
      )}
    </div>
  );
};

export default TasksPage;