/**
 * VIEW LAYER - Task Delete Modal
 * Confirmation modal for deleting tasks
 */

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTasksController } from '../../controllers/tasksController';
import { useUIController } from '../../controllers/uiController';
import LoadingSpinner from '../common/LoadingSpinner';

interface DeleteTaskModalProps {
  isOpen: boolean;
  taskId: string | null;
  taskTitle?: string;
  onClose: () => void;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({ 
  isOpen, 
  taskId, 
  taskTitle,
  onClose 
}) => {
  const { handleDeleteTask, isLoading } = useTasksController();
  const { showNotification } = useUIController();

  const handleConfirmDelete = async () => {
    if (!taskId) return;

    try {
      await handleDeleteTask(taskId);
      showNotification('success', 'Task deleted successfully');
      onClose();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to delete task');
    }
  };

  if (!isOpen || !taskId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">Delete Task</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          
          {taskTitle && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Task to delete:</p>
              <p className="text-sm text-gray-600 mt-1">"{taskTitle}"</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 min-w-[120px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Task'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskModal;