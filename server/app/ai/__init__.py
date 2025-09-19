"""
AI service for SprintSync.

Provides AI-powered features for task management and planning.
"""

# Import from client first to avoid circular imports
from .client import get_ai_client, AIError
# Import from task_description after client to avoid circular imports
from .task_description import generate_task_description, TaskDescriptionRequest, TaskDescriptionResponse

__all__ = [
    "generate_task_description",
    "TaskDescriptionRequest", 
    "TaskDescriptionResponse",
    "get_ai_client",
    "AIError"
]