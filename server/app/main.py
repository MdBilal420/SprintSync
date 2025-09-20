"""
SprintSync FastAPI Application

Main entry point for the SprintSync backend API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .routers import auth_router, users_router, tasks_router, ai_router, projects_router, project_members_router

# Import logging middleware
from .middleware.logging_middleware import LoggingMiddleware

# Import logging configuration
from .core.logging_config import setup_logging

# Import database initialization
from .database.connection import create_tables, test_connection

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
    * **Project Management**: Team collaboration with projects and member management
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
app.include_router(projects_router)
app.include_router(project_members_router)

# Create tables on startup if they don't exist
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup if they don't exist."""
    print("🔧 Starting database initialization...")
    try:
        # Test connection first
        if test_connection():
            print("✅ Database connection successful")
            # Create tables
            create_tables()
            print("✅ Database tables created successfully")
        else:
            print("❌ Database connection failed")
    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        # Fallback: try to create tables anyway
        try:
            create_tables()
            print("✅ Database tables created successfully (fallback)")
        except Exception as fallback_e:
            print(f"❌ Fallback database creation also failed: {fallback_e}")

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
    db_status = "unknown"
    try:
        from .database.connection import test_connection
        db_status = "healthy" if test_connection() else "unhealthy"
    except:
        db_status = "error"
        
    return {
        "status": "healthy", 
        "environment": "development",
        "components": {
            "api": "operational",
            "database": db_status,
            "models": "User, Task, Project, ProjectMember",
            "migrations": "ready",
            "authentication": "jwt-enabled",
            "endpoints": {
                "auth": "/auth (register, login, me)",
                "users": "/users (profile, management)",
                "tasks": "/tasks (CRUD operations)",
                "projects": "/projects (project management)",
                "project_members": "/projects/{project_id}/members (member management)",
                "ai": "/ai (task description generation)"
            },
            "ai": "task-description-generation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)