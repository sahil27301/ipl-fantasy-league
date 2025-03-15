from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import date

class TeamLeaderboard(BaseModel):
    team_id: int
    team_name: str
    owner_name: str
    matches_played: int
    total_points: float
    average_points_per_match: float
    
    model_config = ConfigDict(from_attributes=True)

class TopPlayer(BaseModel):
    player_id: int
    name: str
    role: str
    ipl_team: str
    fantasy_team: Optional[str] = None
    matches_played: int
    total_points: float
    average_points: float
    
    model_config = ConfigDict(from_attributes=True)

class RecentPerformance(BaseModel):
    match_number: int
    teams: str
    date: date
    points: float
    
    model_config = ConfigDict(from_attributes=True)

class PlayerStats(BaseModel):
    player_id: int
    name: str
    role: str
    ipl_team: str
    fantasy_team: Optional[str] = None
    base_price: float
    sold_price: Optional[float] = None
    matches_played: int
    total_points: float
    average_points: float
    highest_score: float
    lowest_score: float
    recent_performances: List[RecentPerformance]
    
    model_config = ConfigDict(from_attributes=True) 