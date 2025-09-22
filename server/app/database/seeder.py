"""
Database seeder for SprintSync demo data.

Provides functions to seed the database with sample data for demonstrations.
"""

import os
from uuid import uuid4
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.project import Project
from ..models.project_member import ProjectMember, ProjectRole
from ..models.task import Task, TaskStatus
from ..auth.password import hash_password


def should_seed_database() -> bool:
    """
    Determine if database should be seeded with demo data.
    
    Returns:
        bool: True if database should be seeded, False otherwise
    """
    # Check if we're in development environment
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "development":
        return True
        
    # Check for explicit demo seeding flag
    seed_demo = os.getenv("SEED_DEMO_DATA", "false").lower()
    return seed_demo in ("true", "1", "yes")


def seed_database_if_empty(db: Session) -> bool:
    """
    Seed database with demo data if it's empty.
    
    Args:
        db: Database session
        
    Returns:
        bool: True if seeding was performed, False if skipped
    """
    if not should_seed_database():
        return False
        
    try:
        # Check if we already have users
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("ℹ️  Database already has data, skipping seeding")
            return False
            
        print("🌱 Seeding database with demo data...")
        _seed_demo_data(db)
        print("✅ Database seeded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        return False


def _seed_demo_data(db: Session) -> None:
    """
    Internal function to seed database with demo data.
    
    Args:
        db: Database session
    """
    # Create sample users
    admin_user = User(
        id=uuid4(),
        email="admin@example.com",
        password_hash=hash_password("admin123"),
        is_admin=True,
        description="Administrator user with full access"
    )
    db.add(admin_user)
    
    demo_user1 = User(
        id=uuid4(),
        email="john@example.com",
        password_hash=hash_password("demo123"),
        is_admin=False,
        description="Frontend Developer"
    )
    db.add(demo_user1)
    
    demo_user2 = User(
        id=uuid4(),
        email="sarah@example.com",
        password_hash=hash_password("demo123"),
        is_admin=False,
        description="Backend Developer"
    )
    db.add(demo_user2)
    
    db.commit()
    
    # Create sample projects
    project1 = Project(
        id=uuid4(),
        name="Website Redesign",
        description="Complete redesign of company website with modern UI/UX",
        is_active=True,
        owner_id=admin_user.id
    )
    db.add(project1)
    
    project2 = Project(
        id=uuid4(),
        name="Mobile App Development",
        description="Cross-platform mobile application for customer engagement",
        is_active=True,
        owner_id=demo_user1.id
    )
    db.add(project2)
    
    db.commit()
    
    # Add users as project members
    member1 = ProjectMember(
        id=uuid4(),
        project_id=project1.id,
        user_id=admin_user.id,
        role=ProjectRole.OWNER
    )
    db.add(member1)
    
    member2 = ProjectMember(
        id=uuid4(),
        project_id=project1.id,
        user_id=demo_user1.id,
        role=ProjectRole.ADMIN
    )
    db.add(member2)
    
    member3 = ProjectMember(
        id=uuid4(),
        project_id=project1.id,
        user_id=demo_user2.id,
        role=ProjectRole.MEMBER
    )
    db.add(member3)
    
    member4 = ProjectMember(
        id=uuid4(),
        project_id=project2.id,
        user_id=demo_user1.id,
        role=ProjectRole.OWNER
    )
    db.add(member4)
    
    member5 = ProjectMember(
        id=uuid4(),
        project_id=project2.id,
        user_id=admin_user.id,
        role=ProjectRole.MEMBER
    )
    db.add(member5)
    
    # Create sample tasks
    task1 = Task(
        id=uuid4(),
        title="Design Homepage Mockup",
        description="Create wireframes and mockups for the new homepage design",
        status=TaskStatus.TODO,
        total_minutes=0,
        user_id=demo_user1.id,
        project_id=project1.id,
        owner_id=admin_user.id
    )
    db.add(task1)
    
    task2 = Task(
        id=uuid4(),
        title="Implement Authentication",
        description="Set up user authentication with JWT tokens",
        status=TaskStatus.IN_PROGRESS,
        total_minutes=120,
        user_id=demo_user2.id,
        project_id=project1.id,
        owner_id=admin_user.id
    )
    db.add(task2)
    
    task3 = Task(
        id=uuid4(),
        title="Database Schema Design",
        description="Design the database schema for the new features",
        status=TaskStatus.DONE,
        total_minutes=240,
        user_id=demo_user2.id,
        project_id=project1.id,
        owner_id=demo_user2.id
    )
    db.add(task3)
    
    task4 = Task(
        id=uuid4(),
        title="API Development",
        description="Develop REST API endpoints for mobile app",
        status=TaskStatus.IN_PROGRESS,
        total_minutes=180,
        user_id=demo_user1.id,
        project_id=project2.id,
        owner_id=demo_user1.id
    )
    db.add(task4)
    
    db.commit()


def force_seed_database(db: Session) -> bool:
    """
    Force seed database with demo data (clears existing data first).
    
    Args:
        db: Database session
        
    Returns:
        bool: True if seeding was performed, False if failed
    """
    if not should_seed_database():
        return False
        
    try:
        print("🗑️  Clearing existing data...")
        # Clear existing data
        db.query(Task).delete()
        db.query(ProjectMember).delete()
        db.query(Project).delete()
        db.query(User).delete()
        db.commit()
        
        print("🌱 Force seeding database with demo data...")
        _seed_demo_data(db)
        print("✅ Database force seeded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error force seeding database: {e}")
        db.rollback()
        return False