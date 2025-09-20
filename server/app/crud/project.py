"""
CRUD operations for Project model.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.project import Project
from ..models.user import User
from ..schemas.project import ProjectCreate, ProjectUpdate


def get_project(db: Session, project_id: UUID) -> Optional[Project]:
    """Get a project by ID."""
    return db.query(Project).filter(Project.id == project_id).first()


def get_project_with_owner(db: Session, project_id: UUID) -> Optional[Project]:
    """Get a project with owner information."""
    return db.query(Project).filter(Project.id == project_id).first()


def get_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get all projects with pagination."""
    return db.query(Project).offset(skip).limit(limit).all()


def get_user_projects(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get projects owned by a specific user."""
    return db.query(Project).filter(Project.owner_id == user_id).offset(skip).limit(limit).all()


def get_user_member_projects(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get projects where user is a member (including owner)."""
    from ..models.project_member import ProjectMember
    return db.query(Project).join(ProjectMember).filter(
        and_(
            ProjectMember.user_id == user_id,
            Project.id == ProjectMember.project_id
        )
    ).offset(skip).limit(limit).all()


def get_user_member_projects_count(db: Session, user_id: UUID) -> int:
    """Get total count of projects where user is a member (including owner)."""
    from ..models.project_member import ProjectMember
    return db.query(Project).join(ProjectMember).filter(
        and_(
            ProjectMember.user_id == user_id,
            Project.id == ProjectMember.project_id
        )
    ).count()


def create_project(db: Session, project: ProjectCreate, owner_id: UUID) -> Project:
    """Create a new project."""
    db_project = Project(
        name=project.name,
        description=project.description,
        owner_id=owner_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Automatically add owner as project member with OWNER role
    from ..models.project_member import ProjectMember, ProjectRole
    from uuid import uuid4
    owner_member = ProjectMember(
        id=uuid4(),
        project_id=db_project.id,
        user_id=owner_id,
        role=ProjectRole.OWNER
    )
    db.add(owner_member)
    db.commit()
    
    return db_project


def update_project(db: Session, db_project: Project, project_update: ProjectUpdate) -> Project:
    """Update an existing project."""
    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: UUID) -> bool:
    """Delete a project."""
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project:
        db.delete(db_project)
        db.commit()
        return True
    return False


def is_project_owner(db: Session, project_id: UUID, user_id: UUID) -> bool:
    """Check if user is the owner of a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == user_id
    ).first()
    return project is not None


def is_project_member(db: Session, project_id: UUID, user_id: UUID) -> bool:
    """Check if user is a member of a project."""
    from ..models.project_member import ProjectMember
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    return member is not None


def is_project_admin(db: Session, project_id: UUID, user_id: UUID) -> bool:
    """Check if user is an admin or owner of a project."""
    from ..models.project_member import ProjectMember, ProjectRole
    # Check if user is the owner
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == user_id
    ).first()
    if project:
        return True
    
    # Check if user is an admin member
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id,
        ProjectMember.role == ProjectRole.ADMIN
    ).first()
    return member is not None