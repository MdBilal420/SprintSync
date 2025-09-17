"""
Authentication router.

Provides endpoints for user registration, login, and token management.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse
from ..auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_active_user
)
from ..auth.schemas import Token, UserLogin, UserRegister, PasswordChange

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/register", 
    response_model=UserResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Create a new user account with email and password",
    responses={
        201: {"description": "User successfully created"},
        400: {"description": "Email already exists or passwords don't match"}
    }
)
async def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        Created user data (without password)
        
    Raises:
        HTTPException: If email already exists or passwords don't match
    """
    # Validate password confirmation
    if not user_data.passwords_match():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        is_admin=False  # Default to non-admin
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", 
    response_model=Token,
    summary="User Login",
    description="Authenticate user credentials and return JWT access token",
    responses={
        200: {"description": "Login successful, JWT token returned"},
        401: {"description": "Invalid email or password"}
    }
)
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    
    Args:
        user_credentials: User login credentials
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)  # Can be configured
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user data (without password)
    """
    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    
    Args:
        password_data: Password change data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If current password is wrong or new passwords don't match
    """
    # Validate new password confirmation
    if not password_data.passwords_match():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.password_hash = hash_password(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(current_user: User = Depends(get_current_active_user)):
    """
    Logout current user.
    
    Note: JWT tokens are stateless, so logout is handled client-side
    by removing the token. This endpoint is provided for consistency
    and future token blacklisting if needed.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    return {"message": "Successfully logged out"}