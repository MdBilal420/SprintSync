/**
 * VIEW LAYER - User Profile Page
 * Displays user profile information and account settings
 */

import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Edit3 } from 'lucide-react';
import { useAuthController } from '../../controllers/authController';
import { useUIController } from '../../controllers/uiController';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRelativeTime } from '../../utils/formatters';
import * as apiService from '../../models/api';

const UserProfilePage: React.FC = () => {
  const { user, isLoading, refreshUser } = useAuthController();
  const { showNotification } = useUIController();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          User not found
        </h3>
        <p className="text-gray-500">
          There was an issue loading your profile information.
        </p>
      </div>
    );
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Get form values
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const displayName = formData.get('name') as string;
      const description = formData.get('description') as string;
      
      // Update user profile (current user)
      const updatedUser = await apiService.updateUserProfile({
        description: description || undefined
      });
      
      // Refresh user data in the application
      await refreshUser();
      
      showNotification('success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your account information and settings
          </p>
        </div>
        
        <button
          className="btn-secondary inline-flex items-center"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {user.is_admin ? 'Administrator' : 'Standard User'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Account Statistics */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h2>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account ID</span>
                      <span className="font-mono text-sm text-gray-900">{user.id.substring(0, 8)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined</span>
                      <span className="text-gray-900">{getRelativeTime(user.created_at)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    {/* Description/Skills */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills & Expertise
            </label>
            <div className="text-gray-900">
                {user.description || (
                <span className="text-gray-500 italic">No skills added yet</span>
                )}
            </div>
        </div>
      </div>

      {/* Edit Profile Form (Hidden by default) */}
      {isEditing && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
          
          <form onSubmit={handleSaveChanges}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="input-field w-full"
                  value={user.email}
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed at this time.
                </p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input-field w-full"
                  placeholder="Enter your display name"
                  defaultValue=""
                />
                <p className="mt-1 text-sm text-gray-500">
                  This will be displayed to other team members.
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Skills & Expertise
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="input-field w-full"
                  placeholder="Describe your skills, expertise, and what you bring to the team..."
                  defaultValue={user.description || ""}
                  rows={4}
                />
                <p className="mt-1 text-sm text-gray-500">
                  This information will help team members understand your capabilities.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={isSaving}
              >
                {isSaving && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;