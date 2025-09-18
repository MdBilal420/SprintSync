"""
Database configuration and session management for SprintSync.

Handles SQLAlchemy setup, Cloud SQL connection, and session management.
Supports both SQLite (development) and PostgreSQL/Cloud SQL (production).
"""

import os
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLAlchemy setup
Base = declarative_base()

# Database engine - will be configured based on environment
engine = None
SessionLocal = None


def get_database_url() -> str:
    """Get database URL based on environment configuration."""
    # Check for explicit database URL first
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url
    
    # Check environment type
    environment = os.getenv("ENVIRONMENT", "development")
    
    if environment == "production":
        # Production: Use Cloud SQL PostgreSQL
        return get_cloud_sql_url()
    else:
        # Development: Use SQLite by default
        return "sqlite:///./sprintsync.db"


def get_cloud_sql_url() -> str:
    """Build Cloud SQL connection URL."""
    # Cloud SQL configuration from environment variables
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    region = os.getenv("CLOUD_SQL_REGION", "us-central1")
    instance_name = os.getenv("CLOUD_SQL_INSTANCE", "sprintsync-db")
    database_name = os.getenv("CLOUD_SQL_DATABASE", "sprintsyncdb")
    username = os.getenv("CLOUD_SQL_USERNAME", "sprintsync_user")
    password = os.getenv("CLOUD_SQL_PASSWORD")
    
    if not all([project_id, password]):
        print("⚠️  Warning: Cloud SQL credentials not found, falling back to SQLite")
        return "sqlite:///./sprintsync.db"
    
    # Build connection string for Cloud SQL with Unix socket
    connection_name = f"{project_id}:{region}:{instance_name}"
    socket_path = f"/cloudsql/{connection_name}"
    
    # Always use Unix socket path for Cloud SQL in Cloud Run
    return f"postgresql+psycopg2://{username}:{password}@/{database_name}?host={socket_path}"


def init_db() -> None:
    """Initialize database connection based on environment."""
    global engine, SessionLocal
    
    database_url = get_database_url()
    # Hide password in logs
    logged_url = database_url.split('@')[0] + '@[HIDDEN]' if '@' in database_url else database_url
    print(f"🔧 Initializing database: {logged_url}")
    
    engine = create_standard_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_standard_engine(database_url: str):
    """Create standard SQLAlchemy engine."""
    if database_url.startswith("sqlite"):
        return create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            echo=True
        )
    else:
        # PostgreSQL/Cloud SQL configuration
        return create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=True
        )


def get_db():
    """Dependency to get database session."""
    if SessionLocal is None:
        init_db()
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables."""
    from ..models import User, Task
    
    if engine is None:
        init_db()
    
    Base.metadata.create_all(bind=engine)


def test_connection() -> bool:
    """Test database connection."""
    try:
        if engine is None:
            init_db()
        
        with engine.connect() as conn:
            from sqlalchemy import text
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


# Initialize database on import
init_db()