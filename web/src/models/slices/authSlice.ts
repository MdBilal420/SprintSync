/**
 * MODEL LAYER - Authentication Slice
 * Manages authentication state and user data
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, UserLogin, UserCreate } from '../../types/index.ts';
import * as apiService from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
};

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: UserLogin, { rejectWithValue }) => {
    try {
      const tokens = await apiService.login(credentials);
      // Store the token immediately so the next API call can use it
      localStorage.setItem('auth_token', tokens.access_token);
      const user = await apiService.getCurrentUser();
      return { tokens, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: UserCreate, { rejectWithValue }) => {
    try {
      // Register the user
      await apiService.register(userData);
      
      // Small delay to ensure registration is fully processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Login with the same credentials
      const tokens = await apiService.login({
        email: userData.email,
        password: userData.password,
      });
      
      // Store the token immediately so the next API call can use it
      localStorage.setItem('auth_token', tokens.access_token);
      const currentUser = await apiService.getCurrentUser();
      return { tokens, user: currentUser };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { tokens, user } = action.payload;
        state.isLoading = false;
        state.user = user;
        state.token = tokens.access_token;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('auth_token', tokens.access_token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { tokens, user } = action.payload;
        state.isLoading = false;
        state.user = user;
        state.token = tokens.access_token;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('auth_token', tokens.access_token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;