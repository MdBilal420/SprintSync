/**
 * VIEW LAYER - Project Details Page
 * Project details and member management interface
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Calendar, 
  CheckSquare2, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  Edit3,
  Trash2,
  UserPlus,
  Crown,
  Shield,
  User,
  Layout
} from 'lucide-react';
import { useProjectsController } from '../../controllers/projectsController';
import { useTasksController } from '../../controllers/tasksController';
import { useUIController } from '../../controllers/uiController';
import { MemberManagementModal } from '../../components/projects/MemberManagementModal';
import { CreateTaskModal, EditTaskModal } from '../../components/tasks';
import ProjectKanbanBoard from '../../components/projects/ProjectKanbanBoard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getStatusColor, formatStatus, getRelativeTime } from '../../utils/formatters';
import type { ProjectRole, Task } from '../../types';

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    currentProject,
    members,
    isLoading,
    error,
    loadProjectById,
    loadProjectMembers,
    handleClearError,
  } = useProjectsController();

  const {
    tasks,
    loadTasks,
    handleUpdateTaskStatus,
    openCreateTaskModal,
    openEditTaskModal,
    closeTaskModal,
  } = useTasksController();

  const { showNotification, modal } = useUIController();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load project and members on component mount
  useEffect(() => {
    if (projectId) {
      loadProjectById(projectId);
      loadProjectMembers(projectId);
      loadTasks({ project_id: projectId } as any);
    }
  }, [projectId, loadProjectById, loadProjectMembers, loadTasks]);

  // Get role icon
  const getRoleIcon = (role: ProjectRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'member':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Get role label
  const getRoleLabel = (role: ProjectRole) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return 'Member';
    }
  };

  // Handle task status change (for drag and drop)
  const handleTaskStatusChange = async (taskId: string, newStatus: any) => {
    try {
      await handleUpdateTaskStatus(taskId, newStatus);
      showNotification('success', 'Task status updated');
    } catch (error) {
      showNotification('error', 'Failed to update task status');
    }
  };

  // Handle task click to open edit modal
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    openEditTaskModal(task);
  };

  if (isLoading && !currentProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="card text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Project not found
        </h3>
        <p className="text-gray-500">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
          {currentProject.description && (
            <p className="text-gray-600 mt-1">
              {currentProject.description}
            </p>
          )}
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span>Created {getRelativeTime(currentProject.created_at)}</span>
            {!currentProject.is_active && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={`px-3 py-2 text-sm flex items-center ${viewMode === 'kanban' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setViewMode('kanban')}
            >
              <Layout className="h-4 w-4 mr-1" />
              Board
            </button>
          </div>
          
          <button
            className="btn-secondary inline-flex items-center"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Project
          </button>
          <button
            className="btn-primary inline-flex items-center"
            onClick={() => openCreateTaskModal(projectId)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <CheckSquare2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks?.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks?.filter(t => t.status === 'done').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {members?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error} 
          className="mb-4"
        />
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <ProjectKanbanBoard
          tasks={tasks || []}
          members={members || []}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskClick={handleTaskClick}
          onAddTask={() => openCreateTaskModal(projectId)}
        />
      )}

      {/* List View (existing implementation) */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Project Tasks</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View All
                </button>
              </div>
              
              {tasks && tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <span className={`${getStatusColor(task.status)} inline-flex items-center text-xs px-2 py-1 rounded`}>
                          {formatStatus(task.status)}
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-900 truncate max-w-xs">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(task.updated_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckSquare2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No tasks yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Create your first task for this project
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                <button 
                  className="btn-secondary inline-flex items-center text-sm"
                  onClick={() => setIsMemberModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
              
              <div className="space-y-3">
                {members && members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded-full bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            User {member.user_id.substring(0, 8)}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            {getRoleIcon(member.role)}
                            <span className="ml-1">{getRoleLabel(member.role)}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No members in this project
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={modal.type === 'createTask'}
        onClose={closeTaskModal}
        projectId={projectId}
      />
      
      {selectedTask && projectId && (
        <EditTaskModal
          isOpen={modal.type === 'editTask'}
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            closeTaskModal();
          }}
          projectId={projectId}
          members={members || []} // Pass members to EditTaskModal
        />
      )}

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        projectId={projectId || ''}
      />
    </div>
  );
};

export default ProjectDetailsPage;