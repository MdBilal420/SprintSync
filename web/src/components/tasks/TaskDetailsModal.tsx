/**
 * VIEW LAYER - Task Details Modal
 * Modal for viewing task details including creator and owner information
 */

import React from 'react';
import { X, User, Calendar, Clock, Folder, Users } from 'lucide-react';
import { formatMinutes, getRelativeTime } from '../../utils/formatters';
import type { Task, User as UserType } from '../../types';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  creator?: UserType;
  owner?: UserType;
  onClose: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  isOpen, 
  task, 
  creator, 
  owner, 
  onClose 
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Task Title and Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              )}
            </div>

            {/* Task Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Created By */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  Created by
                </div>
                <div className="text-sm text-gray-600">
                  {creator ? (
                    <div>
                      <div className="font-medium">{creator.email}</div>
                      <div className="text-xs text-gray-500">
                        {creator.is_admin ? 'Admin' : 'User'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">Loading...</div>
                  )}
                </div>
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 mr-2" />
                  Assigned to
                </div>
                <div className="text-sm text-gray-600">
                  {owner ? (
                    <div>
                      <div className="font-medium">{owner.email}</div>
                      <div className="text-xs text-gray-500">
                        {owner.is_admin ? 'Admin' : 'User'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">Unassigned</div>
                  )}
                </div>
              </div>

              {/* Project */}
              {task.project_id && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Folder className="h-4 w-4 mr-2" />
                    Project
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Project ID: {task.project_id}</div>
                    <div className="text-xs text-gray-500">Project details would be loaded here</div>
                  </div>
                </div>
              )}

              {/* Time Tracking */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Spent
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{formatMinutes(task.total_minutes)}</div>
                  <div className="text-xs text-gray-500">
                    {task.total_minutes > 0 ? 'Logged time' : 'No time logged'}
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{getRelativeTime(task.created_at)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(task.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              {task.updated_at !== task.created_at && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last Updated
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{getRelativeTime(task.updated_at)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(task.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Task Status */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.status === 'todo' ? 'To Do' :
                     task.status === 'in_progress' ? 'In Progress' :
                     'Done'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
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

export default TaskDetailsModal;
