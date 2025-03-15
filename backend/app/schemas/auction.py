from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class AuctionPurchase(BaseModel):
    player_id: int = Field(..., description="ID of the player being purchased")
    team_id: int = Field(..., description="ID of the team making the purchase")
    purchase_price: float = Field(..., description="Purchase price in lakhs")

class PlayerPurchaseResponse(BaseModel):
    id: int
    name: str
    ipl_team: str
    role: str
    base_price: float
    sold_price: Optional[float] = None
    team_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    is_sold: bool = Field(..., description="Whether the player is currently sold")

    model_config = {"from_attributes": True}

class TeamStats(BaseModel):
    team_id: int
    team_name: str
    players_bought: int
    total_spent: float
    remaining_purse: float
    purse_utilization: float  # percentage of purse spent

class RoleStats(BaseModel):
    role: str
    players_sold: int
    total_spent: float
    avg_price: float
    highest_price: float
    lowest_price: float

class AuctionStats(BaseModel):
    total_players_sold: int = Field(..., description="Total number of players sold")
    total_money_spent: float = Field(..., description="Total money spent across all teams")
    average_price: float = Field(..., description="Average price per player")
    highest_purchase: float = Field(..., description="Highest purchase price")
    lowest_purchase: float = Field(..., description="Lowest purchase price")
    available_players: Dict[str, int] = Field(..., description="Number of available players by role")
    team_stats: List[TeamStats]
    role_stats: List[RoleStats]

    class Config:
        from_attributes = True 