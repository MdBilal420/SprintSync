"""
Project Members router.

Provides endpoints for managing project membership.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..models.project import Project
from ..schemas.project_member import ProjectMemberCreate, ProjectMemberUpdate, ProjectMemberResponse
from ..auth import get_current_active_user, get_current_admin_user
from ..crud import (
    create_project_member, get_project_member, get_project_member_by_user_and_project,
    update_project_member, delete_project_member, is_project_owner, is_project_admin,
    can_manage_members, get_user_role
)

router = APIRouter(prefix="/projects", tags=["Project Membership"])


@router.post("/{project_id}/members", response_model=ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_project_member(
    project_id: UUID,
    member_create: ProjectMemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Add a member to a project (admins and project admins only).
    
    Args:
        project_id: UUID of the project
        member_create: Member creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created member information
        
    Raises:
        HTTPException: If project not found or user doesn't have permission
    """
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user can manage members (owners and admins)
    if not can_manage_members(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owners, admins, and system admins can add members"
        )
    
    # Check if member already exists
    existing_member = get_project_member_by_user_and_project(db, member_create.user_id, project_id)
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this project"
        )
    
    member = create_project_member(db, member_create, project_id)
    return member


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project_member(
    project_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remove a member from a project (admins and project admins only, not owners).
    
    Args:
        project_id: UUID of the project
        user_id: UUID of the user to remove
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If project not found, user doesn't have permission, or trying to remove owner
    """
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user is trying to remove themselves
    if current_user.id == user_id:
        # Users can remove themselves unless they are the owner
        user_role = get_user_role(db, project_id, user_id)
        if user_role == "owner":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Project owners cannot remove themselves. Transfer ownership first."
            )
    else:
        # Check if user can manage members (owners and admins)
        if not can_manage_members(db, project_id, current_user.id) and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only project owners, admins, and system admins can remove other members"
            )
    
    # Check if member exists
    member = get_project_member_by_user_and_project(db, user_id, project_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this project"
        )
    
    # Check if trying to remove owner
    if member.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot remove project owner. Transfer ownership first."
        )
    
    delete_project_member(db, member.id)


@router.patch("/{project_id}/members/{user_id}", response_model=ProjectMemberResponse)
async def update_project_member_role(
    project_id: UUID,
    user_id: UUID,
    member_update: ProjectMemberUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a member's role in a project (admins and project owners only).
    
    Args:
        project_id: UUID of the project
        user_id: UUID of the user whose role to update
        member_update: Member update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated member information
        
    Raises:
        HTTPException: If project not found, user doesn't have permission, or invalid update
    """
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user can manage members (owners and admins)
    if not is_project_owner(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owners and system admins can update member roles"
        )
    
    # Check if member exists
    member = get_project_member_by_user_and_project(db, user_id, project_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this project"
        )
    
    # Check if trying to change owner role (not allowed)
    if member.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change role of project owner. Transfer ownership first."
        )
    
    # Check if trying to make someone an owner (not allowed through this endpoint)
    if member_update.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot assign owner role. Use transfer ownership endpoint."
        )
    
    updated_member = update_project_member(db, member, member_update)
    return updated_member