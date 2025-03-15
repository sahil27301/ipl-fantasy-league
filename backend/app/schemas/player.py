from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from .player_score import PlayerScore

# Shared properties
class PlayerRole(str, Enum):
    BATSMAN = "BAT"
    BOWLER = "BOWL"
    ALL_ROUNDER = "AR"
    WICKET_KEEPER = "WK"

class PlayerBase(BaseModel):
    name: str = Field(..., description="Player name")
    ipl_team: str = Field(..., description="IPL team name (e.g., CSK, MI, RCB)")
    role: PlayerRole = Field(..., description="Player role (BAT/BOWL/AR/WK)")
    base_price: float = Field(..., description="Base price in lakhs")

# Properties to receive on player creation
class PlayerCreate(PlayerBase):
    pass

# Properties to receive on player update
class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    ipl_team: Optional[str] = None
    role: Optional[PlayerRole] = None
    base_price: Optional[float] = None
    sold_price: Optional[float] = None
    team_id: Optional[int] = None

# Properties shared by models stored in DB
class PlayerInDBBase(PlayerBase):
    id: int
    sold_price: Optional[float] = Field(None, description="Sold price in lakhs")
    team_id: Optional[int] = Field(None, description="ID of the fantasy team that owns this player")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class Player(PlayerInDBBase):
    is_sold: bool

# Properties properties stored in DB
class PlayerInDB(PlayerInDBBase):
    pass

# Properties for player with scores
class PlayerWithScores(Player):
    scores: List["PlayerScore"] = []

class PlayerWithTeam(Player):
    team_name: Optional[str] = None
    team_owner: Optional[str] = None 