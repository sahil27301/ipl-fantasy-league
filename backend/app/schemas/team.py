from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.player import Player

# Shared properties
class TeamBase(BaseModel):
    name: str
    owner_name: str
    initial_purse: float = 200.0
    current_purse: Optional[float] = 200.0

# Properties to receive on team creation
class TeamCreate(TeamBase):
    pass

# Properties to receive on team update
class TeamUpdate(BaseModel):
    name: Optional[str] = None
    owner_name: Optional[str] = None
    current_purse: Optional[float] = None

# Properties shared by models stored in DB
class TeamInDBBase(TeamBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Properties to return to client
class Team(TeamInDBBase):
    pass

# Properties properties stored in DB
class TeamInDB(TeamInDBBase):
    pass

# Properties for team with players
class TeamWithPlayers(Team):
    players: List[Player] = [] 