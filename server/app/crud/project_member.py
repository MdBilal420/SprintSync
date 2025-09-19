"""
CRUD operations for ProjectMember model.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from ..models.project_member import ProjectMember, ProjectRole
from ..models.user import User
from ..schemas.project_member import ProjectMemberCreate, ProjectMemberUpdate


def get_project_member(db: Session, member_id: UUID) -> Optional[ProjectMember]:
    """Get a project member by ID."""
    return db.query(ProjectMember).filter(ProjectMember.id == member_id).first()


def get_project_member_by_user_and_project(db: Session, user_id: UUID, project_id: UUID) -> Optional[ProjectMember]:
    """Get a project member by user ID and project ID."""
    return db.query(ProjectMember).filter(
        ProjectMember.user_id == user_id,
        ProjectMember.project_id == project_id
    ).first()


def get_project_members(db: Session, project_id: UUID, skip: int = 0, limit: int = 100) -> List[ProjectMember]:
    """Get all members of a project."""
    return db.query(ProjectMember).filter(ProjectMember.project_id == project_id).offset(skip).limit(limit).all()


def create_project_member(db: Session, member: ProjectMemberCreate, project_id: UUID) -> ProjectMember:
    """Add a member to a project."""
    db_member = ProjectMember(
        project_id=project_id,
        user_id=member.user_id,
        role=member.role
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


def update_project_member(db: Session, db_member: ProjectMember, member_update: ProjectMemberUpdate) -> ProjectMember:
    """Update a project member."""
    update_data = member_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_member, key, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member


def delete_project_member(db: Session, member_id: UUID) -> bool:
    """Remove a member from a project."""
    db_member = db.query(ProjectMember).filter(ProjectMember.id == member_id).first()
    if db_member:
        db.delete(db_member)
        db.commit()
        return True
    return False


def is_project_owner(db: Session, project_id: UUID, user_id: UUID) -> bool:
    """Check if user is the owner of a project."""
    from ..models.project import Project
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == user_id
    ).first()
    return project is not None


def can_manage_members(db: Session, project_id: UUID, user_id: UUID) -> bool:
    """Check if user can manage members (is owner or admin)."""
    from ..models.project import Project
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


def get_user_role(db: Session, project_id: UUID, user_id: UUID) -> Optional[ProjectRole]:
    """Get the role of a user in a project."""
    # Check if user is the owner
    from ..models.project import Project
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == user_id
    ).first()
    if project:
        return ProjectRole.OWNER
    
    # Check if user is a member
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    return member.role if member else None