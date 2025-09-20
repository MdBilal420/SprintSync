"""
Authentication module for SprintSync.

This module provides JWT-based authentication, password hashing,
and user authorization functionality.
"""

from .jwt_handler import (
    create_access_token,
    verify_token,
    get_current_user,
    get_current_active_user,
    get_current_admin_user
)
from .password import (
    hash_password,
    verify_password
)
from .schemas import (
    Token,
    TokenData,
    UserLogin,
    UserRegister
)
from .project_permissions import (
    get_current_project,
    validate_project_membership,
    validate_project_admin,
    validate_project_owner,
    get_user_project_role
)

__all__ = [
    "create_access_token",
    "verify_token", 
    "get_current_user",
    "get_current_active_user",
    "get_current_admin_user",
    "hash_password",
    "verify_password",
    "Token",
    "TokenData",
    "UserLogin",
    "UserRegister",
    "get_current_project",
    "validate_project_membership",
    "validate_project_admin",
    "validate_project_owner",
    "get_user_project_role"
]