/**
 * Authentication Controller
 * Handles authentication business logic and state management
 */

import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../models/hooks.ts';
import { loginUser, registerUser, logout, clearError, fetchCurrentUser } from '../models/slices/authSlice.ts';
import { addNotification } from '../models/slices/uiSlice.ts';
import type { UserLogin, UserCreate } from '../types/index.ts';

export const useAuthController = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  // Initialize authentication state
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  const handleLogin = useCallback(async (credentials: UserLogin) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Successfully logged in!',
        duration: 3000,
      }));
      navigate('/dashboard');
      return result;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : (error || 'Login failed');
      dispatch(addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      }));
      throw error;
    }
  }, [dispatch, navigate]);

  const handleRegister = useCallback(async (userData: UserCreate) => {
    try {
      const result = await dispatch(registerUser(userData)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Account created successfully!',
        duration: 3000,
      }));
      navigate('/dashboard');
      return result;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : (error || 'Registration failed');
      dispatch(addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      }));
      throw error;
    }
  }, [dispatch, navigate]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(addNotification({
      type: 'info',
      message: 'You have been logged out',
      duration: 3000,
    }));
    navigate('/login');
  }, [dispatch, navigate]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    try {
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      handleLogout();
    }
  }, [dispatch, handleLogout]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    handleLogin,
    handleRegister,
    handleLogout,
    clearAuthError,
    refreshUser,
  };
};