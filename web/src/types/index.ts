/**
 * TypeScript type definitions for SprintSync frontend
 */

// User types
export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  confirm_password: string;
  is_admin?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

// Project types
export type ProjectRole = 'owner' | 'admin' | 'member';

export interface Project {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ProjectMember {
  user: any;
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberCreate {
  user_id: string;
  role: ProjectRole;
}

export interface ProjectMemberUpdate {
  role: ProjectRole;
}

// Task types
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  total_minutes: number;
  user_id: string;
  project_id: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  project_id?: string;  // Made optional since it's sent as a query parameter
  owner_id?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  total_minutes?: number;
  project_id?: string;  // Made optional again
  user_id?: string;  // Add user_id for assignee
  owner_id?: string;
}

// Authentication types
export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Error types
export interface ApiError {
  detail: string;
  status_code?: number;
}

// AI types
export interface AITaskSuggestion {
  title: string;
  description: string;
  acceptance_criteria: string[];
  technical_notes: string[];
  estimated_hours?: number;
  tags: string[];
  ai_generated: boolean;
}

export interface TaskDescriptionRequest {
  title: string;
  context?: string;
  project_type?: string;
  complexity?: string;
}