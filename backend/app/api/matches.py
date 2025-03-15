from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from ..db.database import get_db
from ..models import Match
from ..schemas.matches import MatchCreate, MatchResponse, MatchUpdate

router = APIRouter()

@router.get("", response_model=List[MatchResponse])
def list_matches(
    skip: int = 0,
    limit: int = 100,
    is_completed: Optional[bool] = None,
    team: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all matches with optional filters:
    - Pagination (skip/limit)
    - Filter by completion status
    - Filter by team participation
    """
    query = db.query(Match)
    
    if is_completed is not None:
        query = query.filter(Match.is_completed == is_completed)
    
    if team:
        # Filter matches where the team is either team1 or team2
        query = query.filter((Match.team1 == team) | (Match.team2 == team))
    
    # Order by match number
    query = query.order_by(Match.match_number)
    
    matches = query.offset(skip).limit(limit).all()
    return matches

@router.get("/{match_id}", response_model=MatchResponse)
def get_match(
    match_id: int,
    db: Session = Depends(get_db)
):
    """
    Get details of a specific match by ID.
    """
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match

@router.put("/{match_id}", response_model=MatchResponse)
def update_match(
    match_id: int,
    match_update: MatchUpdate,
    db: Session = Depends(get_db)
):
    """
    Update match details.
    Only allows updating:
    - Match date
    - Venue
    - Completion status
    Cannot update:
    - Match number (unique identifier)
    - Teams (to maintain integrity)
    """
    # Get existing match
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Update allowed fields
    if match_update.match_date is not None:
        db_match.match_date = match_update.match_date
    if match_update.venue is not None:
        db_match.venue = match_update.venue
    if match_update.is_completed is not None:
        db_match.is_completed = match_update.is_completed
    
    db.commit()
    db.refresh(db_match)
    return db_match

@router.post("", response_model=MatchResponse)
def create_match(
    match: MatchCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new IPL match.
    Validates:
    - Match number is unique and positive
    - Teams are valid IPL teams and not the same
    - Match date is valid
    """
    # Validate teams are different
    try:
        match.validate_teams()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Check if match number already exists
    existing_match = db.query(Match).filter(Match.match_number == match.match_number).first()
    if existing_match:
        raise HTTPException(status_code=400, detail=f"Match number {match.match_number} already exists")
    
    # Create new match
    db_match = Match(
        match_number=match.match_number,
        team1=match.team1.value,  # Convert enum to string
        team2=match.team2.value,  # Convert enum to string
        match_date=match.match_date,
        venue=match.venue,
        is_completed=False
    )
    
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    
    return db_match 