"""
User model for SprintSync.

Represents users in the system with authentication and role management.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database.connection import Base


class User(Base):
    """User model for authentication and user management."""
    
    __tablename__ = "users"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User credentials
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # User role
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan", foreign_keys="Task.user_id")
    owned_tasks = relationship("Task", back_populates="owner", foreign_keys="Task.owner_id")
    owned_projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, is_admin={self.is_admin})>"
    
    def __str__(self):
        return f"User({self.email})"