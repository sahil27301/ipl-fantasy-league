# IPL Fantasy League - Backend Implementation Plan

## Technology Stack
- **Framework**: FastAPI
- **Database**: SQLite
- **ORM**: SQLAlchemy
- **Dependencies Management**: Poetry or requirements.txt
- **Data Validation**: Pydantic models

## Database Models

### 1. Team
```python
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    owner_name = Column(String)
    initial_purse = Column(Float, default=200.0)
    current_purse = Column(Float, default=200.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    players = relationship("Player", back_populates="team")
```

### 2. Player
```python
class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    ipl_team = Column(String, index=True)  # e.g., CSK, MI, RCB
    role = Column(String)  # Batsman, Bowler, All-rounder, Wicket-keeper
    base_price = Column(Float)
    sold_price = Column(Float, nullable=True)  # Non-null value indicates player is sold
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)  # Non-null value indicates player is sold
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    team = relationship("Team", back_populates="players")
    scores = relationship("PlayerScore", back_populates="player")
    
    @property
    def is_sold(self):
        """A player is considered sold if they have both a team and a sold price."""
        return self.team_id is not None and self.sold_price is not None
```

### 3. Match
```python
class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    match_number = Column(Integer, unique=True)
    team1 = Column(String)
    team2 = Column(String)
    match_date = Column(Date)
    venue = Column(String)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    player_scores = relationship("PlayerScore", back_populates="match")
```

### 4. PlayerScore
```python
class PlayerScore(Base):
    __tablename__ = "player_scores"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    match_id = Column(Integer, ForeignKey("matches.id"))
    points = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    player = relationship("Player", back_populates="scores")
    match = relationship("Match", back_populates="player_scores")
```

## API Endpoints

### Teams Management
1. **GET /api/teams** - List all teams
2. **POST /api/teams** - Create a new team
3. **GET /api/teams/{team_id}** - Get details of a specific team
4. **PUT /api/teams/{team_id}** - Update team details
5. **GET /api/teams/{team_id}/players** - Get all players purchased by a team
6. **GET /api/teams/{team_id}/stats** - Get team statistics (total players, points, etc.)

### Players Management
1. **GET /api/players** - List all players (with filters for sold/unsold, team, role, etc.)
2. **POST /api/players** - Add a new player (bulk import option)
3. **GET /api/players/{player_id}** - Get details of a specific player
4. **PUT /api/players/{player_id}** - Update player details

### Auction Management
1. **POST /api/auction/purchase** - Record a player purchase
   ```json
   {
     "player_id": 1,
     "team_id": 2,
     "purchase_price": 15.5
   }
   ```
2. **PUT /api/auction/reset/{player_id}** - Reset a player to unsold status (sets sold_price and team_id to null)
3. **GET /api/auction/stats** - Get auction statistics (players sold, remaining, etc.)

### Matches Management
1. **GET /api/matches** - List all matches
2. **POST /api/matches** - Add a new match
3. **GET /api/matches/{match_id}** - Get details of a specific match
4. **PUT /api/matches/{match_id}** - Update match details
5. **GET /api/matches/{match_id}/scores** - Get all player scores for a match

### Player Scores Management
1. **POST /api/scores** - Add player score for a match
   ```json
   {
     "player_id": 1,
     "match_id": 3,
     "points": 12.5
   }
   ```
2. **PUT /api/scores/{score_id}** - Update player score
3. **GET /api/scores/players/{player_id}** - Get all scores for a specific player

### Dashboard/Analytics
1. **GET /api/dashboard/leaderboard** - Get team leaderboard based on total points
2. **GET /api/dashboard/top-players** - Get top performing players
3. **GET /api/dashboard/player-stats/{player_id}** - Get comprehensive stats for a player

## Implementation Phases

### Phase 1: Core Setup and Data Modeling
1. Initialize FastAPI project with proper folder structure
2. Setup SQLAlchemy and database connection
3. Define database models and relationships
4. Create initial migrations

### Phase 2: Player and Team Management
1. Implement Player CRUD endpoints
2. Implement Team CRUD endpoints
3. Create team management logic

### Phase 3: Auction Management System
1. Implement purchase recording functionality
2. Add purse update logic
3. Create auction statistics endpoints

### Phase 4: Match and Score Management
1. Implement Match CRUD endpoints
2. Create player score recording system
3. Implement score aggregation logic

### Phase 5: Dashboard and Analytics
1. Create team leaderboard endpoint
2. Implement player performance statistics
3. Add match-wise and overall analytics

## Technical Requirements
- Python 3.9+
- FastAPI 0.95+
- SQLAlchemy 2.0+
- pandas for data manipulation
- pytest for unit testing

## Deployment Considerations
- Local deployment with uvicorn server
- Database file path configuration for local SQLite
- Development vs production settings

## Testing Strategy
1. Unit tests for core data models
2. API endpoint tests for validation
3. Integration tests for key workflows:
   - Player purchase flow
   - Score recording flow
   - Leaderboard calculation 