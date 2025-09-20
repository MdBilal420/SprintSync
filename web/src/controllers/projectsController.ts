/**
 * CONTROLLER LAYER - Projects Controller
 * Business logic for project management operations
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../models/store.ts';
import {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
  clearError,
  setCurrentProject,
} from '../models/slices/projectsSlice.ts';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectMemberCreate,
  ProjectMemberUpdate,
} from '../types/index.ts';

// Custom hook for projects management
export const useProjectsController = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    projects,
    currentProject,
    members,
    totalProjects,
    currentPage,
    totalPages,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.projects);

  // Filter out any undefined members
  const validMembers = members?.filter(member => member !== undefined) || [];

  // Fetch all projects
  const loadProjects = useCallback(
    (params?: { skip?: number; limit?: number }) => {
      return dispatch(fetchProjects(params || {}));
    },
    [dispatch]
  );

  // Fetch a specific project by ID
  const loadProjectById = useCallback(
    (projectId: string) => {
      return dispatch(fetchProjectById(projectId));
    },
    [dispatch]
  );

  // Create a new project
  const handleCreateProject = useCallback(
    async (projectData: ProjectCreate) => {
      try {
        const result = await dispatch(createProject(projectData)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Update an existing project
  const handleUpdateProject = useCallback(
    async (projectId: string, projectData: ProjectUpdate) => {
      try {
        const result = await dispatch(updateProject({ projectId, projectData })).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Delete a project
  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Set current project
  const handleSetCurrentProject = useCallback(
    (project: Project | null) => {
      dispatch(setCurrentProject(project));
    },
    [dispatch]
  );

  // Fetch project members (single page)
  const loadProjectMembers = useCallback(
    (projectId: string) => {
      return dispatch(fetchProjectMembers(projectId));
    },
    [dispatch]
  );

  // Add a member to a project
  const handleAddProjectMember = useCallback(
    async (projectId: string, memberData: ProjectMemberCreate) => {
      try {
        const result = await dispatch(addProjectMember({ projectId, memberData })).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Remove a member from a project
  const handleRemoveProjectMember = useCallback(
    async (projectId: string, userId: string) => {
      try {
        await dispatch(removeProjectMember({ projectId, userId })).unwrap();
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getProjectName = useCallback(
    (projectId: string) => {
      const project = projects.find(project => project.id === projectId);
      return project?.name || '';
    },
    [projects]
  );

  return {
    // State
    projects,
    currentProject,
    members: validMembers,
    totalProjects,
    currentPage,
    totalPages,
    isLoading,
    error,

    // Actions
    loadProjects,
    loadProjectById,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleSetCurrentProject,
    loadProjectMembers,
    handleAddProjectMember,
    handleRemoveProjectMember,
    handleClearError,
    getProjectName,
  };
};