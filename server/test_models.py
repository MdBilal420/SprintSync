"""
Simple test script to verify database models work correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal, create_tables
from app.models.user import User
from app.models.task import Task, TaskStatus

def test_models():
    """Test creating and querying users and tasks."""
    
    print("🔧 Testing database models...")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Create a test user
        test_user = User(
            email="test@sprintsync.com",
            password_hash="hashed_password_here",
            is_admin=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print(f"✅ Created user: {test_user}")
        
        # Create a test task
        test_task = Task(
            title="Test database models",
            description="Verify that User and Task models work correctly",
            status=TaskStatus.IN_PROGRESS,
            total_minutes=30,
            user_id=test_user.id
        )
        db.add(test_task)
        db.commit()
        db.refresh(test_task)
        
        print(f"✅ Created task: {test_task}")
        
        # Test relationships
        user_with_tasks = db.query(User).filter(User.email == "test@sprintsync.com").first()
        print(f"📋 User has {len(user_with_tasks.tasks)} tasks")
        
        task_with_user = db.query(Task).filter(Task.title == "Test database models").first()
        print(f"👤 Task belongs to user: {task_with_user.user.email}")
        
        # Test enum
        print(f"📊 Task status: {task_with_user.status}")
        print(f"⏱️  Time spent: {task_with_user.total_minutes} minutes")
        
        print("\n🎉 All model tests passed!")
        
    except Exception as e:
        print(f"❌ Error testing models: {e}")
        
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist
    create_tables()
    test_models()