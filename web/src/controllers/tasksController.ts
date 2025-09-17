/**
 * Tasks Controller
 * Handles task management business logic and state management
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../models/hooks.ts';
import {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskTime,
  clearError,
  setFilters,
  clearCurrentTask,
  setCurrentPage,
} from '../models/slices/tasksSlice.ts';
import { addNotification, openModal, closeModal } from '../models/slices/uiSlice.ts';
import type { TaskCreate, TaskUpdate, TaskStatus } from '../types/index.ts';

export const useTasksController = () => {
  const dispatch = useAppDispatch();
  const {
    tasks,
    currentTask,
    totalTasks,
    currentPage,
    totalPages,
    isLoading,
    error,
    filters,
  } = useAppSelector(state => state.tasks);

  const loadTasks = useCallback(async (params: {
    skip?: number;
    limit?: number;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}) => {
    try {
      await dispatch(fetchTasks(params)).unwrap();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to load tasks',
        duration: 5000,
      }));
    }
  }, [dispatch]);

  const loadTaskById = useCallback(async (taskId: string) => {
    try {
      await dispatch(fetchTaskById(taskId)).unwrap();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to load task',
        duration: 5000,
      }));
    }
  }, [dispatch]);

  const handleCreateTask = useCallback(async (taskData: TaskCreate) => {
    try {
      await dispatch(createTask(taskData)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Task created successfully!',
        duration: 3000,
      }));
      dispatch(closeModal());
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to create task',
        duration: 5000,
      }));
    }
  }, [dispatch]);

  const handleUpdateTask = useCallback(async (taskId: string, taskData: TaskUpdate) => {
    try {
      await dispatch(updateTask({ taskId, taskData })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Task updated successfully!',
        duration: 3000,
      }));
      dispatch(closeModal());
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to update task',
        duration: 5000,
      }));
    }
  }, [dispatch]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Task deleted successfully!',
        duration: 3000,
      }));
      dispatch(closeModal());
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to delete task',
        duration: 5000,
      }));
    }
  }, [dispatch]);

  const handleUpdateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    try {
      await dispatch(updateTask({ taskId, taskData: { status } })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Task status updated to ${status.replace('_', ' ')}`,
        duration: 3000,
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to update task status',
        duration: 5000,
      }));
    }
  }, [dispatch]);

  const handleLogTime = useCallback(async (taskId: string, additionalMinutes: number) => {
    try {
      await dispatch(updateTaskTime({ taskId, additionalMinutes })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Logged ${additionalMinutes} minutes to task`,
        duration: 3000,
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to log time',
        duration: 5000,
      }));
    }
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const changePage = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  const clearTaskError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentTaskData = useCallback(() => {
    dispatch(clearCurrentTask());
  }, [dispatch]);

  // Modal actions
  const openCreateTaskModal = useCallback(() => {
    dispatch(openModal({ type: 'createTask' }));
  }, [dispatch]);

  const openEditTaskModal = useCallback((task: any) => {
    dispatch(openModal({ type: 'editTask', data: task }));
  }, [dispatch]);

  const openDeleteTaskModal = useCallback((taskId: string) => {
    dispatch(openModal({ type: 'deleteTask', data: { taskId } }));
  }, [dispatch]);

  const closeTaskModal = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  // Statistics calculations
  const getTaskStats = useCallback(() => {
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'done').length,
      totalMinutes: tasks.reduce((sum, t) => sum + t.total_minutes, 0),
    };
    return stats;
  }, [tasks]);

  return {
    // State
    tasks,
    currentTask,
    totalTasks,
    currentPage,
    totalPages,
    isLoading,
    error,
    filters,
    
    // Actions
    loadTasks,
    loadTaskById,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateTaskStatus,
    handleLogTime,
    updateFilters,
    changePage,
    clearTaskError,
    clearCurrentTaskData,
    
    // Modal actions
    openCreateTaskModal,
    openEditTaskModal,
    openDeleteTaskModal,
    closeTaskModal,
    
    // Computed
    getTaskStats,
  };
};