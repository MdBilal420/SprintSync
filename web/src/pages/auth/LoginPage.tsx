/**
 * Login Page Component
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Eye, EyeOff } from 'lucide-react';
import { useAuthController } from '../../controllers/authController.ts';
import LoadingSpinner from '../../components/common/LoadingSpinner.tsx';
import ErrorMessage from '../../components/common/ErrorMessage.tsx';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { handleLogin, isLoading, error, clearAuthError } = useAuthController();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    
    try {
      await handleLogin({ email, password });
      // Navigation is handled by the controller
    } catch (err) {
      // Error handling is managed by the controller
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-600 rounded-xl">
              <CheckSquare className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SprintSync
          </h1>
          <p className="text-gray-600 text-lg">
            Sign in to manage your projects and tasks
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <ErrorMessage message={error} />}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field w-full"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-field w-full pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <span className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Create Account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;