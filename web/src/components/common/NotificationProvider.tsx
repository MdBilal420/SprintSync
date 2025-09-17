/**
 * Notification Provider Component
 * Handles display of notifications from the UI controller
 */

import React, { type ReactNode } from 'react';
import { useUIController } from '../../controllers/uiController.ts';
import { type Notification } from '../../models/slices/uiSlice.ts';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { notifications, hideNotification } = useUIController();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <>
      {children}
      
      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-4">
        {notifications.map((notification: Notification) => (
          <div
            key={notification.id}
            className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getNotificationBgColor(notification.type)} transform transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => hideNotification(notification.id)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationProvider;