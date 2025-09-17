"""
SprintSync FastAPI Application

Main entry point for the SprintSync backend API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .routers import auth_router, users_router, tasks_router

# Note: Database tables are now managed by Alembic migrations
# Run 'alembic upgrade head' to create/update database schema

app = FastAPI(
    title="SprintSync API",
    description="Backend API for SprintSync - A lean task management tool for AI consultancy engineers",
    version="0.1.0",
    debug=True,
)

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

@app.get("/")
async def root():
    return {
        "message": "SprintSync API is running", 
        "version": "0.1.0",
        "environment": "development",
        "status": "Database migrations managed by Alembic"
    }

@app.get("/health")
async def health_check():
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
                "tasks": "/tasks (CRUD operations)"
            },
            "ai": "pending"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)