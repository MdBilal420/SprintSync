import React, { useState, useEffect } from 'react';
// import ErrorMessage from '../common/ErrorMessage';
import { getUsers } from '../../models/api';
import type { User } from '../../types';

export const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [newUserEmail, setNewUserEmail] = useState('');
  // const [isAdmin, setIsAdmin] = useState(false);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        // Handle both paginated and non-paginated responses
        if (Array.isArray(response)) {
          setUsers(response);
        } else if (response && Array.isArray((response as any).items)) {
          setUsers((response as any).items);
        } else {
          setUsers([]);
        }
        // setError(null);
      } catch (err) {
        // setError('Failed to fetch users');
        console.error('Error fetching users:', err);
        setUsers([]); // Ensure users is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleAdmin = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, is_admin: !user.is_admin } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    // Prevent deletion of the last admin user
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete?.is_admin) {
      const adminCount = users.filter(user => user.is_admin).length;
      if (adminCount <= 1) {
        // setError('Cannot delete the last admin user');
        console.error('Cannot delete the last admin user');
        return;
      }
    }
    
    setUsers(users.filter(user => user.id !== userId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {/* Create User Form */}
        {/* <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New User</h3>
          {error && <ErrorMessage message={error} className="mt-3" />}
          
          <form onSubmit={handleCreateUser} className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is-admin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is-admin" className="ml-2 block text-sm text-gray-900">
                Admin User
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="btn-primary"
              >
                Create User
              </button>
            </div>
          </form>
        </div> */}
        
        {/* Users List */}
        <ul className="divide-y divide-gray-200">
          {users && users.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="text-gray-500">No users found</div>
            </li>
          ) : (
            users && users.map((user) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-700 font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_admin 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                    <button
                      onClick={() => handleToggleAdmin(user.id)}
                      className={`text-sm font-medium ${
                        user.is_admin 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-blue-600 hover:text-blue-900'
                      }`}
                    >
                      {user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};