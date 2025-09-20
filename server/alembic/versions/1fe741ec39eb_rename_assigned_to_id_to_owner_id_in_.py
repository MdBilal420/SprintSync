"""rename_assigned_to_id_to_owner_id_in_tasks

Revision ID: 1fe741ec39eb
Revises: 0c3b55d415cf
Create Date: 2025-09-20 17:46:20.232481

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1fe741ec39eb'
down_revision: Union[str, Sequence[str], None] = '0c3b55d415cf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename assigned_to_id column to owner_id in tasks table
    with op.batch_alter_table('tasks') as batch_op:
        batch_op.alter_column('assigned_to_id', new_column_name='owner_id')


def downgrade() -> None:
    """Downgrade schema."""
    # Rename owner_id column back to assigned_to_id in tasks table
    with op.batch_alter_table('tasks') as batch_op:
        batch_op.alter_column('owner_id', new_column_name='assigned_to_id')
