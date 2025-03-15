from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    ipl_team = Column(String, index=True)  # e.g., CSK, MI, RCB
    role = Column(String)  # Batsman, Bowler, All-rounder, Wicket-keeper
    base_price = Column(Float)
    sold_price = Column(Float, nullable=True)  # Non-null value indicates player is sold
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)  # Non-null value indicates player is sold
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    team = relationship("Team", back_populates="players")
    scores = relationship("PlayerScore", back_populates="player")
    
    @property
    def is_sold(self):
        """A player is considered sold if they have both a team and a sold price."""
        return self.team_id is not None and self.sold_price is not None 