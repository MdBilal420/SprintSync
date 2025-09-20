"""
CRUD operations for Task model with project support.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.task import Task, TaskStatus
from ..schemas.task import TaskCreate, TaskUpdate


def get_task(db: Session, task_id: UUID) -> Optional[Task]:
    """Get a task by ID."""
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(db: Session, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get all tasks with pagination."""
    return db.query(Task).offset(skip).limit(limit).all()


def get_user_tasks(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get tasks owned by a specific user."""
    return db.query(Task).filter(Task.user_id == user_id).offset(skip).limit(limit).all()


def get_project_tasks(db: Session, project_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get tasks within a specific project."""
    return db.query(Task).filter(Task.project_id == project_id).offset(skip).limit(limit).all()


def get_user_project_tasks(db: Session, user_id: UUID, project_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get tasks within a specific project for a specific user."""
    return db.query(Task).filter(
        Task.user_id == user_id,
        Task.project_id == project_id
    ).offset(skip).limit(limit).all()


def get_assigned_tasks(db: Session, assigned_to_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get tasks assigned to a specific user."""
    return db.query(Task).filter(Task.assigned_to_id == assigned_to_id).offset(skip).limit(limit).all()


def get_project_assigned_tasks(db: Session, project_id: UUID, assigned_to_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get tasks within a specific project assigned to a specific user."""
    return db.query(Task).filter(
        Task.project_id == project_id,
        Task.assigned_to_id == assigned_to_id
    ).offset(skip).limit(limit).all()


def create_task(db: Session, task: TaskCreate, user_id: UUID, project_id: Optional[UUID] = None, assigned_to_id: Optional[UUID] = None) -> Task:
    """Create a new task."""
    db_task = Task(
        title=task.title,
        description=task.description,
        user_id=user_id,
        project_id=project_id,
        assigned_to_id=assigned_to_id or user_id  # Default to creator if not assigned
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, db_task: Task, task_update: TaskUpdate) -> Task:
    """Update an existing task."""
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: UUID) -> bool:
    """Delete a task."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False


def can_view_task(db: Session, task_id: UUID, user_id: UUID) -> bool:
    """Check if user can view a task."""
    from ..models.project_member import ProjectMember
    from ..crud.project import is_project_owner
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return False
    
    # User can always view their own tasks
    if task.user_id == user_id:
        return True
    
    # If task is assigned to user, they can view it
    if task.assigned_to_id == user_id:
        return True
    
    # If task is part of a project, check project membership
    if task.project_id:
        # Check if user is project owner
        if is_project_owner(db, task.project_id, user_id):
            return True
        
        # Check if user is project member
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == task.project_id,
            ProjectMember.user_id == user_id
        ).first()
        if member:
            return True
    
    return False


def can_edit_task(db: Session, task_id: UUID, user_id: UUID) -> bool:
    """Check if user can edit a task."""
    from ..models.project_member import ProjectMember, ProjectRole
    from ..crud.project import is_project_owner, is_project_admin
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return False
    
    # User can always edit their own tasks
    if task.user_id == user_id:
        return True
    
    # If task is assigned to user, they can edit it
    if task.assigned_to_id == user_id:
        return True
    
    # If task is part of a project, check project permissions
    if task.project_id:
        # Check if user is project owner (full access)
        if is_project_owner(db, task.project_id, user_id):
            return True
        
        # Check if user is project admin (can edit all tasks in project)
        if is_project_admin(db, task.project_id, user_id):
            return True
    
    return False