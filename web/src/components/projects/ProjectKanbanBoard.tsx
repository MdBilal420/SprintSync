/**
 * Project Kanban Board Component
 * Displays tasks in a Kanban board layout with drag and drop functionality
 */

import React, { useMemo, useState } from 'react';
import { 
  User, 
  MoreHorizontal, 
  Crown,
  Shield,
  User as UserIcon
} from 'lucide-react';
import type { Task, TaskStatus, ProjectMember } from '../../types';
import { getStatusColor, formatStatus } from '../../utils/formatters';
import { useSelector } from 'react-redux';

import type { RootState } from '../../models/store';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskDrop: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  status, 
  tasks, 
  onTaskDrop, 
  onTaskClick 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onTaskDrop(taskId, status);
    }
  };

  return (
    <div 
      className={`flex flex-col h-full rounded-lg border ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto min-h-[400px]">
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
              className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-move"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              
              {task.description && (
                <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <span className={`${getStatusColor(task.status)} text-xs px-2 py-1 rounded`}>
                  {formatStatus(task.status)}
                </span>
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 border-2 border-dashed rounded-xl w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MemberCardProps {
  member: ProjectMember;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'member':
        return <UserIcon className="h-3 w-3" />;
      default:
        return <UserIcon className="h-3 w-3" />;
    }
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return 'Member';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="rounded-full bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {member.user ? member.user['email'] : member.user_id.substring(0, 8)}
          </p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span className="flex items-center">
              {getRoleIcon(member.role)}
              <span className="ml-1">{getRoleLabel(member.role)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProjectKanbanBoardProps {
  tasks: Task[];
  members: ProjectMember[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onAddMember: () => void;
}

const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({ 
  tasks, 
  members, 
  onTaskStatusChange,
  onTaskClick,
  onAddMember
}) => {

const {
    currentProject
  } = useSelector((state: RootState) => state.projects);

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done')
  };

  const projectMembers = useMemo(() => {
    if (!currentProject) {
      return [];
    }
    return members.filter(member => member.project_id === currentProject.id);
  }, [currentProject, members]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Kanban Columns */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <KanbanColumn
          title="To Do"
          status="todo"
          tasks={tasksByStatus.todo}
          onTaskDrop={onTaskStatusChange}
          onTaskClick={onTaskClick}
        />
        
        <KanbanColumn
          title="In Progress"
          status="in_progress"
          tasks={tasksByStatus.in_progress}
          onTaskDrop={onTaskStatusChange}
          onTaskClick={onTaskClick}
        />
        
        <KanbanColumn
          title="Done"
          status="done"
          tasks={tasksByStatus.done}
          onTaskDrop={onTaskStatusChange}
          onTaskClick={onTaskClick}
        />
      </div>
      
      {/* Members Column */}
      <div className="flex flex-col h-full rounded-lg border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Team Members</h3>
            <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
              {members.length}
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            <button 
              className="w-full flex items-center justify-center p-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-500 hover:text-blue-700 hover:border-blue-400 transition-colors"
              onClick={onAddMember}
            >
              <User className="h-4 w-4 mr-1" />
              <span className="text-sm">Add Member</span>
            </button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {projectMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
            
            {projectMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="h-8 w-8 mx-auto text-gray-300" />
                <p className="text-sm mt-2">No members in this project</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKanbanBoard;