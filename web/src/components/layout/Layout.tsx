/**
 * VIEW LAYER - Main layout component
 * Pure UI component that receives data and callbacks from controller
 */

import React, { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, CheckSquare, Home, Menu, X } from 'lucide-react';
import { useAuthController } from '../../controllers/authController.ts';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, handleLogout, isAuthenticated } = useAuthController();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-main">
          <div className="nav-container">
            {/* Logo and Brand */}
            <div className="nav-brand">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900 hidden-mobile">SprintSync</span>
                <span className="text-xl font-bold text-gray-900 sm:hidden">SS</span>
              </Link>
              
              {/* Desktop Navigation Links */}
              <div className="hidden-mobile nav-links">
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
                
                <Link
                  to="/profile"
                  className={`nav-link ${
                    isActive('/profile') ? 'nav-link-active' : ''
                  }`}
                >
                  <User className="h-4 w-4 mr-2 inline" />
                  Profile
                </Link>
              </div>
            </div>

            {/* User Profile & Actions */}
            <div className="nav-user">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="sm:hidden p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden-mobile flex items-center space-x-3">
                <Link 
                  to="/profile"
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-600" />
                </Link>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">
                    {user?.email}
                  </span>
                  {user?.is_admin && (
                    <span className="text-xs text-blue-600 font-medium">Administrator</span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="hidden-mobile flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SprintSync</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mobile-menu-content">
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard') ? 'nav-link-active bg-blue-50' : 'text-gray-700'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <Home className="h-4 w-4 mr-2 inline" />
                  Dashboard
                </Link>
                
                <Link
                  to="/tasks"
                  className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/tasks') ? 'nav-link-active bg-blue-50' : 'text-gray-700'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <CheckSquare className="h-4 w-4 mr-2 inline" />
                  Tasks
                </Link>
                
                <Link
                  to="/profile"
                  className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/profile') ? 'nav-link-active bg-blue-50' : 'text-gray-700'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <User className="h-4 w-4 mr-2 inline" />
                  Profile
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Link 
                    to="/profile"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                  </Link>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </span>
                    {user?.is_admin && (
                      <span className="text-xs text-blue-600 font-medium">Administrator</span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container-main py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;