/**
 * AI Controller
 * Handles AI-related business logic and state management
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../models/hooks';
import {
  fetchAIStatus,
  generateTaskDescription,
  generateTaskTitles,
  clearError,
  clearLastSuggestion,
  clearTitleSuggestions,
} from '../models/slices/aiSlice';
import { addNotification } from '../models/slices/uiSlice';
import type { TaskDescriptionRequest } from '../types';

export const useAIController = () => {
  const dispatch = useAppDispatch();
  const {
    isAvailable,
    isLoading,
    error,
    lastSuggestion,
    titleSuggestions,
    model,
  } = useAppSelector(state => state.ai);

  // Check AI status on mount
  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = useCallback(async () => {
    try {
      await dispatch(fetchAIStatus()).unwrap();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'warning',
        message: 'AI service is currently unavailable. Basic functionality will be provided.',
        duration: 5000,
      }));
    }
  }, [dispatch]);

  const handleGenerateTaskDescription = useCallback(async (request: TaskDescriptionRequest) => {
    try {
      const result = await dispatch(generateTaskDescription(request)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: result.ai_generated ? 'AI task description generated!' : 'Task description created with fallback.',
        duration: 3000,
      }));
      return result;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to generate task description',
        duration: 5000,
      }));
      throw error;
    }
  }, [dispatch]);

  const handleGenerateTaskTitles = useCallback(async (params: {
    context: string;
    project_type?: string;
    count?: number;
  }) => {
    try {
      const titles = await dispatch(generateTaskTitles(params)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Task title suggestions generated!',
        duration: 3000,
      }));
      return titles;
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to generate task titles',
        duration: 5000,
      }));
      throw error;
    }
  }, [dispatch]);

  const clearAIError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuggestion = useCallback(() => {
    dispatch(clearLastSuggestion());
  }, [dispatch]);

  const clearTitles = useCallback(() => {
    dispatch(clearTitleSuggestions());
  }, [dispatch]);

  return {
    // State
    isAvailable,
    isLoading,
    error,
    lastSuggestion,
    titleSuggestions,
    model,
    
    // Actions
    checkAIStatus,
    handleGenerateTaskDescription,
    handleGenerateTaskTitles,
    clearAIError,
    clearSuggestion,
    clearTitles,
  };
};