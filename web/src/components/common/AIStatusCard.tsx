/**
 * VIEW LAYER - AI Status Component
 * Shows AI service availability status
 */

import React, { useEffect } from 'react';
import { Sparkles, Zap, AlertCircle } from 'lucide-react';
import { useAIController } from '../../controllers/aiController';

const AIStatusCard: React.FC = () => {
  const { isAvailable, model, checkAIStatus, isLoading } = useAIController();

  useEffect(() => {
    checkAIStatus();
  }, [checkAIStatus]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isAvailable 
              ? 'bg-purple-100 text-purple-600' 
              : 'bg-gray-100 text-gray-400'
          }`}>
            {isLoading ? (
              <div className="animate-spin">
                <Zap className="h-5 w-5" />
              </div>
            ) : isAvailable ? (
              <Sparkles className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">AI Assistant</h3>
            <p className={`text-sm ${
              isAvailable ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isLoading 
                ? 'Checking status...' 
                : isAvailable 
                  ? `Active${model ? ` (${model})` : ''}`
                  : 'Offline - Using fallback'
              }
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isAvailable 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isAvailable ? 'Online' : 'Offline'}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          {isAvailable 
            ? 'AI-powered task suggestions and descriptions are available.'
            : 'AI service unavailable. Using built-in templates and suggestions.'
          }
        </p>
      </div>
    </div>
  );
};

export default AIStatusCard;