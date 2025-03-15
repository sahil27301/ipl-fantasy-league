"""Add fantasy league teams

Revision ID: 705a9641e823
Revises: 472e21f03925
Create Date: 2024-03-24 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = '705a9641e823'
down_revision = '472e21f03925'
branch_labels = None
depends_on = None

# Fantasy league teams data
FANTASY_TEAMS = [
    ("Manthan 44dish Misogynists", "Manthan"),
    ("Sumeet Bail Buddhis", "Sumeet"),
    ("Shashank Peti Packers", "Shashank"),
    ("Shubhwani Fat Shamers", "Shubham Motwani"),
    ("Daddy Chopta Climbers", "Daddy"),
    ("Todi Bhajiyas", "Todi"),
    ("Sahil Lallubhai Parks", "Sahil"),
    ("Kashish Dosa Idli Sambhar Chatni Chatni", "Kashish"),
    ("Brid Santas", "Brid")
]

def upgrade() -> None:
    # Get connection
    conn = op.get_bind()
    
    # First, remove team_id from players (we'll reassign during auction)
    conn.execute(sa.text('UPDATE players SET team_id = NULL'))
    
    # Clear existing teams
    conn.execute(sa.text('DELETE FROM teams'))
    
    # Add fantasy league teams
    for team_name, owner_name in FANTASY_TEAMS:
        conn.execute(
            sa.text(
                'INSERT INTO teams (name, owner_name, initial_purse, current_purse, created_at, updated_at) '
                'VALUES (:name, :owner_name, :initial_purse, :current_purse, :created_at, :updated_at)'
            ),
            {
                'name': team_name,
                'owner_name': owner_name,
                'initial_purse': 200.0,
                'current_purse': 200.0,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
        )

def downgrade() -> None:
    # Get connection
    conn = op.get_bind()
    
    # Remove fantasy league teams
    conn.execute(sa.text('DELETE FROM teams'))
    
    # Re-add IPL teams from previous migration
    # Note: This is a simplified downgrade that just clears the teams
    # In a production environment, we might want to restore the exact previous state
