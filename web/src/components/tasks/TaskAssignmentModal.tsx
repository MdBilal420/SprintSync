import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../models/store.ts';
import { fetchProjectMembers } from '../../models/slices/projectsSlice.ts';
import { updateTask } from '../../models/slices/tasksSlice.ts';
import ErrorMessage from '../common/ErrorMessage';
import type { Task, ProjectMember } from '../../types';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
}

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  task,
  projectId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, isLoading: isMembersLoading } = useSelector((state: RootState) => state.projects);
  const [selectedUserId, setSelectedUserId] = useState<string>(task.owner_id || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load project members when the modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      dispatch(fetchProjectMembers(projectId));
    }
  }, [isOpen, projectId, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await dispatch(updateTask({
        taskId: task.id,
        taskData: {
          owner_id: selectedUserId || undefined,
          // No need to include project_id since it's optional in TaskUpdate
        }
      })).unwrap();
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Assign Task</h3>
          <p className="text-sm text-gray-500 mt-1">{task.title}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && <ErrorMessage message={error} />}

            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned to
              </label>
              {isMembersLoading ? (
                <div className="text-gray-500">Loading team members...</div>
              ) : (
                <select
                  id="assignee"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((member: ProjectMember) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.user_id} ({member.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};