/**
 * MODEL LAYER - Tasks Slice
 * Manages tasks state and operations
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskCreate, TaskUpdate } from '../../types/index.ts';
import apiService from '../api';

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  totalTasks: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  totalTasks: 0,
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  error: null,
  filters: {
    sortBy: 'updated_at',
    sortOrder: 'desc',
  },
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: {
    skip?: number;
    limit?: number;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getTasks(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const task = await apiService.getTask(taskId);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: TaskCreate, { rejectWithValue }) => {
    try {
      const task = await apiService.createTask(taskData);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }: { taskId: string; taskData: TaskUpdate }, { rejectWithValue }) => {
    try {
      const task = await apiService.updateTask(taskId, taskData);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete task');
    }
  }
);

export const updateTaskTime = createAsyncThunk(
  'tasks/updateTaskTime',
  async ({ taskId, additionalMinutes }: { taskId: string; additionalMinutes: number }, { rejectWithValue }) => {
    try {
      const task = await apiService.updateTaskTime(taskId, additionalMinutes);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update task time');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<TasksState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.items;
        state.totalTasks = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.pages;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
        state.totalTasks += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.totalTasks -= 1;
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update task time
      .addCase(updateTaskTime.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      });
  },
});

export const { clearError, setFilters, clearCurrentTask, setCurrentPage } = tasksSlice.actions;
export default tasksSlice.reducer;