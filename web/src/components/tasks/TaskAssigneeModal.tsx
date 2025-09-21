/**
 * VIEW LAYER - Task Assignee Modal
 * Modal for assigning/unassigning tasks to any user
 */

import React, { useState, useEffect } from 'react';
import { X, User, Users } from 'lucide-react';
import { useTasksController } from '../../controllers/tasksController';
import { useUIController } from '../../controllers/uiController';
import { getUsers } from '../../models/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import type { Task, User as UserType } from '../../types';

interface TaskAssigneeModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
}

const TaskAssigneeModal: React.FC<TaskAssigneeModalProps> = ({ isOpen, task, onClose }) => {
  const { handleUpdateTask, isLoading } = useTasksController();
  const { showNotification } = useUIController();
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Update selected user when task changes
  useEffect(() => {
    if (task) {
      setSelectedUserId(task.owner_id || '');
    }
  }, [task]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const response = await getUsers();
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response && Array.isArray((response as any).items)) {
        setUsers((response as any).items);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task) return;

    try {
      await handleUpdateTask(task.id, {
        owner_id: selectedUserId || undefined
        // No need to include project_id since it's optional in TaskUpdate
      });
      
      const action = selectedUserId ? 'assigned' : 'unassigned';
      showNotification('success', `Task ${action} successfully!`);
      handleClose();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update task assignment');
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setError(null);
    onClose();
  };

  const getCurrentAssigneeName = () => {
    if (!task?.owner_id) return 'Unassigned';
    const user = users.find(u => u.id === task.owner_id);
    return user ? user.email : `User ${task.owner_id.slice(0, 8)}...`;
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Assign Task
            </h2>
            <p className="text-sm text-gray-500 mt-1">{task.title}</p>
          </div>
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
            {/* Current Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Assignment
              </label>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                {getCurrentAssigneeName()}
              </div>
            </div>

            {/* Error Display */}
            {error && <ErrorMessage message={error} />}

            {/* User Selection */}
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                Assign to
              </label>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span className="text-gray-500">Loading users...</span>
                </div>
              ) : (
                <select
                  id="assignee"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email} {user.is_admin ? '(Admin)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
              <div className="flex items-start">
                <User className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-800 mb-1">Assignment Rules:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Only admins can assign tasks to other users</li>
                    <li>• Task owners can unassign themselves</li>
                    <li>• Task creators can unassign the task</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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
              disabled={isLoading || loadingUsers}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskAssigneeModal;
