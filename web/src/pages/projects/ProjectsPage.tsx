/**
 * VIEW LAYER - Projects Page
 * Main project management interface
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectsController } from '../../controllers/projectsController';
import { useUIController } from '../../controllers/uiController';
import { ProjectCreationModal } from '../../components/projects/ProjectCreationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import type { ProjectMember } from '../../types';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    projects,
    members,
    isLoading,
    error,
    loadProjects,
  } = useProjectsController();

  const { showNotification } = useUIController();

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleProjectCreated = (projectId: string) => {
    showNotification('success', 'Project created successfully');
    loadProjects(); // Refresh the projects list
  };

  // Filter projects based on search
  const filteredProjects = (projects || []).filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Navigate to project details page
  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading && (!projects || projects.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const projectMembers = filteredProjects.reduce((acc, val) => {
    const mb = members.filter(m => m.project_id === val.id);
    acc[val.id] = mb;
    return acc;
  }, {} as Record<string, ProjectMember[]>);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your team projects and collaborations
          </p>
        </div>
        
        <button
          className="btn-primary inline-flex items-center w-full sm:w-auto justify-center"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Search and Count */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="input-field pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <span className="inline-flex items-center px-3 rounded-md bg-gray-100 text-gray-800">
            {filteredProjects.length} of {projects?.length || 0} projects
          </span>
          <button
            className="btn-secondary inline-flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error} 
          className="mb-4"
        />
      )}

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Get started by creating your first project'
            }
          </p>
          {!searchTerm && (
            <button
              className="btn-primary inline-flex items-center"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {project.name}
                </h3>
                {project.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
              
              {project.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                {projectMembers[project.id]?.length ?<div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{projectMembers[project.id]?.length} members</span>
                </div>:<div/>}
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

    </div>
  );
};

export default ProjectsPage;