"""
Tasks router.

Provides endpoints for task management operations.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..models.task import Task
from ..schemas.task import TaskResponse
from ..auth import get_current_active_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=list[TaskResponse])
async def list_user_tasks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List current user's tasks.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of user's tasks
    """
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks