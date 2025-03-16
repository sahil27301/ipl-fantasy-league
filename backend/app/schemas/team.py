from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict
from app.schemas.player import Player

# Shared properties
class TeamBase(BaseModel):
    name: str = Field(..., description="Team name")
    owner_name: str = Field(..., description="Team owner's name")
    initial_purse: float = Field(default=12000.0, description="Initial purse amount in lakhs")

# Properties to receive on team creation
class TeamCreate(TeamBase):
    pass

# Properties to receive on team update
class TeamUpdate(BaseModel):
    name: Optional[str] = None
    owner_name: Optional[str] = None

# Properties shared by models stored in DB
class TeamInDBBase(TeamBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class Team(TeamInDBBase):
    pass

# Properties properties stored in DB
class TeamInDB(TeamInDBBase):
    pass

# Properties for team with players
class TeamWithPlayers(Team):
    players: List[Player] = []

# Properties for team with additional stats
class TeamWithStats(Team):
    total_players: int = 0
    total_spent: float = 0
    remaining_purse: float = Field(..., description="Remaining purse amount in lakhs")
    players_by_role: Dict[str, int] = Field(default_factory=lambda: {"BAT": 0, "BOWL": 0, "AR": 0, "WK": 0}) 