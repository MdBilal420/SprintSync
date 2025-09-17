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
  is_admin?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
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
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  total_minutes?: number;
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
  estimated_minutes: number;
  acceptance_criteria: string[];
  technical_notes: string[];
}