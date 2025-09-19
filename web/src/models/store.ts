/**
 * MODEL LAYER - Redux Store Configuration
 * Centralized state management using Redux Toolkit
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.ts';
import tasksReducer from './slices/tasksSlice.ts';
import uiReducer from './slices/uiSlice.ts';
import aiReducer from './slices/aiSlice.ts';
import projectsReducer from './slices/projectsSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    ui: uiReducer,
    ai: aiReducer,
    projects: projectsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;