"""
Projects router.

Provides endpoints for project management operations.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..models.project import Project
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectWithMembers
from ..schemas.project_member import ProjectMemberResponse
from ..auth import get_current_active_user, get_current_admin_user
from ..crud import (
    create_project, get_project, get_user_projects, update_project, delete_project,
    get_project_members, is_project_owner, is_project_admin, is_project_member
)

router = APIRouter(prefix="/projects", tags=["Project Management"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project_endpoint(
    project_create: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project.
    
    Args:
        project_create: Project creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created project information
    """
    project = create_project(db, project_create, current_user.id)
    return project


@router.get("/", response_model=dict)
async def list_user_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List current user's projects (owned and member of).
    
    Args:
        skip: Number of projects to skip for pagination
        limit: Maximum number of projects to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Paginated list of user's projects
    """
    # Get projects where user is owner or member
    from ..crud.project import get_user_member_projects, get_user_member_projects_count
    projects = get_user_member_projects(db, current_user.id, skip, limit)
    total = get_user_member_projects_count(db, current_user.id)
    
    # Calculate pagination info
    page = (skip // limit) + 1
    pages = (total + limit - 1) // limit
    
    # Convert Project models to ProjectResponse format
    project_responses = []
    for project in projects:
        project_dict = {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "is_active": project.is_active,
            "owner_id": str(project.owner_id),
            "created_at": project.created_at.isoformat(),
            "updated_at": project.updated_at.isoformat()
        }
        project_responses.append(project_dict)
    
    return {
        "items": project_responses,
        "total": total,
        "page": page,
        "size": limit,
        "pages": pages
    }


@router.get("/{project_id}", response_model=ProjectWithMembers)
async def get_project_endpoint(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific project by ID.
    
    Args:
        project_id: UUID of the project to retrieve
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Project information with members
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has access to project
    if not is_project_member(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this project"
        )
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project_endpoint(
    project_id: UUID,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific project (admins and project owners only).
    
    Args:
        project_id: UUID of the project to update
        project_update: Project update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated project information
        
    Raises:
        HTTPException: If project not found or user doesn't have permission
    """
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user can update project (owners and admins)
    if not is_project_admin(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owners, admins, and system admins can update projects"
        )
    
    updated_project = update_project(db, project, project_update)
    return updated_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_endpoint(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a project (owners only).
    
    Args:
        project_id: UUID of the project to delete
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If project not found or user doesn't have permission
    """
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user is owner
    if not is_project_owner(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owners and system admins can delete projects"
        )
    
    delete_project(db, project_id)


@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
async def list_project_members(
    project_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List members of a project.
    
    Args:
        project_id: UUID of the project
        skip: Number of members to skip for pagination
        limit: Maximum number of members to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of project members
        
    Raises:
        HTTPException: If project not found or user doesn't have access
    """
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has access to project
    if not is_project_member(db, project_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this project"
        )
    
    members = get_project_members(db, project_id, skip, limit)
    return members