/**
 * VIEW LAYER - Task Creation Modal
 * Modal for creating new tasks
 */

import React, { useState, useMemo } from 'react';
import { X, Wand2, Sparkles, Copy, Check, User, Loader2 } from 'lucide-react';
import { useTasksController } from '../../controllers/tasksController';
import { useUIController } from '../../controllers/uiController';
import { useAIController } from '../../controllers/aiController';
import LoadingSpinner from '../common/LoadingSpinner';
import type { TaskCreate, TaskDescriptionRequest } from '../../types';

import { getAssigneeScore } from '../../utils/formatters';


interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  members?: any[]; // Add members prop for assignee dropdown
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, projectId, members }) => {
  const { handleCreateTask, isLoading } = useTasksController();
  const { showNotification } = useUIController();
  const { 
    isAvailable: aiAvailable, 
    isLoading: aiLoading, 
    lastSuggestion,
    handleGenerateTaskDescription,
    clearSuggestion 
  } = useAIController();
  
  const [formData, setFormData] = useState<Omit<TaskCreate, 'project_id'> & { owner_id?: string }>({
    title: '',
    description: '',
    owner_id: '', // Add owner_id for assignee
  });

  const [errors, setErrors] = useState<Partial<Omit<TaskCreate, 'project_id'>>>({});
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiContext, setAIContext] = useState('');
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  
  // Add new state variables for assignee suggestions
  const [isAssigneeLoading, setIsAssigneeLoading] = useState(false);
  const [assigneeSuggestions, setAssigneeSuggestions] = useState<any>(null);
  const [showAssigneeSuggestions, setShowAssigneeSuggestions] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<TaskCreate, 'project_id'>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!projectId) {
      showNotification('error', 'Project ID is required to create a task');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!projectId) {
      showNotification('error', 'Project ID is required to create a task');
      return;
    }

    try {
      const taskData: TaskCreate = {
        ...formData,
        project_id: projectId
      };
      await handleCreateTask(taskData);
      showNotification('success', 'Task created successfully!');
      handleClose();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to create task');
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', owner_id: '' });
    setErrors({});
    setShowAISuggestion(false);
    setAIContext('');
    setCopiedItems(new Set());
    clearSuggestion();
    // Reset assignee suggestion state
    setIsAssigneeLoading(false);
    setAssigneeSuggestions(null);
    setShowAssigneeSuggestions(false);
    onClose();
  };

  const handleInputChange = (field: keyof Omit<TaskCreate, 'project_id'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAISuggestion = async () => {
    if (!formData.title.trim()) {
      showNotification('error', 'Please enter a task title first');
      return;
    }

    try {
      const request: TaskDescriptionRequest = {
        title: formData.title,
        context: aiContext || undefined,
        project_type: 'web_application',
        complexity: 'medium'
      };
      
      await handleGenerateTaskDescription(request);
      setShowAISuggestion(true);
    } catch (error) {
      // Error handled by controller
    }
  };

  const copyToClipboard = async (text: string, itemType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemType]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemType);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      showNotification('error', 'Failed to copy to clipboard');
    }
  };

  const applyAISuggestion = (field: 'description', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const projectMembers = useMemo(() => {
    if (!projectId || !members) return [];
    return members.filter((member: any) => (member.project_id === projectId));
  }, [projectId, members]);

  // Update the getAssigneeScore handler
  const handleGetAssigneeScore = async () => {
    if (!formData.description) {
      showNotification('error', 'Please enter a task description first');
      return;
    }

    setIsAssigneeLoading(true);
    setAssigneeSuggestions(null);
    setShowAssigneeSuggestions(false);

    try {
      const suggestions = await getAssigneeScore(projectMembers, formData.description);
      setAssigneeSuggestions(suggestions);
      setShowAssigneeSuggestions(true);
      showNotification('success', 'Assignee suggestions generated successfully!');
    } catch (error: any) {
      console.error('Error getting assignee suggestions:', error);
      showNotification('error', error.message || 'Failed to get assignee suggestions');
    } finally {
      setIsAssigneeLoading(false);
    }
  };

  // Function to assign task to a suggested member
  const assignToMember = (memberEmail: string) => {
    // Find the member by email and set as owner
    const member = projectMembers.find((m: any) => m.user?.email === memberEmail);
    if (member) {
      setFormData(prev => ({ ...prev, owner_id: member.user_id }));
      setShowAssigneeSuggestions(false);
      showNotification('success', `Task assigned to ${member.user?.email || member.user_id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                className={`input-field w-full ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className={`input-field w-full resize-none ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter task description (optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            {/* Suggest Assignee Button */}
            <div>
              <button 
                type="button" 
                onClick={handleGetAssigneeScore}
                disabled={isAssigneeLoading || !formData.description}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isAssigneeLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Suggesting Assignee...</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    <span>Suggest Assignee</span>
                  </>
                )}
              </button>
              
              {/* Assignee Suggestions */}
              {showAssigneeSuggestions && assigneeSuggestions && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Recommended Assignees</h3>
                    <button 
                      type="button" 
                      onClick={() => setShowAssigneeSuggestions(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {assigneeSuggestions.recommendations && assigneeSuggestions.recommendations.length > 0 ? (
                      assigneeSuggestions.recommendations.map((rec: any, index: number) => (
                        <div 
                          key={index} 
                          className="p-3 bg-white rounded border hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => assignToMember(rec.member_email)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{rec.member_name}</h4>
                              <p className="text-sm text-gray-600">{rec.member_email}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {rec.similarity_score}% match
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-700">{rec.rationale}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {rec.key_matches && rec.key_matches.map((match: string, matchIndex: number) => (
                                <span 
                                  key={matchIndex} 
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {match}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-2">No recommendations available</p>
                    )}
                  </div>
                  
                  {assigneeSuggestions.best_assignment && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-5 w-5 bg-green-500 text-white text-xs rounded-full">✓</span>
                        Best Choice
                      </h4>
                      <div className="mt-2">
                        <p className="text-sm text-green-700">
                          <span className="font-medium">{assigneeSuggestions.best_assignment.member_name}</span> - {assigneeSuggestions.best_assignment.reason}
                        </p>
                        <button
                          type="button"
                          onClick={() => assignToMember(assigneeSuggestions.best_assignment.member_email)}
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Assign to {assigneeSuggestions.best_assignment.member_name}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Assignee */}
            {projectMembers && projectMembers.length > 0 && (
              <div>
                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <div className="relative">
                  <select
                    id="assignee"
                    className="input-field w-full pl-10"
                    value={formData.owner_id || ''}
                    onChange={(e) => handleInputChange('owner_id', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member: any) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.user?.email || `User ${member.user_id.substring(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* AI Suggestion Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                  AI Assistant
                </h3>
                {aiAvailable && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full self-start sm:self-auto">
                    Available
                  </span>
                )}
              </div>
              
              {/* AI Context Input */}
              <div className="mb-3">
                <label htmlFor="ai-context" className="block text-xs text-gray-600 mb-1">
                  Additional Context (optional)
                </label>
                <input
                  id="ai-context"
                  type="text"
                  className="input-field w-full text-sm"
                  placeholder="e.g., 'frontend component', 'API endpoint', 'database migration'"
                  value={aiContext}
                  onChange={(e) => setAIContext(e.target.value)}
                  disabled={isLoading || aiLoading}
                />
              </div>

              {/* AI Generate Button */}
              <button
                type="button"
                onClick={handleAISuggestion}
                className={`w-full flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  aiAvailable
                    ? 'border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100'
                    : 'border-gray-300 text-gray-500 bg-gray-50'
                }`}
                disabled={isLoading || aiLoading || !formData.title.trim()}
              >
                {aiLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span className="truncate">Generating with AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    <span className="truncate">{aiAvailable ? 'Generate with AI' : 'AI Unavailable'}</span>
                  </>
                )}
              </button>
              
              {!aiAvailable && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                  AI suggestions will use fallback responses
                </p>
              )}
            </div>

            {/* AI Suggestion Results */}
            {showAISuggestion && lastSuggestion && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 sm:p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      AI Suggestions
                      {!lastSuggestion.ai_generated && (
                        <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                          Fallback
                        </span>
                      )}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAISuggestion(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Description Suggestion */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-medium text-gray-700">Suggested Description:</label>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(lastSuggestion.description, 'description')}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                        >
                          {copiedItems.has('description') ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span className="ml-1">Copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyAISuggestion('description', lastSuggestion.description)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    <div className="bg-white rounded border p-3 text-sm text-gray-700">
                      {lastSuggestion.description}
                    </div>
                  </div>

                  {/* Acceptance Criteria */}
                  {lastSuggestion.acceptance_criteria.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-medium text-gray-700">Acceptance Criteria:</label>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(
                            lastSuggestion.acceptance_criteria.map(c => `• ${c}`).join('\n'),
                            'criteria'
                          )}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center self-start sm:self-auto"
                        >
                          {copiedItems.has('criteria') ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span className="ml-1">Copy</span>
                        </button>
                      </div>
                      <div className="bg-white rounded border p-3">
                        <ul className="text-sm text-gray-700 space-y-1">
                          {lastSuggestion.acceptance_criteria.map((criteria, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="flex-1">{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Technical Notes */}
                  {lastSuggestion.technical_notes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-medium text-gray-700">Technical Notes:</label>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(
                            lastSuggestion.technical_notes.map(n => `• ${n}`).join('\n'),
                            'notes'
                          )}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center self-start sm:self-auto"
                        >
                          {copiedItems.has('notes') ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span className="ml-1">Copy</span>
                        </button>
                      </div>
                      <div className="bg-white rounded border p-3">
                        <ul className="text-sm text-gray-600 space-y-1">
                          {lastSuggestion.technical_notes.map((note, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span className="flex-1">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Tags and Estimate */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-600">
                    <div className="flex flex-wrap items-center gap-2">
                      {lastSuggestion.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>Tags:</span>
                          <div className="flex flex-wrap gap-1">
                            {lastSuggestion.tags.map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {lastSuggestion.estimated_hours && (
                      <div className="text-gray-500 mt-1 sm:mt-0">
                        Est: {lastSuggestion.estimated_hours}h
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto min-w-[120px] flex items-center justify-center"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;