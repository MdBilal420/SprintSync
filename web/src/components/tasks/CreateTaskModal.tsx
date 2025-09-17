/**
 * VIEW LAYER - Task Creation Modal
 * Modal for creating new tasks
 */

import React, { useState } from 'react';
import { X, Wand2 } from 'lucide-react';
import { useTasksController } from '../../controllers/tasksController';
import { useUIController } from '../../controllers/uiController';
import LoadingSpinner from '../common/LoadingSpinner';
import type { TaskCreate } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { handleCreateTask, isLoading } = useTasksController();
  const { showNotification } = useUIController();
  
  const [formData, setFormData] = useState<TaskCreate>({
    title: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<TaskCreate>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskCreate> = {};
    
    if (!formData.title.trim()) {
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
    
    if (!validateForm()) {
      return;
    }

    try {
      await handleCreateTask(formData);
      showNotification('success', 'Task created successfully!');
      handleClose();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to create task');
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '' });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof TaskCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAISuggestion = () => {
    showNotification('info', 'AI suggestions coming soon!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
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

            {/* AI Suggestion Button */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={handleAISuggestion}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Get AI Suggestions
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                AI will help generate a detailed description and acceptance criteria
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary min-w-[120px] flex items-center justify-center"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;