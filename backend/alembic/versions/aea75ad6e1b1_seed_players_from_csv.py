"""seed players from csv

Revision ID: aea75ad6e1b1
Revises: b4f81d233984
Create Date: 2024-03-15 20:13:45.847599

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import csv
import os


# revision identifiers, used by Alembic.
revision: str = 'aea75ad6e1b1'
down_revision: Union[str, None] = 'b4f81d233984'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Get the connection
    connection = op.get_bind()
    
    # Read the CSV file from the scripts directory
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'scripts', 'player_info.csv')
    
    # Insert data from CSV
    with open(csv_path, 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            # Convert base price and final selling price
            base_price = float(row['Base Price']) if row['Base Price'] != '-' else 0.0
            sold_price = float(row['Final Selling Price']) if row['Final Selling Price'] != '-' else None
            
            # Execute insert statement
            connection.execute(
                sa.text(
                    """
                    INSERT INTO players (
                        name, ipl_team, role, base_price, sold_price,
                        created_at, updated_at
                    ) VALUES (
                        :name, :ipl_team, :role, :base_price, :sold_price,
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    """
                ),
                {
                    "name": row['Player Name'],
                    "ipl_team": row['Franchise Name'],
                    "role": row['Player Category'],
                    "base_price": base_price,
                    "sold_price": sold_price
                }
            )


def downgrade() -> None:
    """Downgrade schema."""
    # Delete all players
    connection = op.get_bind()
    connection.execute(sa.text("DELETE FROM players"))
