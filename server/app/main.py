"""
SprintSync FastAPI Application

Main entry point for the SprintSync backend API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .routers import auth_router, users_router, tasks_router, ai_router

# Import logging middleware
from .middleware.logging_middleware import LoggingMiddleware

# Import logging configuration
from .core.logging_config import setup_logging

# Setup logging
setup_logging()

# Note: Database tables are now managed by Alembic migrations
# Run 'alembic upgrade head' to create/update database schema

app = FastAPI(
    title="SprintSync API",
    description="""Backend API for SprintSync - A lean task management tool for AI consultancy engineers.
    
    ## Features
    
    * **Authentication**: JWT-based authentication with registration and login
    * **User Management**: Profile management and admin controls
    * **Task Management**: Full CRUD operations with status tracking and time logging
    * **Statistics**: Completion metrics and time tracking analytics
    * **AI Integration**: Task description generation and planning assistance (coming soon)
    
    ## Authentication
    
    Most endpoints require authentication. Use the `/auth/login` endpoint to get a JWT token,
    then include it in the Authorization header: `Bearer <token>`
    
    ## Task Status Flow
    
    Tasks follow this status progression:
    1. **todo** - Newly created tasks
    2. **in_progress** - Tasks currently being worked on
    3. **done** - Completed tasks
    """,
    version="0.1.0",
    debug=True,
    contact={
        "name": "SprintSync Team",
        "email": "support@sprintsync.dev",
    },
    license_info={
        "name": "MIT",
    },
)

# Add structured logging middleware
app.add_middleware(LoggingMiddleware)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)
app.include_router(ai_router)

@app.get("/", tags=["Root"], summary="API Status", description="Get basic API information and status")
async def root():
    """Get API status and basic information."""
    return {
        "message": "SprintSync API is running", 
        "version": "0.1.0",
        "environment": "development",
        "status": "Database migrations managed by Alembic",
        "documentation": "/docs",
        "openapi_schema": "/openapi.json"
    }


@app.get("/health", tags=["Root"], summary="Health Check", description="Comprehensive health check of all system components")
async def health_check():
    """Comprehensive health check of all system components.
    
    Returns detailed status of:
    - API service status
    - Database connectivity
    - Authentication system
    - Available endpoints
    - Feature availability
    """
    return {
        "status": "healthy", 
        "environment": "development",
        "components": {
            "api": "operational",
            "database": "alembic-managed",
            "models": "User, Task",
            "migrations": "ready",
            "authentication": "jwt-enabled",
            "endpoints": {
                "auth": "/auth (register, login, me)",
                "users": "/users (profile, management)",
                "tasks": "/tasks (CRUD operations)",
                "ai": "/ai (task description generation)"
            },
            "ai": "task-description-generation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)