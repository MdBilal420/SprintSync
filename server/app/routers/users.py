"""
Users router.

Provides endpoints for user management operations.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..schemas.user import UserResponse, UserUpdate
from ..auth import get_current_active_user, get_current_admin_user, hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of users to return"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all users (admin only).
    
    Args:
        skip: Number of users to skip for pagination
        limit: Maximum number of users to return
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        List of users with pagination
    """
    users = db.query(User).offset(skip).limit(limit).all()
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


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific user by ID (admin only).
    
    Args:
        user_id: UUID of the user to retrieve
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        User information
        
    Raises:
        HTTPException: If user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    
    Args:
        user_update: User update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated user information
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if email is being updated and if it already exists
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    # Note: Only admins can change admin status, regular users cannot promote themselves
    if user_update.is_admin is not None and current_user.is_admin:
        current_user.is_admin = user_update.is_admin
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific user (admin only).
    
    Args:
        user_id: UUID of the user to update
        user_update: User update data
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        Updated user information
        
    Raises:
        HTTPException: If user not found or email already exists
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if email is being updated and if it already exists
    if user_update.email and user_update.email != user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        user.email = user_update.email
    
    # Update admin status if provided
    if user_update.is_admin is not None:
        user.is_admin = user_update.is_admin
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific user (admin only).
    
    Note: This will also delete all associated tasks due to cascade delete.
    
    Args:
        user_id: UUID of the user to delete
        current_user: Current authenticated admin user
        db: Database session
        
    Raises:
        HTTPException: If user not found or trying to delete self
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()


@router.get("/stats/count", response_model=dict)
async def get_user_statistics(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get user statistics (admin only).
    
    Args:
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        Dictionary containing user statistics
    """
    total_users = db.query(User).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    regular_users = total_users - admin_users
    
    return {
        "total_users": total_users,
        "admin_users": admin_users,
        "regular_users": regular_users
    }