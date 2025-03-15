from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# Shared properties
class PlayerScoreBase(BaseModel):
    player_id: int
    match_id: int
    points: float

# Properties to receive on player score creation
class PlayerScoreCreate(PlayerScoreBase):
    pass

# Properties to receive on player score update
class PlayerScoreUpdate(BaseModel):
    points: Optional[float] = None

# Properties shared by models stored in DB
class PlayerScoreInDBBase(PlayerScoreBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class PlayerScore(PlayerScoreInDBBase):
    pass

# Properties properties stored in DB
class PlayerScoreInDB(PlayerScoreInDBBase):
    pass 