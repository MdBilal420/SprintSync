"""
AI service for SprintSync.

Provides AI-powered features for task management and planning.
"""

from .task_description import generate_task_description, TaskDescriptionRequest, TaskDescriptionResponse
from .client import get_ai_client, AIError

__all__ = [
    "generate_task_description",
    "TaskDescriptionRequest", 
    "TaskDescriptionResponse",
    "get_ai_client",
    "AIError"
]