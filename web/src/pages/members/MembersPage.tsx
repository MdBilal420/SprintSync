/**
 * VIEW LAYER - Members Page
 * Global view of all users in the system
 */

import React, { useEffect, useState } from 'react';
import { Users, Search, Calendar, Shield, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthController } from '../../controllers/authController';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getRelativeTime } from '../../utils/formatters';
import * as apiService from '../../models/api';
import type { User as UserType } from '../../types';

const MembersPage: React.FC = () => {
  const { user: currentUser } = useAuthController();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // State to track which user descriptions are expanded
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the accessible users endpoint instead of the admin-only endpoint
        const response = await apiService.getAccessibleUsers({ limit: 1000 });
        setUsers(response);
        setFilteredUsers(response);
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users || []);
    } else {
      const filtered = (users || []).filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.description && user.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Toggle description visibility for a user
  const toggleDescription = (userId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Get role icon
  const getRoleIcon = (isAdmin: boolean) => {
    if (isAdmin) {
      return <Shield className="h-4 w-4" />;
    }
    return <User className="h-4 w-4" />;
  };

  // Get role label
  const getRoleLabel = (isAdmin: boolean) => {
    if (isAdmin) {
      return 'Admin';
    }
    return 'Member';
  };

  if (isLoading && (!users || users.length === 0)) {
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
          <h1 className="text-2xl font-bold text-gray-900">All Members</h1>
          <p className="text-gray-600 mt-1">
            View all users in the system
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by email or skills..."
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

      {/* Users List */}
      {(!filteredUsers || filteredUsers.length === 0) ? (
        <div className="card text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching members' : 'No members found'}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Members will appear once added to the system'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers && filteredUsers.map((user) => (
            <div
              key={user.id}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-700 font-medium">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {user.email.split("@")[0]}
                    </h3>
                    <p className="text-sm text-gray-500 truncate max-w-[150px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  {getRoleIcon(user.is_admin)}
                  <span className="ml-1">{getRoleLabel(user.is_admin)}</span>
                </div>
              </div>
              
              {user.description && (
                <div className="mb-3">
                  <div className={`${expandedDescriptions[user.id] ? '' : 'line-clamp-2'} text-sm text-gray-600 whitespace-pre-wrap`}>
                    {user.description}
                  </div>
                  {user.description.length > 100 && (
                    <button
                      onClick={() => toggleDescription(user.id)}
                      className="mt-1 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      {expandedDescriptions[user.id] ? (
                        <>
                          <span>Show less</span>
                          <ChevronUp className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          <span>Show more</span>
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Joined {getRelativeTime(user.created_at)}</span>
              </div>
              
              {currentUser?.id === user.id && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    You
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Members Summary</h3>
          <span className="text-sm text-gray-500">
            {(filteredUsers || []).length} member{(filteredUsers || []).length !== 1 ? 's' : ''} in the system
          </span>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;