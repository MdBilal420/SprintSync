"""
Task model for SprintSync.

Represents tasks with status tracking and time management.
"""

import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database.connection import Base


class TaskStatus(str, Enum):
    """Enum for task status values."""
    TODO = "todo"
    IN_PROGRESS = "in_progress" 
    DONE = "done"


class Task(Base):
    """Task model for task management and time tracking."""
    
    __tablename__ = "tasks"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Task details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Task status and tracking
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    total_minutes = Column(Integer, default=0, nullable=False)
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="tasks", foreign_keys=[user_id])
    project = relationship("Project", back_populates="tasks")
    assigned_to = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to_id])
    
    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status}, user_id={self.user_id})>"
    
    def __str__(self):
        return f"Task({self.title} - {self.status})"