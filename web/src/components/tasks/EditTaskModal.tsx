/**
 * VIEW LAYER - Task Edit Modal
 * Modal for editing existing tasks
 */

import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { useTasksController } from '../../controllers/tasksController';
import { useUIController } from '../../controllers/uiController';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatMinutes } from '../../utils/formatters';
import type { Task, TaskUpdate, TaskStatus } from '../../types';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, task, onClose }) => {
  const { handleUpdateTask, handleLogTime, isLoading } = useTasksController();
  const { showNotification } = useUIController();
  
  const [formData, setFormData] = useState<TaskUpdate>({
    title: '',
    description: '',
    status: 'todo',
    total_minutes: 0,
  });

  const [timeToAdd, setTimeToAdd] = useState<string>('');
  const [errors, setErrors] = useState<Partial<TaskUpdate>>({});

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        total_minutes: task.total_minutes,
      });
    }
  }, [task]);

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskUpdate> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !validateForm()) {
      return;
    }

    try {
      await handleUpdateTask(task.id, formData);
      showNotification('success', 'Task updated successfully!');
      handleClose();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update task');
    }
  };

  const handleAddTime = async () => {
    if (!task || !timeToAdd.trim()) {
      return;
    }

    const minutes = parseInt(timeToAdd);
    if (isNaN(minutes) || minutes <= 0) {
      showNotification('error', 'Please enter a valid number of minutes');
      return;
    }

    try {
      await handleLogTime(task.id, minutes);
      setTimeToAdd('');
      showNotification('success', `Added ${minutes} minutes to task`);
      // Update form data to reflect new total
      setFormData(prev => ({
        ...prev,
        total_minutes: (prev.total_minutes || 0) + minutes
      }));
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to log time');
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      total_minutes: 0,
    });
    setTimeToAdd('');
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof TaskUpdate, value: string | TaskStatus | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="edit-title"
                type="text"
                className={`input-field w-full ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="edit-description"
                rows={4}
                className={`input-field w-full resize-none ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter task description (optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="edit-status"
                className="input-field w-full"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)}
                disabled={isLoading}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Time Tracking */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Time Tracking
                </h3>
                <span className="text-sm text-gray-500">
                  Total: {formatMinutes(formData.total_minutes || 0)}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Minutes"
                  className="input-field flex-1"
                  value={timeToAdd}
                  onChange={(e) => setTimeToAdd(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="btn-secondary w-full sm:w-auto whitespace-nowrap"
                  disabled={isLoading || !timeToAdd.trim()}
                >
                  Add Time
                </button>
              </div>
              
              {/* Quick time buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[15, 30, 60].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => {
                      setTimeToAdd(minutes.toString());
                      setTimeout(() => handleAddTime(), 100);
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    disabled={isLoading}
                  >
                    +{minutes}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto min-w-[120px] flex items-center justify-center"
            disabled={isLoading || !formData.title?.trim()}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;