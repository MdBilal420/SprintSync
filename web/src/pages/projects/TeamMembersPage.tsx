/**
 * VIEW LAYER - Team Members Page
 * Global view of all team members across projects
 */

import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Calendar, Shield, Crown, User } from 'lucide-react';
import { useProjectsController } from '../../controllers/projectsController';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getRelativeTime } from '../../utils/formatters';

const TeamMembersPage: React.FC = () => {
  const {
    projects,
    members,
    isLoading,
    error,
    loadProjects,
    loadProjectMembers,
    getProjectName,
  } = useProjectsController();

  const [searchTerm, setSearchTerm] = useState('');

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load members for each project
  useEffect(() => {
    if (projects && projects.length > 0) {
      // Load members for each project
      projects.forEach(project => {
        loadProjectMembers(project.id);
      });
    }
  }, [projects, loadProjectMembers]);

  // Filter members based on search term
  const filteredMembers = members.filter(member => {
    // Check if member is defined before accessing properties
    if (!member) return false;
    
    // Since we don't have user details in the member object, we'll filter by ID for now
    // In a real implementation, we'd have user details attached to the member object
    return member.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           member.project_id?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'member':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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

  if (isLoading && (!members || members.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">
            View all team members across your projects
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by user ID or project..."
            className="input-field pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error} 
          className="mb-4"
        />
      )}

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching members' : 'No team members yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Members will appear once added to projects'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            // Skip rendering if member is undefined
            if (!member) return null;
            
            return (
              <div
                key={`${member.project_id}-${member.user_id}`}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-700 font-medium">
                        {member.user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {member.user.email?.split("@")[0] || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Project: {getProjectName(member.project_id) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    {getRoleIcon(member.role)}
                    <span className="ml-1">{getRoleLabel(member.role)}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Joined {getRelativeTime(member.created_at)}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Mail className="h-3 w-3 mr-1" />
                  <span>Last updated {getRelativeTime(member.updated_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Team Summary</h3>
          <span className="text-sm text-gray-500">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} across {projects?.length || 0} project{projects && projects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersPage;