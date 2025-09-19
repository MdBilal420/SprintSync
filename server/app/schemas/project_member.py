"""
ProjectMember schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from ..models.project_member import ProjectRole


class ProjectMemberBase(BaseModel):
    """Base project member schema with common fields."""
    project_id: UUID
    user_id: UUID
    role: ProjectRole


class ProjectMemberCreate(BaseModel):
    """Schema for adding a member to a project."""
    user_id: UUID
    role: ProjectRole = ProjectRole.MEMBER


class ProjectMemberUpdate(BaseModel):
    """Schema for updating project member information."""
    role: Optional[ProjectRole] = None


class ProjectMemberInDB(ProjectMemberBase):
    """Schema for project member stored in database."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectMemberResponse(ProjectMemberBase):
    """Schema for project member API responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectMemberWithUser(ProjectMemberResponse):
    """Schema for project member with user information."""
    user: "UserResponse"
    
    class Config:
        from_attributes = True


# Import here to avoid circular imports
from .user import UserResponse
ProjectMemberWithUser.model_rebuild()