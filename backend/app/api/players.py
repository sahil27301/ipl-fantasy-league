from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import update

from ..db.database import get_db
from ..models import Player, Team
from ..schemas.player import PlayerCreate, PlayerUpdate, Player as PlayerSchema, PlayerWithTeam, PlayerRole

router = APIRouter()

@router.get("/", response_model=List[PlayerWithTeam])
def get_players(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    ipl_team: Optional[str] = None,
    is_sold: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,  # name, base_price, sold_price
    sort_desc: bool = False,
    db: Session = Depends(get_db)
):
    """
    Retrieve all players with optional filtering and sorting.
    
    Parameters:
    - role: Filter by player role (BAT, BOWL, AR, WK)
    - ipl_team: Filter by IPL team
    - is_sold: Filter by sold/unsold status
    - min_price: Filter by minimum base price
    - max_price: Filter by maximum base price
    - sort_by: Sort by field (name, base_price, sold_price)
    - sort_desc: Sort in descending order if True
    """
    query = db.query(Player)
    
    # Apply filters
    if role:
        query = query.filter(Player.role == role)
    if ipl_team:
        query = query.filter(Player.ipl_team == ipl_team)
    if is_sold is not None:
        if is_sold:
            query = query.filter(Player.team_id.isnot(None))
        else:
            query = query.filter(Player.team_id.is_(None))
    if min_price is not None:
        query = query.filter(Player.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Player.base_price <= max_price)
    
    # Apply sorting
    if sort_by:
        sort_column = getattr(Player, sort_by, None)
        if sort_column is not None:
            query = query.order_by(sort_column.desc() if sort_desc else sort_column.asc())
    
    players = query.offset(skip).limit(limit).all()
    
    # Enhance player data with team information
    result = []
    for player in players:
        # Convert SQLAlchemy model to dict first
        player_dict = {
            column.name: getattr(player, column.name)
            for column in Player.__table__.columns
        }
        # Add is_sold field
        player_dict['is_sold'] = player.team_id is not None
        
        player_data = PlayerWithTeam.model_validate(player_dict)
        
        if player.team_id is not None:
            team = db.query(Team).filter(Team.id == player.team_id).first()
            if team:
                player_data.team_name = str(team.name)
                player_data.team_owner = str(team.owner_name)
        result.append(player_data)
    
    return result

@router.post("/", response_model=PlayerSchema)
def create_player(
    player: PlayerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new player.
    """
    db_player = Player(**player.model_dump())
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@router.get("/{player_id}", response_model=PlayerWithTeam)
def get_player(
    player_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific player.
    """
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Convert SQLAlchemy model to dict first
    player_dict = {
        column.name: getattr(player, column.name)
        for column in Player.__table__.columns
    }
    # Add is_sold field
    player_dict['is_sold'] = player.team_id is not None
    
    player_data = PlayerWithTeam.model_validate(player_dict)
    
    if player.team_id is not None:
        team = db.query(Team).filter(Team.id == player.team_id).first()
        if team:
            player_data.team_name = str(team.name)
            player_data.team_owner = str(team.owner_name)
    
    return player_data

@router.put("/{player_id}", response_model=PlayerSchema)
def update_player(
    player_id: int,
    player_update: PlayerUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a player's information.
    """
    db_player = db.query(Player).filter(Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Update player attributes
    update_data = player_update.model_dump(exclude_unset=True)
    
    # If player is being assigned to a team
    if 'team_id' in update_data and update_data['team_id'] is not None:
        # Check if sold_price is provided
        if 'sold_price' not in update_data or update_data['sold_price'] is None:
            raise HTTPException(status_code=400, detail="sold_price is required when assigning a player to a team")
        
        # Get the team and verify sufficient purse
        team = db.query(Team).filter(Team.id == update_data['team_id']).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Check team size limit
        team_players = db.query(Player).filter(Player.team_id == team.id).all()
        if len(team_players) >= 16:
            raise HTTPException(status_code=400, detail="Team has reached maximum size of 16 players")
        
        # Calculate total spent by the team
        total_spent = sum(float(getattr(p, 'sold_price', 0) or 0) for p in team_players)
        
        # Calculate remaining purse
        remaining_purse = team.initial_purse - total_spent
        if remaining_purse < update_data['sold_price']:
            raise HTTPException(status_code=400, detail="Team does not have sufficient purse")
    
    # If player is being removed from a team
    elif 'team_id' in update_data and update_data['team_id'] is None and db_player.team_id is not None:
        # No need to update team's purse since we calculate it dynamically
        pass
    
    # Update the player
    player_stmt = (
        update(Player)
        .where(Player.id == player_id)
        .values(**update_data, updated_at=datetime.utcnow())
    )
    db.execute(player_stmt)
    db.commit()
    
    # Refresh and return the player
    db.refresh(db_player)
    return db_player 