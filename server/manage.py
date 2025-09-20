#!/usr/bin/env python3
"""
Management commands for SprintSync.

Provides CLI commands for database operations, migrations, and maintenance.
"""

import sys
import os
from uuid import uuid4
from sqlalchemy.orm import Session
from app.database.connection import get_db, create_tables
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember, ProjectRole
from app.models.task import Task

def create_default_projects():
    """Create default projects for all existing users to maintain backward compatibility."""
    print("🔧 Creating default projects for existing users...")
    
    # Get database session
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Get all users
        users = db.query(User).all()
        print(f"Found {len(users)} users")
        
        for user in users:
            # Check if user already has projects
            existing_projects = db.query(Project).filter(Project.owner_id == user.id).count()
            
            if existing_projects == 0:
                # Create default project for user
                default_project = Project(
                    id=uuid4(),
                    name=f"{user.email}'s Tasks",
                    description="Default project for your personal tasks",
                    is_active=True,
                    owner_id=user.id
                )
                db.add(default_project)
                
                # Add user as project owner member
                project_member = ProjectMember(
                    id=uuid4(),
                    project_id=default_project.id,
                    user_id=user.id,
                    role=ProjectRole.OWNER
                )
                db.add(project_member)
                
                print(f"  Created default project for {user.email}")
            
        db.commit()
        print("✅ Default projects created successfully")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating default projects: {e}")
        raise
    finally:
        # Close database session
        try:
            next(db_gen)
        except StopIteration:
            pass


def assign_tasks_to_default_projects():
    """Assign existing tasks to default projects."""
    print("🔧 Assigning existing tasks to default projects...")
    
    # Get database session
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Get all users
        users = db.query(User).all()
        print(f"Processing tasks for {len(users)} users")
        
        for user in users:
            # Get user's default project
            default_project = db.query(Project).filter(Project.owner_id == user.id).first()
            
            if default_project:
                # Get user's tasks without project assignment
                unassigned_tasks = db.query(Task).filter(
                    Task.user_id == user.id,
                    Task.project_id.is_(None)
                ).all()
                
                # Assign tasks to default project
                for task in unassigned_tasks:
                    task.project_id = default_project.id
                    task.assigned_to_id = user.id  # Assign to creator by default
                
                if len(unassigned_tasks) > 0:
                    print(f"  Assigned {len(unassigned_tasks)} tasks to {user.email}'s default project")
            
        db.commit()
        print("✅ Tasks assigned to default projects successfully")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error assigning tasks to default projects: {e}")
        raise
    finally:
        # Close database session
        try:
            next(db_gen)
        except StopIteration:
            pass


def main():
    """Main entry point for management commands."""
    if len(sys.argv) < 2:
        print("Usage: python manage.py <command>")
        print("Available commands:")
        print("  create-default-projects    Create default projects for all users")
        print("  assign-tasks               Assign existing tasks to default projects")
        print("  init-db                   Initialize database tables")
        return
    
    command = sys.argv[1]
    
    if command == "create-default-projects":
        create_default_projects()
    elif command == "assign-tasks":
        assign_tasks_to_default_projects()
    elif command == "init-db":
        print("🔧 Initializing database tables...")
        create_tables()
        print("✅ Database tables initialized")
    else:
        print(f"Unknown command: {command}")
        print("Available commands:")
        print("  create-default-projects    Create default projects for all users")
        print("  assign-tasks               Assign existing tasks to default projects")
        print("  init-db                   Initialize database tables")


if __name__ == "__main__":
    main()