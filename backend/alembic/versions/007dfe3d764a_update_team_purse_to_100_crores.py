"""Update team purse to 100 crores

Revision ID: 007dfe3d764a
Revises: 705a9641e823
Create Date: 2024-03-24 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '007dfe3d764a'
down_revision = '705a9641e823'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update both initial and current purse to 12000 (120 crores in lakhs)
    conn = op.get_bind()
    conn.execute(
        sa.text('UPDATE teams SET initial_purse = 12000.0, current_purse = 12000.0')
    )


def downgrade() -> None:
    # Revert back to 200
    conn = op.get_bind()
    conn.execute(
        sa.text('UPDATE teams SET initial_purse = 200.0, current_purse = 200.0')
    )
