"""
Task schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from ..models.task import TaskStatus


class TaskBase(BaseModel):
    """Base task schema with common fields."""
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, description="Optional task description")


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating task information."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    total_minutes: Optional[int] = Field(None, ge=0, description="Total minutes spent on task")


class TaskInDB(TaskBase):
    """Schema for task stored in database."""
    id: UUID
    status: TaskStatus
    total_minutes: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskResponse(TaskBase):
    """Schema for task API responses."""
    id: UUID
    status: TaskStatus
    total_minutes: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskWithUser(TaskResponse):
    """Schema for task with user information."""
    user: "UserResponse"
    
    class Config:
        from_attributes = True


# Import here to avoid circular imports
from .user import UserResponse
TaskWithUser.model_rebuild()