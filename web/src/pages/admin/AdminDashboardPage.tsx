import React, { useEffect, useState } from 'react';
import { useTasksController } from '../../controllers/tasksController';
import { useProjectsController } from '../../controllers/projectsController';
import { UserManagementPanel } from '../../components/admin/UserManagementPanel';
import { ProjectAnalyticsPanel } from '../../components/admin/ProjectAnalyticsPanel';
import ErrorMessage from '../../components/common/ErrorMessage';
import type { Task, Project } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { tasks, isLoading: isTasksLoading, error: tasksError, loadTasks } = useTasksController();
  const { projects, isLoading: isProjectsLoading, error: projectsError, loadProjects } = useProjectsController();
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'users' | 'analytics'>('analytics');

  useEffect(() => {
    loadTasks({ skip: 0, limit: 100 }); // Load first 100 tasks
    loadProjects({ skip: 0, limit: 100 }); // Load first 100 projects
  }, [loadTasks, loadProjects]);

  // Filter tasks to show only those with project assignments
  const projectTasks = tasks.filter(task => task.project_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          System-wide task and project management
        </p>
      </div>

      {/* Error Display */}
      {(tasksError || projectsError) && (
        <ErrorMessage 
          message={tasksError || projectsError || 'An error occurred'} 
        />
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'analytics' ? (
        <ProjectAnalyticsPanel />
      ) : activeTab === 'tasks' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {isTasksLoading ? (
              <li className="px-6 py-4 text-center">
                <div className="text-gray-500">Loading tasks...</div>
              </li>
            ) : projectTasks.length === 0 ? (
              <li className="px-6 py-12 text-center">
                <div className="text-gray-500">No project tasks found</div>
              </li>
            ) : (
              projectTasks.map((task: Task) => (
                <li key={task.id}>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {task.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>Project ID: {task.project_id}</span>
                          {task.assigned_to_id && (
                            <span className="ml-2">Assigned to: {task.assigned_to_id}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="text-sm text-gray-500">
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{task.description}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : activeTab === 'projects' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {isProjectsLoading ? (
              <li className="px-6 py-4 text-center">
                <div className="text-gray-500">Loading projects...</div>
              </li>
            ) : projects.length === 0 ? (
              <li className="px-6 py-12 text-center">
                <div className="text-gray-500">No projects found</div>
              </li>
            ) : (
              projects.map((project: Project) => (
                <li key={project.id}>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </p>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>Owner: {project.owner_id}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {project.is_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="text-sm text-gray-500">
                          Created: {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {project.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{project.description}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        <UserManagementPanel />
      )}
    </div>
  );
};