"""
Pydantic schemas for authentication.

Defines request/response models for authentication endpoints.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """JWT Token response model."""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """JWT Token payload data."""
    email: Optional[str] = None


class UserLogin(BaseModel):
    """User login request model."""
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    """User registration request model."""
    email: EmailStr
    password: str
    confirm_password: str
    
    def passwords_match(self) -> bool:
        """Check if password and confirm_password match."""
        return self.password == self.confirm_password


class PasswordChange(BaseModel):
    """Password change request model."""
    current_password: str
    new_password: str
    confirm_new_password: str
    
    def passwords_match(self) -> bool:
        """Check if new password and confirm match."""
        return self.new_password == self.confirm_new_password