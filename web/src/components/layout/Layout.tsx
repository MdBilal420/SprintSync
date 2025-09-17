/**
 * VIEW LAYER - Main layout component
 * Pure UI component that receives data and callbacks from controller
 */

import React, { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, CheckSquare, Home } from 'lucide-react';
import { useAuthController } from '../../controllers/authController.ts';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, handleLogout, isAuthenticated } = useAuthController();
  const location = useLocation();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-main">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">SprintSync</span>
              </Link>
              
              {/* Navigation Links */}
              <div className="ml-10 flex space-x-8">
                <Link
                  to="/dashboard"
                  className={`nav-link ${
                    isActive('/dashboard') ? 'nav-link-active' : ''
                  }`}
                >
                  <Home className="h-4 w-4 mr-2 inline" />
                  Dashboard
                </Link>
                
                <Link
                  to="/tasks"
                  className={`nav-link ${
                    isActive('/tasks') ? 'nav-link-active' : ''
                  }`}
                >
                  <CheckSquare className="h-4 w-4 mr-2 inline" />
                  Tasks
                </Link>
              </div>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                  {user?.is_admin && (
                    <span className="text-xs text-blue-600 font-medium">Administrator</span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-main py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;