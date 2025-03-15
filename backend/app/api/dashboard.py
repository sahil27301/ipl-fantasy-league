from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, distinct
from typing import List
from datetime import datetime

from ..db.database import get_db
from ..models import Team, Player, PlayerScore, Match
from ..schemas.dashboard import (
    TeamLeaderboard,
    TopPlayer,
    PlayerStats
)

router = APIRouter()

@router.get("/leaderboard", response_model=List[TeamLeaderboard])
def get_team_leaderboard(
    db: Session = Depends(get_db)
):
    """
    Get team leaderboard based on total points.
    Returns teams sorted by:
    1. Total points (desc)
    2. Number of matches played (asc) - to account for teams with fewer matches
    3. Team name (asc) - for consistent ordering
    """
    # Subquery to get total points and matches played for each team
    team_stats = (
        db.query(
            Team.id,
            Team.name,
            Team.owner_name,
            func.count(func.distinct(PlayerScore.match_id)).label('matches_played'),
            func.sum(PlayerScore.points).label('total_points')
        )
        .join(Team.players)
        .join(Player.scores)
        .group_by(Team.id)
        .order_by(
            desc('total_points'),
            'matches_played',
            Team.name
        )
        .all()
    )
    
    return [
        {
            "team_id": stats.id,
            "team_name": stats.name,
            "owner_name": stats.owner_name,
            "matches_played": stats.matches_played,
            "total_points": float(stats.total_points or 0),
            "average_points_per_match": float(stats.total_points or 0) / stats.matches_played if stats.matches_played > 0 else 0
        }
        for stats in team_stats
    ]

@router.get("/top-players", response_model=List[TopPlayer])
def get_top_players(
    limit: int = 10,
    role: str | None = None,
    min_matches: int = 1,
    db: Session = Depends(get_db)
):
    """
    Get top performing players based on average points per match.
    
    Parameters:
    - limit: Number of players to return
    - role: Filter by player role (BAT/BOWL/AR)
    - min_matches: Minimum matches played to be considered
    """
    query = (
        db.query(
            Player.id,
            Player.name,
            Player.role,
            Player.ipl_team,
            Team.name.label('fantasy_team'),
            func.count(func.distinct(PlayerScore.match_id)).label('matches_played'),
            func.sum(PlayerScore.points).label('total_points'),
            (func.sum(PlayerScore.points) / func.count(func.distinct(PlayerScore.match_id))).label('avg_points')
        )
        .outerjoin(Team)
        .join(PlayerScore)
        .group_by(Player.id)
        .having(func.count(func.distinct(PlayerScore.match_id)) >= min_matches)
    )
    
    if role:
        query = query.filter(Player.role == role)
    
    players = (
        query.order_by(desc('avg_points'))
        .limit(limit)
        .all()
    )
    
    return [
        {
            "player_id": p.id,
            "name": p.name,
            "role": p.role,
            "ipl_team": p.ipl_team,
            "fantasy_team": p.fantasy_team or None,
            "matches_played": p.matches_played,
            "total_points": float(p.total_points),
            "average_points": float(p.avg_points)
        }
        for p in players
    ]

@router.get("/player-stats/{player_id}", response_model=PlayerStats)
def get_player_stats(
    player_id: int,
    db: Session = Depends(get_db)
):
    """
    Get comprehensive statistics for a specific player.
    """
    # Get player base info
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get match statistics
    match_stats = (
        db.query(
            func.count(func.distinct(PlayerScore.match_id)).label('total_matches'),
            func.sum(PlayerScore.points).label('total_points'),
            func.avg(PlayerScore.points).label('avg_points'),
            func.max(PlayerScore.points).label('highest_score'),
            func.min(PlayerScore.points).label('lowest_score')
        )
        .filter(PlayerScore.player_id == player_id)
        .first()
    )
    
    # Get recent performances
    recent_matches = (
        db.query(
            Match.match_number,
            Match.team1,
            Match.team2,
            Match.match_date,
            PlayerScore.points
        )
        .join(PlayerScore)
        .filter(PlayerScore.player_id == player_id)
        .order_by(desc(Match.match_date))
        .limit(5)
        .all()
    )
    
    # Handle case where match_stats might be None
    total_matches = getattr(match_stats, 'total_matches', 0)
    total_points = float(getattr(match_stats, 'total_points', 0) or 0)
    avg_points = float(getattr(match_stats, 'avg_points', 0) or 0)
    highest_score = float(getattr(match_stats, 'highest_score', 0) or 0)
    lowest_score = float(getattr(match_stats, 'lowest_score', 0) or 0)
    
    return {
        "player_id": player.id,
        "name": player.name,
        "role": player.role,
        "ipl_team": player.ipl_team,
        "fantasy_team": player.team.name if player.team else None,
        "base_price": player.base_price,
        "sold_price": player.sold_price,
        "matches_played": total_matches,
        "total_points": total_points,
        "average_points": avg_points,
        "highest_score": highest_score,
        "lowest_score": lowest_score,
        "recent_performances": [
            {
                "match_number": match.match_number,
                "teams": f"{match.team1} vs {match.team2}",
                "date": match.match_date,
                "points": float(match.points)
            }
            for match in recent_matches
        ]
    } 