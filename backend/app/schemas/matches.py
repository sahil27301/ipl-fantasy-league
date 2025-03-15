from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

class IPLTeam(str, Enum):
    RCB = "RCB"
    CSK = "CSK"
    MI = "MI"
    KKR = "KKR"
    SRH = "SRH"
    PBKS = "PBKS"
    RR = "RR"
    DC = "DC"
    LSG = "LSG"
    GT = "GT"

class MatchCreate(BaseModel):
    match_number: int = Field(..., description="Unique match number in the tournament", gt=0)
    team1: IPLTeam = Field(..., description="Name of the first IPL team")
    team2: IPLTeam = Field(..., description="Name of the second IPL team")
    match_date: date = Field(..., description="Date of the match")
    venue: str = Field(..., description="Venue where the match is played")

    def validate_teams(self):
        if self.team1 == self.team2:
            raise ValueError("Team 1 and Team 2 cannot be the same")
        return self

class MatchUpdate(BaseModel):
    match_date: Optional[date] = Field(None, description="Date of the match")
    venue: Optional[str] = Field(None, description="Venue where the match is played")
    is_completed: Optional[bool] = Field(None, description="Whether the match is completed")

class MatchResponse(BaseModel):
    id: int
    match_number: int
    team1: str
    team2: str
    match_date: date
    venue: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 