/**
 * HTTP service for SprintSync API
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  User, 
  UserCreate, 
  UserLogin, 
  Task, 
  TaskCreate, 
  TaskUpdate, 
  AuthTokens,
  PaginatedResponse,
  AITaskSuggestion,
  TaskDescriptionRequest,
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectMember,
  ProjectMemberCreate,
  ProjectMemberUpdate
} from '../types/index.ts';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const register = async (userData: UserCreate): Promise<User> => {
  const response: AxiosResponse<User> = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials: UserLogin): Promise<AuthTokens> => {
  const response: AxiosResponse<AuthTokens> = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response: AxiosResponse<User> = await api.get('/auth/me');
  return response.data;
};

// Project endpoints
export const getProjects = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<PaginatedResponse<Project>> => {
  const response: AxiosResponse<PaginatedResponse<Project>> = await api.get('/projects/', { params });
  return response.data;
};

export const getProject = async (projectId: string): Promise<Project> => {
  const response: AxiosResponse<Project> = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const createProject = async (projectData: ProjectCreate): Promise<Project> => {
  const response: AxiosResponse<Project> = await api.post('/projects/', projectData);
  return response.data;
};

export const updateProject = async (projectId: string, projectData: ProjectUpdate): Promise<Project> => {
  const response: AxiosResponse<Project> = await api.put(`/projects/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}`);
};

export const getProjectMembers = async (projectId: string, params?: {
  skip?: number;
  limit?: number;
}): Promise<PaginatedResponse<ProjectMember>> => {
  const response: AxiosResponse<PaginatedResponse<ProjectMember>> = await api.get(`/projects/${projectId}/members`, { params });
  return response.data;
};

export const addProjectMember = async (projectId: string, memberData: ProjectMemberCreate): Promise<ProjectMember> => {
  const response: AxiosResponse<ProjectMember> = await api.post(`/projects/${projectId}/members`, memberData);
  return response.data;
};

export const removeProjectMember = async (projectId: string, userId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/members/${userId}`);
};

export const updateProjectMember = async (projectId: string, userId: string, memberData: ProjectMemberUpdate): Promise<ProjectMember> => {
  const response: AxiosResponse<ProjectMember> = await api.patch(`/projects/${projectId}/members/${userId}`, memberData);
  return response.data;
};

// Task endpoints
export const getTasks = async (params?: {
  project_id?: string;
  assigned_to_id?: string;
  skip?: number;
  limit?: number;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Task>> => {
  const response: AxiosResponse<PaginatedResponse<Task>> = await api.get('/tasks/', { params });
  return response.data;
};

export const getTask = async (taskId: string): Promise<Task> => {
  const response: AxiosResponse<Task> = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (taskData: TaskCreate): Promise<Task> => {
  const response: AxiosResponse<Task> = await api.post('/tasks/', taskData);
  return response.data;
};

export const updateTask = async (taskId: string, taskData: TaskUpdate): Promise<Task> => {
  const response: AxiosResponse<Task> = await api.patch(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

export const updateTaskTime = async (taskId: string, additionalMinutes: number): Promise<Task> => {
  const response: AxiosResponse<Task> = await api.patch(
    `/tasks/${taskId}/time?minutes=${additionalMinutes}`
  );
  return response.data;
};

// AI endpoints
export const checkAIStatus = async (): Promise<{ available: boolean; model?: string; configured: boolean }> => {
  const response = await api.get('/ai/status');
  return response.data;
};

export const suggestTaskDescription = async (request: TaskDescriptionRequest): Promise<AITaskSuggestion> => {
  const response: AxiosResponse<AITaskSuggestion> = await api.post(
    '/ai/suggest/task-description',
    request
  );
  return response.data;
};

export const suggestTaskTitles = async (params: {
  context: string;
  project_type?: string;
  count?: number;
}): Promise<{ suggestions: string[]; ai_generated: boolean }> => {
  const response = await api.post('/ai/suggest/task-title', null, { params });
  return response.data;
};

// User management (admin only)
export const getUsers = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> => {
  const response: AxiosResponse<PaginatedResponse<User>> = await api.get('/users', { params });
  return response.data;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response: AxiosResponse<User> = await api.patch(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

// Health check
export const healthCheck = async (): Promise<{ status: string; database: string; ai_service: string }> => {
  const response = await api.get('/health');
  return response.data;
};

// Export axios instance for advanced usage if needed
export { api };