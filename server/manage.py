#!/usr/bin/env python3
"""
Database and Environment Management Utility

This script helps manage database connections, environment configuration,
and Cloud SQL setup for SprintSync.
"""

import os
import sys
import subprocess
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

def load_env_file(env_file: str):
    """Load environment variables from a file."""
    if not os.path.exists(env_file):
        print(f"❌ Environment file not found: {env_file}")
        return False
    
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
    
    print(f"✅ Loaded environment from: {env_file}")
    return True

def test_database_connection():
    """Test the current database connection."""
    try:
        from app.database.connection import test_connection
        return test_connection()
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def run_migrations():
    """Run Alembic migrations."""
    try:
        # Check if we're in a virtual environment
        venv_python = os.path.join(os.path.dirname(sys.executable), "python")
        if os.path.exists(venv_python):
            # Use the virtual environment's python to run alembic
            subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
        else:
            # Fallback to direct alembic command
            subprocess.run(["alembic", "upgrade", "head"], check=True)
        print("✅ Database migrations completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        return False
    except FileNotFoundError:
        print("❌ Alembic not found. Make sure you're in the virtual environment and alembic is installed.")
        print("Run: pip install alembic")
        return False

def create_cloud_sql_instance():
    """Guide user through Cloud SQL instance creation."""
    print("\n🔧 Cloud SQL Instance Setup Guide")
    print("=" * 50)
    
    project_id = input("Enter your GCP Project ID: ").strip()
    instance_name = input("Enter Cloud SQL instance name [sprintsync-db]: ").strip() or "sprintsync-db"
    region = input("Enter region [us-central1]: ").strip() or "us-central1"
    database_name = input("Enter database name [sprintsync]: ").strip() or "sprintsync"
    username = input("Enter database username [sprintsync_user]: ").strip() or "sprintsync_user"
    
    print(f"\n📋 Configuration Summary:")
    print(f"Project ID: {project_id}")
    print(f"Instance: {instance_name}")
    print(f"Region: {region}")
    print(f"Database: {database_name}")
    print(f"Username: {username}")
    
    confirm = input("\nProceed with Cloud SQL creation? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Cancelled")
        return
    
    print("\n🚀 Creating Cloud SQL instance...")
    
    commands = [
        # Create the Cloud SQL instance
        f"gcloud sql instances create {instance_name} "
        f"--database-version=POSTGRES_13 "
        f"--region={region} "
        f"--cpu=1 "
        f"--memory=3.75GB "
        f"--storage-type=SSD "
        f"--storage-size=10GB "
        f"--project={project_id}",
        
        # Create the database
        f"gcloud sql databases create {database_name} "
        f"--instance={instance_name} "
        f"--project={project_id}",
        
        # Create the user
        f"gcloud sql users create {username} "
        f"--instance={instance_name} "
        f"--password=TEMP_PASSWORD "
        f"--project={project_id}",
    ]
    
    print("\n📝 Run these commands in your terminal:")
    print("=" * 50)
    for i, cmd in enumerate(commands, 1):
        print(f"{i}. {cmd}")
    
    print(f"\n🔐 After running these commands:")
    print(f"1. Set a secure password for user '{username}'")
    print(f"2. Update your .env file with the connection details")
    print(f"3. Run 'python manage.py test-connection' to verify")

def show_environment_status():
    """Show current environment configuration."""
    print("\n📊 Environment Status")
    print("=" * 30)
    
    env_vars = [
        "ENVIRONMENT",
        "DATABASE_URL",
        "GOOGLE_CLOUD_PROJECT",
        "CLOUD_SQL_INSTANCE",
        "CLOUD_SQL_DATABASE",
        "CLOUD_SQL_USERNAME"
    ]
    
    for var in env_vars:
        value = os.getenv(var, "Not set")
        if "PASSWORD" in var and value != "Not set":
            value = "***HIDDEN***"
        print(f"{var}: {value}")

def main():
    """Main CLI interface."""
    if len(sys.argv) < 2:
        print("🔧 SprintSync Database Management")
        print("=" * 35)
        print("Usage: python manage.py <command>")
        print("\nCommands:")
        print("  test-connection    Test database connection")
        print("  migrate           Run database migrations")
        print("  status            Show environment status")
        print("  setup-cloud-sql   Guide through Cloud SQL setup")
        print("  load-dev          Load development environment (SQLite)")
        print("  load-cloud-dev    Load cloud development environment (Cloud SQL)")
        print("  load-prod         Load production environment")
        return
    
    command = sys.argv[1]
    
    # Load environment first for commands that need it
    if command in ["test-connection", "migrate", "status"]:
        # Check if a specific environment was loaded in a previous command
        # Otherwise, try to load .env.development by default
        if not os.getenv("ENVIRONMENT") and os.path.exists(".env.development"):
            load_env_file(".env.development")
    
    if command == "load-dev":
        load_env_file(".env.development")
    elif command == "load-cloud-dev":
        load_env_file(".env.cloud-dev")
    elif command == "load-prod":
        load_env_file(".env.production")
    elif command == "test-connection":
        test_database_connection()
    elif command == "migrate":
        run_migrations()
    elif command == "status":
        show_environment_status()
    elif command == "setup-cloud-sql":
        create_cloud_sql_instance()
    else:
        print(f"❌ Unknown command: {command}")

if __name__ == "__main__":
    main()