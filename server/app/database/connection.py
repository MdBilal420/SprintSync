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
    
    # Check if Cloud SQL configuration is available
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    if project_id:
        # Cloud SQL configuration exists, use it
        return get_cloud_sql_url()
    
    # Check environment type
    environment = os.getenv("ENVIRONMENT", "development")
    
    if environment == "production":
        # Production: Use Cloud SQL PostgreSQL
        return get_cloud_sql_url()
    else:
        # Development: Use SQLite by default (unless Cloud SQL is configured)
        return "sqlite:///./sprintsync.db"


def get_cloud_sql_url() -> str:
    """Build Cloud SQL connection URL."""
    # Cloud SQL configuration from environment variables
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    region = os.getenv("CLOUD_SQL_REGION", "us-central1")
    instance_name = os.getenv("CLOUD_SQL_INSTANCE", "sprintsync-db")
    database_name = os.getenv("CLOUD_SQL_DATABASE", "sprintsync")
    username = os.getenv("CLOUD_SQL_USERNAME", "sprintsync_user")
    password = os.getenv("CLOUD_SQL_PASSWORD")
    
    if not all([project_id, password]):
        print("⚠️  Warning: Cloud SQL credentials not found, falling back to SQLite")
        return "sqlite:///./sprintsync.db"
    
    # Build connection string for Cloud SQL Proxy
    connection_name = f"{project_id}:{region}:{instance_name}"
    
    # Use Unix socket connection for Cloud SQL
    socket_path = f"/cloudsql/{connection_name}"
    
    if os.path.exists(socket_path):
        # Running in Cloud Run or with Cloud SQL Proxy
        return f"postgresql+psycopg2://{username}:{password}@/{database_name}?host={socket_path}"
    else:
        # Local development with Cloud SQL (requires Cloud SQL Proxy)
        # or fallback to public IP (not recommended for production)
        public_ip = os.getenv("CLOUD_SQL_PUBLIC_IP")
        if public_ip:
            return f"postgresql+psycopg2://{username}:{password}@{public_ip}:5432/{database_name}"
        else:
            print("⚠️  Warning: Cloud SQL not accessible, using SQLite for development")
            return "sqlite:///./sprintsync.db"


def get_cloud_sql_connector_url() -> str:
    """Alternative: Use Cloud SQL Python Connector (recommended for Cloud Run)."""
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    region = os.getenv("CLOUD_SQL_REGION", "us-central1")
    instance_name = os.getenv("CLOUD_SQL_INSTANCE", "sprintsync-db")
    database_name = os.getenv("CLOUD_SQL_DATABASE", "sprintsync")
    username = os.getenv("CLOUD_SQL_USERNAME", "sprintsync_user")
    password = os.getenv("CLOUD_SQL_PASSWORD")
    
    if not all([project_id, password]):
        return "sqlite:///./sprintsync.db"
    
    # Use pg8000 driver with Cloud SQL Connector
    connection_name = f"{project_id}:{region}:{instance_name}"
    return f"postgresql+pg8000://{username}:{password}@/{database_name}?unix_sock=/cloudsql/{connection_name}/.s.PGSQL.5432"


def create_cloud_sql_engine():
    """Create engine using Cloud SQL Python Connector."""
    from google.cloud.sql.connector import Connector
    import pg8000
    
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    region = os.getenv("CLOUD_SQL_REGION", "us-central1")
    instance_name = os.getenv("CLOUD_SQL_INSTANCE", "sprintsync-db")
    database_name = os.getenv("CLOUD_SQL_DATABASE", "sprintsync")
    username = os.getenv("CLOUD_SQL_USERNAME", "sprintsync_user")
    password = os.getenv("CLOUD_SQL_PASSWORD")
    
    connector = Connector()
    
    def getconn():
        connection_name = f"{project_id}:{region}:{instance_name}"
        conn = connector.connect(
            connection_name,
            "pg8000",
            user=username,
            password=password,
            db=database_name,
        )
        return conn
    
    return create_engine(
        "postgresql+pg8000://",
        creator=getconn,
        echo=True
    )


def init_db() -> None:
    """Initialize database connection based on environment."""
    global engine, SessionLocal
    
    database_url = get_database_url()
    print(f"🔧 Initializing database: {database_url.split('@')[0]}@[HIDDEN]" if '@' in database_url else f"🔧 Initializing database: {database_url}")
    
    # Check if we should use Cloud SQL Connector
    use_connector = os.getenv("USE_CLOUD_SQL_CONNECTOR", "false").lower() == "true"
    
    if use_connector and "postgresql" in database_url and "cloudsql" in database_url:
        try:
            engine = create_cloud_sql_engine()
            print("✅ Using Cloud SQL Python Connector")
        except Exception as e:
            print(f"❌ Cloud SQL Connector failed: {e}")
            print("🔄 Falling back to standard connection")
            engine = create_standard_engine(database_url)
    else:
        engine = create_standard_engine(database_url)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_standard_engine(database_url: str):
    """Create standard SQLAlchemy engine."""
    if database_url.startswith("sqlite"):
        return create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            echo=True  # Show SQL queries in development
        )
    else:
        # PostgreSQL/Cloud SQL configuration
        return create_engine(
            database_url,
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=300,    # Recycle connections every 5 minutes
            echo=True           # Show SQL queries in development
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
    from ..models import User, Task  # Import models to register with Base
    
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
            result.fetchone()  # Fetch the result to ensure connection works
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


# Initialize database on import
init_db()