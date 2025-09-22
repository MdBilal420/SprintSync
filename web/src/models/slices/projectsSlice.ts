/**
 * MODEL LAYER - Projects Slice
 * Manages projects state and operations
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Project, ProjectCreate, ProjectUpdate, ProjectMember, ProjectMemberCreate, User } from '../../types/index.ts';
import * as apiService from '../api';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  members: ProjectMember[]; // This will now store members from all projects
  membersByProject: Record<string, ProjectMember[]>; // New field to store members by project ID
  accessibleUsers: User[]; // New field to store accessible users
  totalProjects: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  members: [],
  membersByProject: {},
  accessibleUsers: [],
  totalProjects: 0,
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAccessibleUsers = createAsyncThunk(
  'projects/fetchAccessibleUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await apiService.getAccessibleUsers();
      return users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch accessible users');
    }
  }
);

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params: {
    skip?: number;
    limit?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getProjects(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const project = await apiService.getProject(projectId);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: ProjectCreate, { rejectWithValue }) => {
    try {
      const project = await apiService.createProject(projectData);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, projectData }: { projectId: string; projectData: ProjectUpdate }, { rejectWithValue }) => {
    try {
      const project = await apiService.updateProject(projectId, projectData);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteProject(projectId);
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete project');
    }
  }
);

export const fetchProjectMembers = createAsyncThunk(
  'projects/fetchProjectMembers',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getProjectMembers(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch project members');
    }
  }
);

export const addProjectMember = createAsyncThunk(
  'projects/addProjectMember',
  async ({ projectId, memberData }: { projectId: string; memberData: ProjectMemberCreate }, { rejectWithValue }) => {
    try {
      const member = await apiService.addProjectMember(projectId, memberData);
      return member;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add project member');
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  'projects/removeProjectMember',
  async ({ projectId, userId }: { projectId: string; userId: string }, { rejectWithValue }) => {
    try {
      await apiService.removeProjectMember(projectId, userId);
      return { projectId, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove project member');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.items;
        state.totalProjects = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.pages;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.unshift(action.payload);
        state.totalProjects += 1;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(project => project.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(project => project.id !== action.payload);
        state.totalProjects -= 1;
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch project members
      .addCase(fetchProjectMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store members by project ID
        const projectId = (action.meta.arg as any).projectId;
        const newMembers = action.payload.items || action.payload || [];
        
        // Append new members to existing members for this project
        if (state.membersByProject[projectId]) {
          // Filter out any duplicates based on user_id
          const existingUserIds = new Set(state.membersByProject[projectId].map(m => m.user_id));
          const uniqueNewMembers = newMembers.filter(m => !existingUserIds.has(m.user_id));
          state.membersByProject[projectId] = [...state.membersByProject[projectId], ...uniqueNewMembers];
        } else {
          state.membersByProject[projectId] = newMembers;
        }
        // Aggregate all members from all projects
        state.members = Object.values(state.membersByProject).flat();
      })
      .addCase(fetchProjectMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove the bloated fetchAllProjectMembers reducers
      // Fetch all project members
      // .addCase(fetchAllProjectMembers.pending, (state) => {
      //   state.isLoading = true;
      //   state.error = null;
      // })
      // .addCase(fetchAllProjectMembers.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   // Store all members by project ID
      //   const { projectId, members } = action.payload;
      //   state.membersByProject[projectId] = members;
      //   // Aggregate all members from all projects
      //   state.members = Object.values(state.membersByProject).flat();
      // })
      // .addCase(fetchAllProjectMembers.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.error = action.payload as string;
      // })
      // Add project member
      .addCase(addProjectMember.pending, (state) => {
        state.error = null;
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        // Ensure the member object is valid before adding
        if (action.payload && action.payload.project_id && action.payload.user_id) {
          state.members.push(action.payload);
          // Also add to the project-specific members array if it exists
          if (state.membersByProject[action.payload.project_id]) {
            state.membersByProject[action.payload.project_id].push(action.payload);
          } else {
            // Create the array if it doesn't exist
            state.membersByProject[action.payload.project_id] = [action.payload];
          }
        }
      })
      .addCase(addProjectMember.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Remove project member
      .addCase(removeProjectMember.pending, (state) => {
        state.error = null;
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        // Ensure we have valid projectId and userId
        if (action.payload && action.payload.projectId && action.payload.userId) {
          state.members = state.members.filter(member => 
            member && member.user_id !== action.payload.userId
          );
          // Also remove from the project-specific members array if it exists
          if (state.membersByProject[action.payload.projectId]) {
            state.membersByProject[action.payload.projectId] = state.membersByProject[action.payload.projectId].filter(
              member => member && member.user_id !== action.payload.userId
            );
          }
        }
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch accessible users
      .addCase(fetchAccessibleUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccessibleUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessibleUsers = action.payload;
      })
      .addCase(fetchAccessibleUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
