"""
Database configuration and session management for SprintSync.

Handles SQLAlchemy setup, Cloud SQL connection, and session management.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLAlchemy setup
Base = declarative_base()

# Database engine - will be configured based on environment
engine = None
SessionLocal = None


def get_database_url() -> str:
    """Get database URL based on environment."""
    # For development, use SQLite
    database_url = os.getenv("DATABASE_URL", "sqlite:///./sprintsync.db")
    return database_url


def init_db() -> None:
    """Initialize database connection based on environment."""
    global engine, SessionLocal
    
    database_url = get_database_url()
    
    # Configure engine based on database type
    if database_url.startswith("sqlite"):
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            echo=True  # Show SQL queries in development
        )
    else:
        # PostgreSQL/Cloud SQL configuration
        engine = create_engine(
            database_url,
            echo=True  # Show SQL queries in development
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


def create_tables():
    """Create all database tables."""
    from ..models import User, Task  # Import models to register with Base
    
    if engine is None:
        init_db()
    
    Base.metadata.create_all(bind=engine)


# Initialize database on import
init_db()