"""
User schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    is_admin: Optional[bool] = False


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = None
    is_admin: Optional[bool] = None
    description: Optional[str] = None  # New description field


class UserInDB(UserBase):
    """Schema for user stored in database."""
    id: UUID
    is_admin: bool
    description: Optional[str] = None  # New description field
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # For SQLAlchemy compatibility


class UserResponse(UserBase):
    """Schema for user API responses."""
    id: UUID
    is_admin: bool
    description: Optional[str] = None  # New description field
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str