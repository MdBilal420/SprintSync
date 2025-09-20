"""
Comprehensive permission system for SprintSync.

Implements role-based access control for global admin users and project-level roles.
"""

from uuid import UUID
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..models.task import Task
from ..models.project import Project
from ..models.project_member import ProjectMember, ProjectRole
from ..auth import get_current_active_user, get_current_admin_user
from ..crud import (
    is_project_member, is_project_admin, is_project_owner,
    can_view_task, can_edit_task
)


# Global Admin Permissions
async def require_global_admin(
    current_user: User = Depends(get_current_admin_user)
) -> User:
    """
    Require global admin privileges.
    
    Args:
        current_user: Current authenticated admin user
        
    Returns:
        Current admin User object
        
    Raises:
        HTTPException: If user is not a global admin
    """
    return current_user


# Project-Level Permissions
async def require_project_membership(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Require project membership (member, admin, or owner).
    
    Args:
        project_id: UUID of the project
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Current User object
        
    Raises:
        HTTPException: If user is not a member of the project
    """
    if not is_project_member(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You are not a member of this project."
        )
    return current_user


async def require_project_admin(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Require project admin privileges (admin or owner).
    
    Args:
        project_id: UUID of the project
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Current User object
        
    Raises:
        HTTPException: If user is not a project admin or owner
    """
    if not is_project_admin(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You need admin privileges for this project."
        )
    return current_user


async def require_project_owner(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Require project owner privileges.
    
    Args:
        project_id: UUID of the project
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Current User object
        
    Raises:
        HTTPException: If user is not the project owner
    """
    if not is_project_owner(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You need to be the project owner."
        )
    return current_user


# Task Permissions
async def require_task_view_permission(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Require permission to view a task.
    
    Args:
        task_id: UUID of the task
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Current User object
        
    Raises:
        HTTPException: If user doesn't have permission to view the task
    """
    if not can_view_task(db, task_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You don't have permission to view this task."
        )
    return current_user


async def require_task_edit_permission(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Require permission to edit a task.
    
    Args:
        task_id: UUID of the task
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Current User object
        
    Raises:
        HTTPException: If user doesn't have permission to edit the task
    """
    if not can_edit_task(db, task_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You don't have permission to edit this task."
        )
    return current_user


# Utility functions for permission checking
def check_global_admin(current_user: User) -> bool:
    """
    Check if user has global admin privileges.
    
    Args:
        current_user: User to check
        
    Returns:
        True if user is a global admin, False otherwise
    """
    return current_user.is_admin


def check_project_role(
    db: Session,
    project_id: UUID,
    user_id: UUID,
    required_role: ProjectRole
) -> bool:
    """
    Check if user has the required role or higher in a project.
    
    Args:
        db: Database session
        project_id: UUID of the project
        user_id: UUID of the user
        required_role: Minimum required role
        
    Returns:
        True if user has required role or higher, False otherwise
    """
    # Global admins have access to everything
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.is_admin:
        return True
    
    # Check project owner (highest role)
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == user_id
    ).first()
    if project:
        return True  # Owner has all permissions
    
    # Check project member role
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    
    if not member:
        return False
    
    # Role hierarchy: OWNER > ADMIN > MEMBER
    role_hierarchy = {
        ProjectRole.OWNER: 3,
        ProjectRole.ADMIN: 2,
        ProjectRole.MEMBER: 1
    }
    
    return role_hierarchy[member.role] >= role_hierarchy[required_role]


def check_project_membership(
    db: Session,
    project_id: UUID,
    user_id: UUID
) -> bool:
    """
    Check if user is a member of a project.
    
    Args:
        db: Database session
        project_id: UUID of the project
        user_id: UUID of the user
        
    Returns:
        True if user is a member, False otherwise
    """
    return is_project_member(db, project_id, user_id)


def check_project_admin(
    db: Session,
    project_id: UUID,
    user_id: UUID
) -> bool:
    """
    Check if user is a project admin or owner.
    
    Args:
        db: Database session
        project_id: UUID of the project
        user_id: UUID of the user
        
    Returns:
        True if user is admin or owner, False otherwise
    """
    return is_project_admin(db, project_id, user_id)


def check_project_owner(
    db: Session,
    project_id: UUID,
    user_id: UUID
) -> bool:
    """
    Check if user is the project owner.
    
    Args:
        db: Database session
        project_id: UUID of the project
        user_id: UUID of the user
        
    Returns:
        True if user is owner, False otherwise
    """
    return is_project_owner(db, project_id, user_id)