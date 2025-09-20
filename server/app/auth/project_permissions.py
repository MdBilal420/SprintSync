"""
Project permission validation utilities.

Provides dependency functions for checking project membership and roles.
"""

from uuid import UUID
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..models.project import Project
from ..models.project_member import ProjectMember, ProjectRole
from ..auth import get_current_active_user
from ..crud import is_project_member, is_project_admin, is_project_owner


async def get_current_project(
    project_id: UUID,
    db: Session = Depends(get_db)
) -> Project:
    """
    Get a project by ID, raising 404 if not found.
    
    Args:
        project_id: UUID of the project
        db: Database session
        
    Returns:
        Project object
        
    Raises:
        HTTPException: If project not found
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


async def validate_project_membership(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> bool:
    """
    Validate that current user is a member of the project.
    
    Args:
        project_id: UUID of the project
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        True if user is member
        
    Raises:
        HTTPException: If user is not a member
    """
    if not is_project_member(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project"
        )
    return True


async def validate_project_admin(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> bool:
    """
    Validate that current user is an admin or owner of the project.
    
    Args:
        project_id: UUID of the project
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        True if user is admin or owner
        
    Raises:
        HTTPException: If user is not an admin or owner
    """
    if not is_project_admin(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project admins and owners can perform this action"
        )
    return True


async def validate_project_owner(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> bool:
    """
    Validate that current user is the owner of the project.
    
    Args:
        project_id: UUID of the project
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        True if user is owner
        
    Raises:
        HTTPException: If user is not the owner
    """
    if not is_project_owner(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owners can perform this action"
        )
    return True


async def get_user_project_role(
    project_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> ProjectRole:
    """
    Get a user's role in a project.
    
    Args:
        project_id: UUID of the project
        user_id: UUID of the user
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        User's role in the project
        
    Raises:
        HTTPException: If user doesn't have access to check roles
    """
    # Check if current user has access to project
    if not is_project_member(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project"
        )
    
    # Check if user is the owner
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == user_id).first()
    if project:
        return ProjectRole.OWNER
    
    # Check if user is a member
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this project"
        )
    
    return member.role