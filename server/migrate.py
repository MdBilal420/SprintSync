#!/usr/bin/env python3
"""
Database migration utility script for SprintSync.

This script provides convenient commands for managing database migrations.
"""

import sys
import subprocess
import os


def run_command(command: str, description: str):
    """Run a shell command and handle errors."""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {description} failed")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False


def main():
    """Main migration script."""
    if len(sys.argv) < 2:
        print("""
SprintSync Database Migration Utility

Usage:
    python migrate.py <command>

Commands:
    init        - Initialize Alembic (already done)
    create      - Create a new migration
    upgrade     - Apply all pending migrations
    downgrade   - Rollback one migration
    current     - Show current migration status
    history     - Show migration history
    reset       - Reset database (WARNING: Deletes all data)

Examples:
    python migrate.py upgrade
    python migrate.py create "add user preferences"
    python migrate.py current
        """)
        return

    command = sys.argv[1]
    
    # Ensure we're in the server directory
    if not os.path.exists("alembic.ini"):
        print("❌ Error: Must run from server directory (where alembic.ini exists)")
        return

    if command == "upgrade":
        run_command("alembic upgrade head", "Applying migrations")
        
    elif command == "create":
        if len(sys.argv) < 3:
            print("❌ Error: Migration message required")
            print("Usage: python migrate.py create 'migration message'")
            return
        message = sys.argv[2]
        run_command(f"alembic revision --autogenerate -m '{message}'", f"Creating migration: {message}")
        
    elif command == "downgrade":
        run_command("alembic downgrade -1", "Rolling back one migration")
        
    elif command == "current":
        run_command("alembic current", "Checking current migration status")
        
    elif command == "history":
        run_command("alembic history", "Showing migration history")
        
    elif command == "reset":
        print("⚠️  WARNING: This will delete all data and reset the database!")
        response = input("Type 'yes' to continue: ")
        if response.lower() == 'yes':
            # Remove database file
            db_files = ["sprintsync.db", "*.db"]
            for db_file in db_files:
                if os.path.exists(db_file):
                    os.remove(db_file)
                    print(f"🗑️  Removed {db_file}")
            
            # Run migrations
            run_command("alembic upgrade head", "Creating fresh database")
        else:
            print("❌ Reset cancelled")
            
    elif command == "init":
        print("ℹ️  Alembic is already initialized")
        
    else:
        print(f"❌ Error: Unknown command '{command}'")
        print("Run 'python migrate.py' for usage information")


if __name__ == "__main__":
    main()