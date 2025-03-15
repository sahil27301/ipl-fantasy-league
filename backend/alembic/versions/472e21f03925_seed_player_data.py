"""Seed player data

Revision ID: 472e21f03925
Revises: a8e032ca5395
Create Date: 2025-03-16 00:36:28.389071

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '472e21f03925'
down_revision: Union[str, None] = 'a8e032ca5395'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
