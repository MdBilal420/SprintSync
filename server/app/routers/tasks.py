"""
Tasks router.

Provides endpoints for task management operations.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from ..database.connection import get_db
from ..models.user import User
from ..models.task import Task, TaskStatus
from ..schemas.task import TaskResponse, TaskCreate, TaskUpdate, TaskWithUser
from ..auth import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/tasks", tags=["Task Management"])


@router.get("/", response_model=List[TaskResponse])
async def list_user_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter tasks by status"),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of tasks to return"),
    sort_by: str = Query("created_at", description="Sort field: created_at, updated_at, title, status"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List current user's tasks with optional filtering and sorting.
    
    Args:
        status: Optional status filter
        skip: Number of tasks to skip for pagination
        limit: Maximum number of tasks to return
        sort_by: Field to sort by
        sort_order: Sort order (asc/desc)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of user's tasks
    """
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    # Apply status filter if provided
    if status:
        query = query.filter(Task.status == status)
    
    # Apply sorting
    if hasattr(Task, sort_by):
        sort_column = getattr(Task, sort_by)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
    else:
        # Default sort by created_at desc
        query = query.order_by(desc(Task.created_at))
    
    # Apply pagination
    tasks = query.offset(skip).limit(limit).all()
    return tasks


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_create: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task for the current user.
    
    Args:
        task_create: Task creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created task information
    """
    db_task = Task(
        title=task_create.title,
        description=task_create.description,
        user_id=current_user.id,
        status=TaskStatus.TODO,
        total_minutes=0
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
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
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific task.
    
    Args:
        task_id: UUID of the task to update
        task_update: Task update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated task information
        
    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
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
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
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
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.total_minutes += minutes
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
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
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()


@router.get("/stats/summary", response_model=dict)
async def get_task_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get task statistics for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Dictionary containing task statistics
    """
    total_tasks = db.query(Task).filter(Task.user_id == current_user.id).count()
    
    todo_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == TaskStatus.TODO
    ).count()
    
    in_progress_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == TaskStatus.IN_PROGRESS
    ).count()
    
    done_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == TaskStatus.DONE
    ).count()
    
    # Calculate total time spent
    total_minutes_result = db.query(Task.total_minutes).filter(
        Task.user_id == current_user.id
    ).all()
    
    total_minutes = sum(minutes[0] for minutes in total_minutes_result)
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
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of tasks to return"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all tasks from all users (admin only).
    
    Args:
        status: Optional status filter
        skip: Number of tasks to skip for pagination
        limit: Maximum number of tasks to return
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        List of all tasks with user information
    """
    query = db.query(Task)
    
    # Apply status filter if provided
    if status:
        query = query.filter(Task.status == status)
    
    # Sort by created_at desc and apply pagination
    tasks = query.order_by(desc(Task.created_at)).offset(skip).limit(limit).all()
    return tasks