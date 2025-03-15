from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Numeric
from datetime import datetime
from sqlalchemy import update

from ..db.database import get_db
from ..models import Player, Team
from ..schemas.auction import AuctionPurchase, AuctionStats, PlayerPurchaseResponse

router = APIRouter()

@router.post("/purchase", response_model=PlayerPurchaseResponse)
def purchase_player(
    purchase: AuctionPurchase,
    db: Session = Depends(get_db)
):
    """
    Record a player purchase during the auction.
    Validates:
    - Player exists and is not already sold
    - Team exists and has sufficient purse
    - Team has not exceeded player limit (16)
    """
    # Get player and validate
    player = db.query(Player).filter(Player.id == purchase.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    if player.team_id is not None:
        raise HTTPException(status_code=400, detail="Player is already sold")
    
    # Get team and validate
    team = db.query(Team).filter(Team.id == purchase.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check team size limit
    team_players = db.query(Player).filter(Player.team_id == team.id).all()
    if len(team_players) >= 16:
        raise HTTPException(status_code=400, detail="Team has reached maximum size of 16 players")
    
    # Calculate total spent by the team using proper type casting
    total_spent = db.query(
        func.coalesce(func.sum(cast(Player.sold_price, Numeric)), 0.0)
    ).filter(
        Player.team_id == team.id
    ).scalar() or 0.0
    
    # Calculate remaining purse with proper type casting
    initial_purse = db.query(
        func.coalesce(cast(Team.initial_purse, Numeric), 0.0)
    ).filter(
        Team.id == team.id
    ).scalar() or 0.0
    
    remaining_purse = float(initial_purse) - float(total_spent)
    if remaining_purse < float(purchase.purchase_price):
        raise HTTPException(status_code=400, detail="Team does not have sufficient purse")
    
    # Update player
    player_stmt = (
        update(Player)
        .where(Player.id == purchase.player_id)
        .values(
            team_id=purchase.team_id,
            sold_price=purchase.purchase_price,
            updated_at=datetime.utcnow()
        )
    )
    db.execute(player_stmt)
    db.commit()
    
    # Refresh and return updated player
    db.refresh(player)
    return player

@router.put("/reset/{player_id}", response_model=PlayerPurchaseResponse)
def reset_player(
    player_id: int,
    db: Session = Depends(get_db)
):
    """
    Reset a player to unsold status.
    """
    # Get player and validate
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    if player.team_id is None:
        raise HTTPException(status_code=400, detail="Player is not sold")
    
    # Reset player
    player_stmt = (
        update(Player)
        .where(Player.id == player_id)
        .values(
            team_id=None,
            sold_price=None,
            updated_at=datetime.utcnow()
        )
    )
    db.execute(player_stmt)
    db.commit()
    
    # Refresh and return updated player
    db.refresh(player)
    return player

@router.get("/stats", response_model=AuctionStats)
def get_auction_stats(
    db: Session = Depends(get_db)
):
    """
    Get comprehensive auction statistics including:
    - Overall stats (total sold, money spent, etc.)
    - Team-wise spending and player counts
    - Role-wise spending and player counts
    - Highest/lowest purchases by role
    """
    # Get all sold players with proper type handling
    stats_result = db.query(
        func.count(Player.id).label('total_sold'),
        func.coalesce(func.sum(cast(Player.sold_price, Numeric)), 0.0).label('total_spent'),
        func.coalesce(func.max(cast(Player.sold_price, Numeric)), 0.0).label('highest_price'),
        func.coalesce(func.min(cast(Player.sold_price, Numeric)), 0.0).label('lowest_price')
    ).filter(
        Player.team_id.isnot(None)
    ).first()
    
    # Handle the case where stats_result might be None
    if stats_result is None:
        total_players_sold = 0
        total_spent = 0.0
        highest_purchase = 0.0
        lowest_purchase = 0.0
    else:
        total_players_sold = int(stats_result.total_sold or 0)
        total_spent = float(stats_result.total_spent or 0.0)
        highest_purchase = float(stats_result.highest_price or 0.0)
        lowest_purchase = float(stats_result.lowest_price or 0.0)
    
    avg_price = total_spent / total_players_sold if total_players_sold > 0 else 0.0
    
    # Get team-wise spending and player counts
    team_stats = db.query(
        Team.id,
        Team.name,
        func.count(Player.id).label('players_bought'),
        func.coalesce(func.sum(cast(Player.sold_price, Numeric)), 0.0).label('total_spent'),
        cast(Team.initial_purse, Numeric).label('initial_purse')
    ).outerjoin(
        Player, Team.id == Player.team_id
    ).group_by(
        Team.id, Team.name, Team.initial_purse
    ).all()
    
    teams_data = [{
        "team_id": t.id,
        "team_name": t.name,
        "players_bought": int(t.players_bought),
        "total_spent": float(t.total_spent),
        "remaining_purse": float(t.initial_purse) - float(t.total_spent),
        "purse_utilization": (float(t.total_spent) / float(t.initial_purse)) * 100 if float(t.initial_purse) > 0 else 0
    } for t in team_stats]
    
    # Get role-wise spending and player counts for sold players
    role_stats = db.query(
        Player.role,
        func.count(Player.id).label('players_sold'),
        func.coalesce(func.sum(cast(Player.sold_price, Numeric)), 0.0).label('total_spent'),
        func.coalesce(func.avg(cast(Player.sold_price, Numeric)), 0.0).label('avg_price'),
        func.coalesce(func.max(cast(Player.sold_price, Numeric)), 0.0).label('highest_price'),
        func.coalesce(func.min(cast(Player.sold_price, Numeric)), 0.0).label('lowest_price')
    ).filter(
        Player.team_id.isnot(None)
    ).group_by(
        Player.role
    ).all()
    
    roles_data = [{
        "role": r.role,
        "players_sold": int(r.players_sold),
        "total_spent": float(r.total_spent),
        "avg_price": float(r.avg_price),
        "highest_price": float(r.highest_price),
        "lowest_price": float(r.lowest_price)
    } for r in role_stats]
    
    # Get players available by role
    available_players = db.query(
        Player.role,
        func.count(Player.id).label('count')
    ).filter(
        Player.team_id.is_(None)
    ).group_by(
        Player.role
    ).all()
    
    players_by_role = {str(role): int(count) for role, count in available_players}
    
    return {
        "total_players_sold": total_players_sold,
        "total_money_spent": total_spent,
        "average_price": avg_price,
        "highest_purchase": highest_purchase,
        "lowest_purchase": lowest_purchase,
        "available_players": players_by_role,
        "team_stats": teams_data,
        "role_stats": roles_data
    } 