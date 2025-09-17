"""
Database configuration and session management for SprintSync.

Handles SQLAlchemy setup, Cloud SQL connection, and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..core.config import settings

# SQLAlchemy setup
Base = declarative_base()

# Database engine - will be configured based on environment
engine = None
SessionLocal = None


def init_db() -> None:
    """Initialize database connection based on environment."""
    global engine, SessionLocal
    
    if settings.environment == "production" and settings.cloud_sql_instance:
        # Cloud SQL connection for production
        # TODO: Implement Cloud SQL connector
        database_url = settings.database_url or "sqlite:///./sprintsync.db"
    else:
        # Local development database
        database_url = settings.database_url or "sqlite:///./sprintsync.db"
    
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False} if "sqlite" in database_url else {}
    )
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get database session."""
    if SessionLocal is None:
        init_db()
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize database on import
init_db()