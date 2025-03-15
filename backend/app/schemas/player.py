from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Shared properties
class PlayerBase(BaseModel):
    name: str
    ipl_team: str
    role: str
    base_price: float

# Properties to receive on player creation
class PlayerCreate(PlayerBase):
    pass

# Properties to receive on player update
class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    ipl_team: Optional[str] = None
    role: Optional[str] = None
    base_price: Optional[float] = None
    sold_price: Optional[float] = None
    team_id: Optional[int] = None

# Properties shared by models stored in DB
class PlayerInDBBase(PlayerBase):
    id: int
    sold_price: Optional[float] = None
    team_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Properties to return to client
class Player(PlayerInDBBase):
    is_sold: bool

# Properties properties stored in DB
class PlayerInDB(PlayerInDBBase):
    pass

# Properties for player with scores
class PlayerWithScores(Player):
    from app.schemas.player_score import PlayerScore
    scores: List[PlayerScore] = [] 