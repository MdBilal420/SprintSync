/**
 * MODEL LAYER - AI Slice
 * Manages AI-related state and operations
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AITaskSuggestion, TaskDescriptionRequest } from '../../types';
import { checkAIStatus, suggestTaskDescription, suggestTaskTitles } from '../api';

interface AIState {
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  lastSuggestion: AITaskSuggestion | null;
  titleSuggestions: string[];
  model?: string;
}

const initialState: AIState = {
  isAvailable: false,
  isLoading: false,
  error: null,
  lastSuggestion: null,
  titleSuggestions: [],
};

// Async thunks
export const fetchAIStatus = createAsyncThunk(
  'ai/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkAIStatus();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to check AI status');
    }
  }
);

export const generateTaskDescription = createAsyncThunk(
  'ai/generateTaskDescription',
  async (request: TaskDescriptionRequest, { rejectWithValue }) => {
    try {
      const response = await suggestTaskDescription(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate task description');
    }
  }
);

export const generateTaskTitles = createAsyncThunk(
  'ai/generateTaskTitles',
  async (params: { context: string; project_type?: string; count?: number }, { rejectWithValue }) => {
    try {
      const response = await suggestTaskTitles(params);
      return response.suggestions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate task titles');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastSuggestion: (state) => {
      state.lastSuggestion = null;
    },
    clearTitleSuggestions: (state) => {
      state.titleSuggestions = [];
    },
  },
  extraReducers: (builder) => {
    // AI Status
    builder.addCase(fetchAIStatus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAIStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAvailable = action.payload.available;
      state.model = action.payload.model;
    });
    builder.addCase(fetchAIStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAvailable = false;
    });

    // Task Description Generation
    builder.addCase(generateTaskDescription.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(generateTaskDescription.fulfilled, (state, action) => {
      state.isLoading = false;
      state.lastSuggestion = action.payload;
    });
    builder.addCase(generateTaskDescription.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Task Title Generation
    builder.addCase(generateTaskTitles.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(generateTaskTitles.fulfilled, (state, action) => {
      state.isLoading = false;
      state.titleSuggestions = action.payload;
    });
    builder.addCase(generateTaskTitles.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearLastSuggestion, clearTitleSuggestions } = aiSlice.actions;
export default aiSlice.reducer;