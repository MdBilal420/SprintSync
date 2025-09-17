/**
 * UI Controller
 * Handles UI state and notifications business logic
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../models/hooks.ts';
import {
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  setGlobalLoading,
} from '../models/slices/uiSlice.ts';

export const useUIController = () => {
  const dispatch = useAppDispatch();
  const { notifications, modal, sidebarOpen, globalLoading } = useAppSelector(state => state.ui);

  const showNotification = useCallback((    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    duration = 5000
  ) => {
    dispatch(addNotification({ type, message, duration }));
  }, [dispatch]);

  const hideNotification = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const openModalDialog = useCallback((modalType: any, data?: any) => {
    dispatch(openModal({ type: modalType, data }));
  }, [dispatch]);

  const closeModalDialog = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleSetSidebarOpen = useCallback((open: boolean) => {
    dispatch(setSidebarOpen(open));
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
    sidebarOpen,
    globalLoading,
    
    // Actions
    showNotification,
    hideNotification,
    clearAllNotifications,
    openModalDialog,
    closeModalDialog,
    handleToggleSidebar,
    handleSetSidebarOpen,
    setLoading,
  };
};