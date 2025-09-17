"""
API documentation examples and schemas.

Contains example data for API documentation.
"""

from datetime import datetime
from uuid import UUID

# Example data for API documentation
EXAMPLE_USER = {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "engineer@company.com",
    "is_admin": False,
    "created_at": "2025-09-17T12:00:00.000000"
}

EXAMPLE_ADMIN_USER = {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "admin@company.com",
    "is_admin": True,
    "created_at": "2025-09-17T10:00:00.000000"
}

EXAMPLE_TASK = {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication system with login and registration",
    "status": "in_progress",
    "total_minutes": 180,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-09-17T09:00:00.000000",
    "updated_at": "2025-09-17T12:30:00.000000"
}

EXAMPLE_TASK_CREATE = {
    "title": "Design database schema",
    "description": "Create SQLAlchemy models for users and tasks with proper relationships"
}

EXAMPLE_TASK_UPDATE = {
    "title": "Update database schema",
    "description": "Add indexing and optimize queries for better performance",
    "status": "done",
    "total_minutes": 240
}

EXAMPLE_USER_REGISTER = {
    "email": "newuser@company.com",
    "password": "securepassword123",
    "confirm_password": "securepassword123"
}

EXAMPLE_USER_LOGIN = {
    "email": "engineer@company.com",
    "password": "userpassword123"
}

EXAMPLE_TOKEN_RESPONSE = {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbmdpbmVlckBjb21wYW55LmNvbSIsImV4cCI6MTYzMjE0MDgwMH0.signature",
    "token_type": "bearer"
}

EXAMPLE_TASK_STATS = {
    "total_tasks": 15,
    "todo_tasks": 5,
    "in_progress_tasks": 7,
    "done_tasks": 3,
    "completion_rate": 20.0,
    "total_time_minutes": 1200,
    "total_time_hours": 20.0
}

EXAMPLE_USER_STATS = {
    "total_users": 25,
    "admin_users": 3,
    "regular_users": 22
}

# OpenAPI response examples
RESPONSE_EXAMPLES = {
    "user_created": {
        "summary": "User successfully created",
        "value": EXAMPLE_USER
    },
    "user_login_success": {
        "summary": "Login successful",
        "value": EXAMPLE_TOKEN_RESPONSE
    },
    "task_created": {
        "summary": "Task successfully created",
        "value": EXAMPLE_TASK
    },
    "task_list": {
        "summary": "List of user tasks",
        "value": [EXAMPLE_TASK]
    },
    "task_stats": {
        "summary": "Task statistics",
        "value": EXAMPLE_TASK_STATS
    },
    "user_stats": {
        "summary": "User statistics",
        "value": EXAMPLE_USER_STATS
    },
    "validation_error": {
        "summary": "Validation error",
        "value": {
            "detail": [
                {
                    "loc": ["body", "email"],
                    "msg": "field required",
                    "type": "value_error.missing"
                }
            ]
        }
    },
    "unauthorized": {
        "summary": "Unauthorized access",
        "value": {"detail": "Not authenticated"}
    },
    "forbidden": {
        "summary": "Insufficient permissions",
        "value": {"detail": "Not enough permissions"}
    },
    "not_found": {
        "summary": "Resource not found",
        "value": {"detail": "Task not found"}
    }
}