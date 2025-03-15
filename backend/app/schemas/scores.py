from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import List, Optional

class PlayerScoreCreate(BaseModel):
    player_id: int = Field(..., description="ID of the player")
    fantasy_points: float = Field(..., description="Fantasy points scored by the player", ge=0)

class BatchScoreCreate(BaseModel):
    match_id: int = Field(..., description="ID of the match")
    scores: List[PlayerScoreCreate] = Field(..., description="List of player scores")

    @validator('scores')
    def validate_scores(cls, v):
        if not v:
            raise ValueError("At least one player score must be provided")
        return v

class PlayerScoreResponse(BaseModel):
    id: int
    player_id: int
    match_id: int
    points: float
    created_at: datetime
    updated_at: datetime
    
    # Include player details
    player_name: str
    player_team: Optional[str]  # Fantasy team name if player is owned
    player_ipl_team: str
    player_role: str

    class Config:
        from_attributes = True

class BatchScoreResponse(BaseModel):
    match_id: int
    scores: List[PlayerScoreResponse]
    total_players_scored: int
    average_points: float

    class Config:
        from_attributes = True 