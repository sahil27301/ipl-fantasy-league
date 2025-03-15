# IPL Fantasy League - Frontend Implementation Plan

## Technology Stack
- **Framework**: Lovable.dev for UI components
- **HTTP Client**: Axios
- **Styling**: CSS/SCSS provided by Lovable.dev

## Pages and Components

### 1. Layout Components
- **AppLayout**: Main layout wrapper with navigation
- **Sidebar**: Navigation links to different sections
- **Header**: App title, current user, quick actions
- **Footer**: Credits, version info

### 2. Team Management Pages
- **TeamsListPage**: Overview of all teams with purse information
  - TeamCard: Card view for each team
  - PurseIndicator: Visual indicator of remaining purse
- **TeamDetailPage**: Detailed view of a specific team
  - TeamInfo: Team name, owner, purse details
  - TeamPlayers: List of players purchased by team
  - TeamStats: Statistical overview of team performance

### 3. Auction Management Pages
- **AuctionDashboardPage**: Main auction control center
  - PlayerSearch: Search functionality for finding players
  - FilterPanel: Filter players by team, role, price, etc.
  - AuctionControls: Start, pause, resume auction
  - CurrentBidDisplay: Display current player and bid
- **PlayerAuctionPage**: Interface for managing individual player auction
  - BidCounter: Track current bid amount
  - TeamSelector: Select which team made the winning bid
  - PriceInput: Input for final sold price
  - QuickActions: Sold, Unsold buttons
- **UnsoldPlayersPage**: List of players not yet purchased
  - UnsoldPlayersList: Filterable list of available players
  - BulkActions: Actions for multiple players

### 4. Match Management Pages
- **MatchesListPage**: List of all IPL matches
  - MatchCard: Card view for each match with key details
  - MatchFilters: Filter by team, date, status
  - UpcomingIndicator: Highlight next matches
- **MatchDetailPage**: Details about a specific match
  - MatchInfo: Match details, teams, venue
  - PlayerParticipation: Which players played in the match
  - ScoreEntryForm: Form to enter player scores

### 5. Score Management Pages
- **ScoreEntryPage**: Interface for entering player scores
  - MatchSelector: Select which match to enter scores for
  - PlayerScoreCard: Card for each player with score input
  - BulkScoreEntry: Enter scores for multiple players
  - SaveProgress: Save partial score entries
- **ScoreHistoryPage**: View historical scores
  - ScoreFilters: Filter by player, match, date
  - ScoreTable: Tabular view of scores
  - ScoreEdit: Edit previously entered scores

### 6. Dashboard Pages
- **MainDashboardPage**: Overview of league status
  - LeaderboardWidget: Current team standings
  - RecentMatchesWidget: Recent match results
  - TopPerformersWidget: Top performing players
  - UpcomingMatchesWidget: Next matches
- **TeamPerformancePage**: Detailed team performance metrics
  - PerformanceChart: Visual representation of team performance
  - PlayerContributionChart: Contribution of each player
  - MatchwisePerformance: Performance across matches

## UI Components Library

### Data Display Components
- **DataTable**: Sortable, filterable table with pagination
- **DataCard**: Card layout for entity information
- **StatisticDisplay**: Numeric statistic with label and trend
- **Badge**: Status indicators (sold, unsold, etc.)
- **Alert**: Information and error messages

### Form Components
- **SearchInput**: Input field with search functionality
- **FilterGroup**: Group of filter options
- **NumberInput**: Input for numeric values with validation
- **Select**: Dropdown selection component
- **MultiSelect**: Multiple selection component
- **DatePicker**: Date selection component

### Visual Components
- **ProgressBar**: Visual indicator of progress
- **PieChart**: Distribution visualization
- **BarChart**: Comparison visualization
- **LineChart**: Trend visualization
- **Tooltip**: Contextual information on hover

## API Integration

### API Service Modules
- **TeamsService**: Handling team-related API calls
- **PlayersService**: Handling player-related API calls
- **AuctionService**: Handling auction-related API calls
- **MatchesService**: Handling match-related API calls
- **ScoresService**: Handling score-related API calls
- **DashboardService**: Handling analytics and dashboard data

### Data Models (TypeScript Interfaces)
```typescript
interface Team {
  id: number;
  name: string;
  ownerName: string;
  initialPurse: number;
  currentPurse: number;
  createdAt: string;
  updatedAt: string;
  players?: Player[];
}

interface Player {
  id: number;
  name: string;
  iplTeam: string;
  role: string;
  basePrice: number;
  soldPrice?: number;
  teamId?: number;
  createdAt: string;
  updatedAt: string;
  isSold: boolean;
  scores?: PlayerScore[];
}

interface Match {
  id: number;
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  venue: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  playerScores?: PlayerScore[];
}

interface PlayerScore {
  id: number;
  playerId: number;
  matchId: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}
```

## Implementation Phases

### Phase 1: Core Setup and Navigation
1. Setup project with Lovable.dev
2. Create main layout components
3. Implement navigation structure
4. Setup API service foundation

### Phase 2: Team and Player Management
1. Implement Teams list and detail pages
2. Create Players list and detail components
3. Setup team management workflows
4. Implement data validation

### Phase 3: Auction Management System
1. Build auction dashboard
2. Implement player bidding interface
3. Create auction status tracking
4. Add team purse management UI

### Phase 4: Match and Score Management
1. Create match listing and details pages
2. Implement score entry interface
3. Build score history views
4. Add score validation and batch updates

### Phase 5: Dashboard and Analytics
1. Implement main dashboard with widgets
2. Create team performance visualizations
3. Add export functionality
4. Implement advanced filtering

## Error Handling and UX
1. **Form Validation**: Immediate feedback on input errors
2. **Loading States**: Clear indicators during API calls
3. **Empty States**: Helpful messages when no data is available
4. **Error Recovery**: Suggestions on how to recover from errors 