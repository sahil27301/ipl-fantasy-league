from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional
from app.schemas.player_score import PlayerScore

# Shared properties
class MatchBase(BaseModel):
    match_number: int
    team1: str
    team2: str
    match_date: date
    venue: str
    is_completed: bool = False

# Properties to receive on match creation
class MatchCreate(MatchBase):
    pass

# Properties to receive on match update
class MatchUpdate(BaseModel):
    match_number: Optional[int] = None
    team1: Optional[str] = None
    team2: Optional[str] = None
    match_date: Optional[date] = None
    venue: Optional[str] = None
    is_completed: Optional[bool] = None

# Properties shared by models stored in DB
class MatchInDBBase(MatchBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Properties to return to client
class Match(MatchInDBBase):
    pass

# Properties properties stored in DB
class MatchInDB(MatchInDBBase):
    pass

# Properties for match with scores
class MatchWithScores(Match):
    player_scores: List[PlayerScore] = [] 