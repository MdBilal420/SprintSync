/**
 * CONTROLLER LAYER - Tasks Controller
 * Business logic for task management operations
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../models/store.ts';
import {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskTime,
  clearError,
  setFilters,
} from '../models/slices/tasksSlice.ts';
import { openModal, closeModal } from '../models/slices/uiSlice.ts';
import type { TaskCreate, TaskUpdate, TaskStatus } from '../types/index.ts';

// Custom hook for tasks management
export const useTasksController = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    tasks,
    currentTask,
    totalTasks,
    currentPage,
    totalPages,
    isLoading,
    error,
    filters,
  } = useSelector((state: RootState) => state.tasks);

  // Fetch tasks with current filters
  const loadTasks = useCallback(
    (params?: { skip?: number; limit?: number }) => {
      const filterParams = {
        project_id: filters.project_id,
        assigned_to_id: filters.assigned_to_id,
        status: filters.status,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
        ...params,
      };
      return dispatch(fetchTasks(filterParams));
    },
    [dispatch, filters]
  );

  // Fetch a specific task by ID
  const loadTaskById = useCallback(
    (taskId: string) => {
      return dispatch(fetchTaskById(taskId));
    },
    [dispatch]
  );

  // Create a new task
  const handleCreateTask = useCallback(
    async (taskData: TaskCreate) => {
      try {
        const result = await dispatch(createTask(taskData)).unwrap();
        dispatch(closeModal());
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Update an existing task
  const handleUpdateTask = useCallback(
    async (taskId: string, taskData: TaskUpdate) => {
      try {
        const result = await dispatch(updateTask({ taskId, taskData })).unwrap();
        dispatch(closeModal());
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Update task status
  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      try {
        const result = await dispatch(updateTask({ taskId, taskData: { status: newStatus } })).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Delete a task
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        dispatch(closeModal());
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Log time to a task
  const handleLogTime = useCallback(
    async (taskId: string, additionalMinutes: number) => {
      try {
        const result = await dispatch(updateTaskTime({ taskId, additionalMinutes })).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  // Clear error
  const clearTaskError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Modal actions
  const openCreateTaskModal = useCallback(() => {
    dispatch(openModal({ type: 'createTask' }));
  }, [dispatch]);

  const openEditTaskModal = useCallback((task: any) => {
    dispatch(openModal({ type: 'editTask', data: task }));
  }, [dispatch]);

  const openDeleteTaskModal = useCallback((taskId: string, taskTitle: string) => {
    dispatch(openModal({ type: 'deleteTask', data: { taskId, taskTitle } }));
  }, [dispatch]);

  // Close task modal
  const closeTaskModal = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  // Calculate task statistics
  const getTaskStats = useCallback(() => {
    // Ensure tasks is always an array
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    
    return {
      total: safeTasks.length,
      inProgress: safeTasks.filter(task => task.status === 'in_progress').length,
      completed: safeTasks.filter(task => task.status === 'done').length,
      totalMinutes: safeTasks.reduce((sum, task) => sum + (task.total_minutes || 0), 0),
    };
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
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleLogTime,
    updateFilters,
    clearTaskError,
    openCreateTaskModal,
    openEditTaskModal,
    openDeleteTaskModal,
    closeTaskModal,
    getTaskStats, // Add the missing function
  };
};