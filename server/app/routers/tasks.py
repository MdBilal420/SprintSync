"""
Tasks router.

Provides endpoints for task management operations.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from ..database.connection import get_db
from ..models.user import User
from ..models.task import Task, TaskStatus
from ..schemas.task import TaskResponse, TaskCreate, TaskUpdate, TaskWithUser
from ..auth import get_current_active_user, get_current_admin_user
from ..crud import (
    get_tasks, get_user_tasks, get_project_tasks, get_user_project_tasks,
    get_owned_tasks, get_project_owned_tasks, get_project_tasks_for_members, 
    create_task, update_task, delete_task, can_view_task, can_edit_task, 
    can_assign_task, can_unassign_task, get_task as crud_get_task
)

router = APIRouter(prefix="/tasks", tags=["Task Management"])


@router.get("/", response_model=dict)
async def list_user_tasks(
    project_id: Optional[UUID] = Query(None, description="Filter tasks by project ID"),
    owner_id: Optional[UUID] = Query(None, description="Filter tasks owned by user"),
    status: Optional[TaskStatus] = Query(None, description="Filter tasks by status"),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of tasks to return"),
    sort_by: str = Query("created_at", description="Sort field: created_at, updated_at, title, status"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List tasks with optional filtering and sorting.
    All project members can see all tasks within a project.
    Users can only edit tasks they created or own.
    
    Args:
        project_id: Optional project ID to filter tasks
        owner_id: Optional user ID to filter owned tasks
        status: Optional status filter
        skip: Number of tasks to skip for pagination
        limit: Maximum number of tasks to return
        sort_by: Field to sort by
        sort_order: Sort order (asc/desc)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Paginated list of tasks
    """
    # If project_id is specified, get project tasks
    if project_id:
        # Check if user has access to this project
        from ..crud import is_project_member
        if not is_project_member(db, project_id, current_user.id) and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this project"
            )
        
        if owner_id:
            # Get tasks owned by specific user within project
            tasks = get_project_owned_tasks(db, project_id, owner_id, skip, limit)
            total = len(get_project_owned_tasks(db, project_id, owner_id, 0, 1000000))
        else:
            # Get all tasks within project (all members can see all tasks)
            tasks = get_project_tasks_for_members(db, project_id, skip, limit)
            total = len(get_project_tasks_for_members(db, project_id, 0, 1000000))
    else:
        # Get user's tasks (original behavior)
        if owner_id:
            # Get tasks owned by specific user
            tasks = get_owned_tasks(db, owner_id, skip, limit)
            total = len(get_owned_tasks(db, owner_id, 0, 1000000))
        else:
            # Get user's own tasks
            tasks = get_user_tasks(db, current_user.id, skip, limit)
            total = len(get_user_tasks(db, current_user.id, 0, 1000000))
    
    # Apply status filter if provided
    if status:
        tasks = [task for task in tasks if task.status == status]
        total = len(tasks)
    
    # Apply sorting at database level for better performance
    from sqlalchemy import desc, asc
    
    # Validate sort_by parameter to prevent issues
    valid_sort_fields = ['created_at', 'updated_at', 'title', 'status', 'total_minutes']
    if sort_by in valid_sort_fields and hasattr(Task, sort_by):
        try:
            if sort_order.lower() == "asc":
                tasks.sort(key=lambda x: getattr(x, sort_by) or '')
            else:
                tasks.sort(key=lambda x: getattr(x, sort_by) or '', reverse=True)
        except Exception:
            # If sorting fails, continue without sorting
            pass
    
    # Calculate pagination info
    page = (skip // limit) + 1
    pages = (total + limit - 1) // limit
    
    # Convert Task models to TaskResponse format
    task_responses = []
    for task in tasks:
        task_dict = {
            "id": str(task.id),
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "total_minutes": task.total_minutes,
            "user_id": str(task.user_id),
            "project_id": str(task.project_id) if task.project_id else None,
            "owner_id": str(task.owner_id) if task.owner_id else None,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }
        task_responses.append(task_dict)
    
    return {
        "items": task_responses,
        "total": total,
        "page": page,
        "size": limit,
        "pages": pages
    }


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task_endpoint(
    task_create: TaskCreate,
    project_id: Optional[UUID] = Query(None, description="Project ID to associate task with"),
    owner_id: Optional[UUID] = Query(None, description="User ID to assign task to"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task for the current user.
    
    Args:
        task_create: Task creation data
        project_id: Optional project ID to associate task with
        owner_id: Optional user ID to assign task to
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created task information
    """
    # If project_id is specified, verify user has access to project
    if project_id:
        from ..crud import is_project_member
        if not is_project_member(db, project_id, current_user.id) and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this project"
            )
    
    # If owner_id is specified (and different from current user), verify it's valid
    if owner_id and owner_id != current_user.id:
        # Only allow assigning to self or if user has permission (project admin, owner, or system admin)
        from ..crud import is_project_admin, is_project_owner
        can_assign = (
            current_user.is_admin or
            (project_id and (is_project_owner(db, project_id, current_user.id) or 
                           is_project_admin(db, project_id, current_user.id)))
        )
        if not can_assign:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to assign tasks to other users"
            )
    
    db_task = create_task(db, task_create, current_user.id, project_id, owner_id)
    return db_task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID.
    
    Args:
        task_id: UUID of the task to retrieve
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Task information
        
    Raises:
        HTTPException: If task not found or user doesn't have access
    """
    # Check if user can view task
    if not can_view_task(db, task_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this task"
        )
    
    task = crud_get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def partial_update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Partially update a specific task (PATCH method).
    
    Args:
        task_id: UUID of the task to update
        task_update: Task update data (partial)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated task information
        
    Raises:
        HTTPException: If task not found or user doesn't have access
    """
    # Check if user can edit task
    if not can_edit_task(db, task_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this task"
        )
    
    task = crud_get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Handle task assignment if owner_id is provided
    if task_update.owner_id is not None:
        # Check if user can assign/unassign this task
        if task_update.owner_id is None:
            # Unassigning task
            if not can_unassign_task(db, task_id, current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to unassign this task"
                )
        else:
            # Assigning task
            if not can_assign_task(db, task_id, current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to assign this task"
                )
        task.owner_id = task_update.owner_id
    
    # Update fields if provided (partial update)
    if task_update.title is not None:
        task.title = task_update.title
    
    if task_update.description is not None:
        task.description = task_update.description
    
    if task_update.status is not None:
        task.status = task_update.status
    
    if task_update.total_minutes is not None:
        task.total_minutes = task_update.total_minutes
    
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task_endpoint(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Completely update a specific task (PUT method).
    
    Args:
        task_id: UUID of the task to update
        task_update: Task update data (complete replacement)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated task information
        
    Raises:
        HTTPException: If task not found or user doesn't have access
    """
    # Check if user can edit task
    if not can_edit_task(db, task_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this task"
        )
    
    task = crud_get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Handle task assignment if owner_id is provided
    if task_update.owner_id is not None:
        # Check if user can assign/unassign this task
        if task_update.owner_id is None:
            # Unassigning task
            if not can_unassign_task(db, task_id, current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to unassign this task"
                )
        else:
            # Assigning task
            if not can_assign_task(db, task_id, current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to assign this task"
                )
        task.owner_id = task_update.owner_id
    
    # Update fields if provided
    if task_update.title is not None:
        task.title = task_update.title
    
    if task_update.description is not None:
        task.description = task_update.description
    
    if task_update.status is not None:
        task.status = task_update.status
    
    if task_update.total_minutes is not None:
        task.total_minutes = task_update.total_minutes
    
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: UUID,
    new_status: TaskStatus,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update task status (quick status change endpoint).
    
    Args:
        task_id: UUID of the task to update
        new_status: New task status
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated task information
        
    Raises:
        HTTPException: If task not found or user doesn't have access
    """
    # Check if user can edit task
    if not can_edit_task(db, task_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this task"
        )
    
    task = crud_get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.status = new_status
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/time", response_model=TaskResponse)
async def add_time_to_task(
    task_id: UUID,
    minutes: int = Query(..., ge=0, description="Minutes to add to the task"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Add time to a task.
    
    Args:
        task_id: UUID of the task to update
        minutes: Minutes to add to the task
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated task information
        
    Raises:
        HTTPException: If task not found or user doesn't have access
    """
    # Check if user can edit task
    if not can_edit_task(db, task_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this task"
        )
    
    task = crud_get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.total_minutes += minutes
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/assign", response_model=TaskResponse)
async def assign_task(
    task_id: UUID,
    owner_id: Optional[UUID] = Query(None, description="User ID to assign task to (null to unassign)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Assign or unassign a task.
    Only admins can assign tasks to others.
    Task owners can unassign themselves.
    
    Args:
        task_id: UUID of the task to assign
        owner_id: User ID to assign to (null to unassign)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated task information
        
    Raises:
        HTTPException: If task not found or user doesn't have permission
    """
    task = crud_get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check if user can assign/unassign this task
    if owner_id is None:
        # Unassigning task
        if not can_unassign_task(db, task_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to unassign this task"
            )
    else:
        # Assigning task
        if not can_assign_task(db, task_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to assign this task"
            )
    
    # Update the task
    task.owner_id = owner_id
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_endpoint(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific task.
    
    Args:
        task_id: UUID of the task to delete
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If task not found or user doesn't have access
    """
    # Check if user can edit task (same permission as editing)
    if not can_edit_task(db, task_id, current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this task"
        )
    
    task = crud_get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()


@router.get("/stats/summary", response_model=dict)
async def get_task_statistics(
    project_id: Optional[UUID] = Query(None, description="Filter statistics by project ID"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get task statistics for the current user.
    
    Args:
        project_id: Optional project ID to filter statistics
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Dictionary containing task statistics
    """
    from sqlalchemy import func
    
    # Build query based on filters
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    # Apply project filter if provided
    if project_id:
        query = query.filter(Task.project_id == project_id)
    
    total_tasks = query.count()
    
    todo_tasks = query.filter(Task.status == TaskStatus.TODO).count()
    in_progress_tasks = query.filter(Task.status == TaskStatus.IN_PROGRESS).count()
    done_tasks = query.filter(Task.status == TaskStatus.DONE).count()
    
    # Calculate total time spent
    total_minutes_result = query.with_entities(func.sum(Task.total_minutes)).scalar()
    total_minutes = total_minutes_result or 0
    total_hours = round(total_minutes / 60, 2) if total_minutes > 0 else 0
    
    return {
        "total_tasks": total_tasks,
        "todo_tasks": todo_tasks,
        "in_progress_tasks": in_progress_tasks,
        "done_tasks": done_tasks,
        "completion_rate": round((done_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0,
        "total_time_minutes": total_minutes,
        "total_time_hours": total_hours
    }


# Admin endpoints for task management
@router.get("/admin/all", response_model=List[TaskWithUser])
async def list_all_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter tasks by status"),
    project_id: Optional[UUID] = Query(None, description="Filter tasks by project ID"),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of tasks to return"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all tasks from all users (admin only).
    
    Args:
        status: Optional status filter
        project_id: Optional project ID filter
        skip: Number of tasks to skip for pagination
        limit: Maximum number of tasks to return
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        List of all tasks with user information
    """
    query = db.query(Task)
    
    # Apply filters if provided
    if status:
        query = query.filter(Task.status == status)
    
    if project_id:
        query = query.filter(Task.project_id == project_id)
    
    # Sort by created_at desc and apply pagination
    tasks = query.order_by(desc(Task.created_at)).offset(skip).limit(limit).all()
    return tasks