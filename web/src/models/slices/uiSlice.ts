/**
 * MODEL LAYER - UI Slice
 * Manages UI state (modals, notifications, loading states)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface Modal {
  type: 'createTask' | 'editTask' | 'deleteTask' | 'aiSuggestion' | null;
  data?: any;
}

interface UIState {
  notifications: Notification[];
  modal: Modal;
  sidebarOpen: boolean;
  globalLoading: boolean;
}

const initialState: UIState = {
  notifications: [],
  modal: { type: null },
  sidebarOpen: false,
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<Modal>) => {
      state.modal = action.payload;
    },
    closeModal: (state) => {
      state.modal = { type: null };
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;