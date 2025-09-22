"""
Project schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base project schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, description="Optional project description")


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating project information."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProjectInDB(ProjectBase):
    """Schema for project stored in database."""
    id: UUID
    is_active: bool
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectResponse(ProjectBase):
    """Schema for project API responses."""
    id: UUID
    is_active: bool
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectWithMembers(ProjectResponse):
    """Schema for project with member information."""
    members: list["ProjectMemberResponse"] = []
    
    class Config:
        from_attributes = True


# Import here to avoid circular imports
from .project_member import ProjectMemberResponse

# Handle both Pydantic v1 and v2
try:
    # Pydantic v2
    ProjectWithMembers.model_rebuild()
except AttributeError:
    # Pydantic v1 - use update_forward_refs instead
    try:
        ProjectWithMembers.update_forward_refs()
    except Exception:
        # If both fail, we'll rely on the forward references being resolved later
        pass
