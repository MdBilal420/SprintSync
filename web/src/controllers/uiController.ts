/**
 * UI Controller
 * Handles UI state and notifications business logic
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../models/hooks.ts';
import {
  addNotification,
  removeNotification,
  setGlobalLoading,
} from '../models/slices/uiSlice.ts';

export const useUIController = () => {
  const dispatch = useAppDispatch();
  const { notifications, modal, globalLoading } = useAppSelector(state => state.ui);

  const showNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 5000) => {
    dispatch(addNotification({ type, message, duration }));
  }, [dispatch]);

  const hideNotification = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const setLoading = useCallback((loading: boolean) => {
    dispatch(setGlobalLoading(loading));
  }, [dispatch]);

  // Auto-remove notifications after their duration
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  return {
    // State
    notifications,
    modal,
    globalLoading,
    
    // Actions
    showNotification,
    hideNotification,
    setLoading,
  };
};