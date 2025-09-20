"""
ProjectMember model for SprintSync.

Represents the relationship between users and projects, including their roles.
"""

import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database.connection import Base


class ProjectRole(str, Enum):
    """Enum for project role values."""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class ProjectMember(Base):
    """ProjectMember model for managing user roles within projects."""
    
    __tablename__ = "project_members"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign keys
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Role within the project
    role = Column(SQLEnum(ProjectRole), default=ProjectRole.MEMBER, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")
    
    def __repr__(self):
        return f"<ProjectMember(id={self.id}, project_id={self.project_id}, user_id={self.user_id}, role={self.role})>"
    
    def __str__(self):
        return f"ProjectMember(User {self.user_id} in Project {self.project_id} as {self.role})"