from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import update

from ..db.database import get_db
from ..models import Team, Player
from ..schemas.team import TeamCreate, TeamUpdate, Team as TeamSchema, TeamWithStats

router = APIRouter()

@router.get("/", response_model=List[TeamSchema])
def get_teams(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all fantasy league teams.
    """
    return db.query(Team).offset(skip).limit(limit).all()

@router.post("/", response_model=TeamSchema)
def create_team(
    team: TeamCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new fantasy league team.
    """
    db_team = Team(**team.model_dump())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.get("/{team_id}", response_model=TeamWithStats)
def get_team(
    team_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific team, including statistics.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get team statistics
    players = db.query(Player).filter(Player.team_id == team_id).all()
    
    # Calculate statistics
    total_players = len(players)
    total_spent = sum(float(getattr(p, 'sold_price', 0) or 0) for p in players)
    players_by_role: Dict[str, int] = {"BAT": 0, "BOWL": 0, "AR": 0, "WK": 0}
    
    for player in players:
        role = str(getattr(player, 'role', ''))
        if role in players_by_role:
            players_by_role[role] += 1
    
    # Convert SQLAlchemy model to dict first
    team_dict = {}
    for column in Team.__table__.columns:
        value = getattr(team, column.name)
        team_dict[column.name] = value
    
    # Create response
    response = TeamWithStats(
        **team_dict,
        total_players=total_players,
        total_spent=total_spent,
        remaining_purse=team_dict['initial_purse'] - total_spent,
        players_by_role=players_by_role
    )
    return response

@router.put("/{team_id}", response_model=TeamSchema)
def update_team(
    team_id: int,
    team_update: TeamUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a team's information.
    """
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Update team attributes
    update_data = team_update.model_dump(exclude_unset=True)
    
    # Update the team using SQLAlchemy's update
    stmt = (
        update(Team)
        .where(Team.id == team_id)
        .values(**update_data, updated_at=datetime.utcnow())
    )
    db.execute(stmt)
    db.commit()
    
    # Refresh and return the team
    db.refresh(db_team)
    return db_team

@router.get("/{team_id}/players", response_model=List[TeamSchema])
def get_team_players(
    team_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all players owned by a specific team.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team.players 