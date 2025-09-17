/**
 * Error Boundary Component
 * Catches React errors and prevents app crashes
 */

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-medium">Something went wrong</h3>
            <p className="text-red-600 text-sm mt-1">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;