/**
 * Utility functions for UI rendering and data formatting
 * Pure functions that transform data for display
 */

import type { TaskStatus } from '../types';

/**
 * Get CSS class for task status badge
 */
export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'todo': 
      return 'task-status-todo';
    case 'in_progress': 
      return 'task-status-in-progress';
    case 'done': 
      return 'task-status-done';
    default: 
      return 'task-status-todo';
  }
};

/**
 * Format minutes into human-readable time string
 */
export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

/**
 * Format status for display (replace underscores with spaces)
 */
export const formatStatus = (status: TaskStatus): string => {
  return status.replace('_', ' ');
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};