from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime

from ..db.database import get_db
from ..models import Match, Player, PlayerScore, Team
from ..schemas.scores import (
    BatchScoreCreate,
    BatchScoreResponse,
    PlayerScoreResponse
)

router = APIRouter()

@router.post("/batch", response_model=BatchScoreResponse)
def record_match_scores(
    scores: BatchScoreCreate,
    db: Session = Depends(get_db)
):
    """
    Record scores for multiple players in a match.
    Validates:
    - Match exists and is not already completed
    - All players exist
    - No duplicate scores for the same player in the match
    """
    # Validate match exists and is not completed
    match = db.query(Match).filter(Match.id == scores.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if bool(match.is_completed):
        raise HTTPException(status_code=400, detail="Cannot add scores for completed match")
    
    # Get all players
    player_ids = [score.player_id for score in scores.scores]
    players = db.query(Player).filter(Player.id.in_(player_ids)).all()
    if len(players) != len(player_ids):
        raise HTTPException(status_code=400, detail="One or more players not found")
    
    # Check for existing scores
    existing_scores = db.query(PlayerScore).filter(
        and_(
            PlayerScore.match_id == scores.match_id,
            PlayerScore.player_id.in_(player_ids)
        )
    ).all()
    if existing_scores:
        raise HTTPException(
            status_code=400,
            detail="Scores already exist for some players in this match"
        )
    
    # Create scores
    db_scores = []
    for score in scores.scores:
        db_score = PlayerScore(
            player_id=score.player_id,
            match_id=scores.match_id,
            points=score.fantasy_points
        )
        db.add(db_score)
        db_scores.append(db_score)
    
    # Mark match as completed using update
    db.query(Match).filter(Match.id == scores.match_id).update({"is_completed": True})
    
    db.commit()
    
    # Refresh all scores to get their IDs
    for score in db_scores:
        db.refresh(score)
    
    # Prepare response with player details
    response_scores = []
    for score in db_scores:
        player = next(p for p in players if p.id == score.player_id)
        team_name = None
        if player and getattr(player, 'team_id', None) is not None:
            team = db.query(Team).filter(Team.id == player.team_id).first()
            team_name = getattr(team, 'name', None)
        
        # Convert SQLAlchemy column values to Python types
        score_dict = {
            'id': int(getattr(score, 'id', 0)),
            'player_id': int(getattr(score, 'player_id', 0)),
            'match_id': int(getattr(score, 'match_id', 0)),
            'points': float(getattr(score, 'points', 0.0)),
            'created_at': getattr(score, 'created_at', datetime.utcnow()),
            'updated_at': getattr(score, 'updated_at', datetime.utcnow())
        }
        
        player_dict = {
            'name': str(getattr(player, 'name', '')),
            'ipl_team': str(getattr(player, 'ipl_team', '')),
            'role': str(getattr(player, 'role', ''))
        }
        
        response_scores.append(
            PlayerScoreResponse(
                **score_dict,
                player_name=player_dict['name'],
                player_team=team_name,
                player_ipl_team=player_dict['ipl_team'],
                player_role=player_dict['role']
            )
        )
    
    # Calculate statistics
    points_list = [float(getattr(score, 'points', 0.0)) for score in db_scores]
    total_points = sum(points_list)
    avg_points = total_points / len(db_scores) if db_scores else 0.0
    
    return BatchScoreResponse(
        match_id=scores.match_id,
        scores=response_scores,
        total_players_scored=len(db_scores),
        average_points=avg_points
    )

@router.get("/matches/{match_id}", response_model=BatchScoreResponse)
def get_match_scores(
    match_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all player scores for a specific match.
    """
    # Validate match exists
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Get all scores for the match with player details
    scores = db.query(PlayerScore).filter(PlayerScore.match_id == match_id).all()
    
    if not scores:
        raise HTTPException(status_code=404, detail="No scores found for this match")
    
    # Prepare response with player details
    response_scores = []
    for score in scores:
        player = db.query(Player).filter(Player.id == score.player_id).first()
        if not player:
            continue
            
        team_name = None
        if getattr(player, 'team_id', None) is not None:
            team = db.query(Team).filter(Team.id == player.team_id).first()
            team_name = getattr(team, 'name', None)
        
        # Convert SQLAlchemy column values to Python types
        score_dict = {
            'id': int(getattr(score, 'id', 0)),
            'player_id': int(getattr(score, 'player_id', 0)),
            'match_id': int(getattr(score, 'match_id', 0)),
            'points': float(getattr(score, 'points', 0.0)),
            'created_at': getattr(score, 'created_at', datetime.utcnow()),
            'updated_at': getattr(score, 'updated_at', datetime.utcnow())
        }
        
        player_dict = {
            'name': str(getattr(player, 'name', '')),
            'ipl_team': str(getattr(player, 'ipl_team', '')),
            'role': str(getattr(player, 'role', ''))
        }
        
        response_scores.append(
            PlayerScoreResponse(
                **score_dict,
                player_name=player_dict['name'],
                player_team=team_name,
                player_ipl_team=player_dict['ipl_team'],
                player_role=player_dict['role']
            )
        )
    
    # Calculate statistics
    points_list = [float(getattr(score, 'points', 0.0)) for score in scores]
    total_points = sum(points_list)
    avg_points = total_points / len(scores) if scores else 0.0
    
    return BatchScoreResponse(
        match_id=match_id,
        scores=response_scores,
        total_players_scored=len(scores),
        average_points=avg_points
    )

@router.get("/players/{player_id}", response_model=List[PlayerScoreResponse])
def get_player_scores(
    player_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all scores for a specific player across matches.
    """
    # Validate player exists
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get all scores for the player
    scores = db.query(PlayerScore).filter(PlayerScore.player_id == player_id).all()
    
    if not scores:
        return []
    
    # Get player's team if they have one
    team_name = None
    if getattr(player, 'team_id', None) is not None:
        team = db.query(Team).filter(Team.id == player.team_id).first()
        team_name = getattr(team, 'name', None)
    
    # Convert player details once since they're the same for all scores
    player_dict = {
        'name': str(getattr(player, 'name', '')),
        'ipl_team': str(getattr(player, 'ipl_team', '')),
        'role': str(getattr(player, 'role', ''))
    }
    
    # Prepare response
    response_scores = [
        PlayerScoreResponse(
            id=int(getattr(score, 'id', 0)),
            player_id=int(getattr(score, 'player_id', 0)),
            match_id=int(getattr(score, 'match_id', 0)),
            points=float(getattr(score, 'points', 0.0)),
            created_at=getattr(score, 'created_at', datetime.utcnow()),
            updated_at=getattr(score, 'updated_at', datetime.utcnow()),
            player_name=player_dict['name'],
            player_team=team_name,
            player_ipl_team=player_dict['ipl_team'],
            player_role=player_dict['role']
        )
        for score in scores
    ]
    
    return response_scores 