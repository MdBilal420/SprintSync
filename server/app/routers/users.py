"""
Users router.

Provides endpoints for user management operations.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..schemas.user import UserResponse
from ..auth import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserResponse])
async def list_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all users (admin only).
    
    Args:
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        List of all users
    """
    users = db.query(User).all()
    return users


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Get current user's profile.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user profile
    """
    return current_user