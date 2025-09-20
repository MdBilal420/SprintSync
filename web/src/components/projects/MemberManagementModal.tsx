import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../models/store.ts';
import {
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
} from '../../models/slices/projectsSlice.ts';
import ErrorMessage from '../common/ErrorMessage';
import type { ProjectMember, ProjectMemberCreate } from '../../types';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, isLoading: isMembersLoading, error } = useSelector((state: RootState) => state.projects);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'admin'>('member');
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Load project members when the modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      dispatch(fetchProjectMembers(projectId));
    }
  }, [isOpen, projectId, dispatch]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError(null);

    try {
      const memberData: ProjectMemberCreate = {
        user_id: newMemberUserId,
        role: newMemberRole,
      };

      await dispatch(addProjectMember({ projectId, memberData })).unwrap();
      // Reset form
      setNewMemberUserId('');
      setNewMemberRole('member');
    } catch (err: any) {
      setAddError(err.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await dispatch(removeProjectMember({ projectId, userId })).unwrap();
    } catch (err: any) {
      setAddError(err.message || 'Failed to remove member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Manage Team Members</h3>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
          {error && <ErrorMessage message={error} />}
          
          {/* Add Member Form */}
          <div className="border border-gray-200 rounded-md p-4">
            <h4 className="font-medium text-gray-900 mb-3">Add Member</h4>
            {addError && <ErrorMessage message={addError} className="mb-3" />}
            
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label htmlFor="user-id" className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  id="user-id"
                  value={newMemberUserId}
                  onChange={(e) => setNewMemberUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as 'member' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isAdding}
              >
                {isAdding ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          </div>
          
          {/* Members List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
            
            {isMembersLoading ? (
              <div className="text-gray-500 text-center py-4">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No members in this project</div>
            ) : (
              <div className="space-y-2">
                {members.map((member: ProjectMember) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div>
                      <div className="font-medium text-gray-900">{member.user_id}</div>
                      <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};