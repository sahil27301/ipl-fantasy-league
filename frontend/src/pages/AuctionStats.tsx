import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api/client';
import { transformPlayer } from '@/lib/api/transforms';
import { Player } from '@/lib/api/types';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowLeft, ChevronDown, ChevronUp, DollarSign, Search, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuctionStats {
  total_players_sold: number;
  total_money_spent: number;
  average_price: number;
  highest_purchase: number;
  lowest_purchase: number;
  available_players: Record<string, number>;
  team_stats: Array<{
    team_id: number;
    team_name: string;
    players_bought: number;
    total_spent: number;
    remaining_purse: number;
    purse_utilization: number;
  }>;
  role_stats: Array<{
    role: string;
    players_sold: number;
    total_spent: number;
    avg_price: number;
    highest_price: number;
    lowest_price: number;
  }>;
}

interface ApiPlayer {
  id: number;
  name: string;
  ipl_team: string;
  role: string;
  base_price: number;
  sold_price: number | null;
  team_id: number | null;
  team_name: string | null;
  team_owner: string | null;
  is_sold: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for paginated response from API
interface PaginatedResponse {
  items: ApiPlayer[];
  total: number;
  skip: number;
  limit: number;
}

// Extended Player interface with team information
interface PlayerWithTeam extends Player {
  teamName?: string;
}

// Define sort options
type SortField = 'soldPrice' | 'teamName' | 'name';
type SortDirection = 'asc' | 'desc';

const AuctionStats = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'roles' | 'players'>('overview');
  const [playerSearch, setPlayerSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch auction stats
  const { data: stats, isLoading, isError, error } = useQuery<AuctionStats>({
    queryKey: ['auction', 'stats'],
    queryFn: () => api.get<AuctionStats>('/auction/stats/'),
  });

  // Fetch all sold players
  const { data: players, isLoading: isLoadingPlayers } = useQuery<PlayerWithTeam[]>({
    queryKey: ['players', 'sold'],
    queryFn: async () => {
      try {
        const response = await api.get<PaginatedResponse>('/players/?is_sold=true&limit=100');
        
        // Transform the API response to properly typed Player objects
        return response.items
          .filter(apiPlayer => apiPlayer.team_id !== null) // Only include players with a team_id
          .map(apiPlayer => {
            // First convert to the standard Player format
            const player = transformPlayer(apiPlayer);
            
            // Then add the teamName property
            return {
              ...player,
              teamName: apiPlayer.team_name || undefined
            };
          });
      } catch (error) {
        console.error('Error fetching sold players:', error);
        return [];
      }
    },
  });

  // Format numbers as currency
  const formatCurrency = (value: number) => {
    return value.toFixed(1);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get total available players
  const getTotalAvailablePlayers = () => {
    if (!stats?.available_players) return 0;
    return Object.values(stats.available_players).reduce((sum, count) => sum + count, 0);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort players
  const sortedAndFilteredPlayers = players ? 
    [...players]
      // Filter by search term
      .filter(player => player.name.toLowerCase().includes(playerSearch.toLowerCase()))
      // Sort by selected field
      .sort((a, b) => {
        // Handle null values for soldPrice
        if (sortField === 'soldPrice') {
          const priceA = a.soldPrice || 0;
          const priceB = b.soldPrice || 0;
          return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
        }
        
        // Handle null values for teamName
        if (sortField === 'teamName') {
          const teamA = a.teamName || '';
          const teamB = b.teamName || '';
          return sortDirection === 'asc' 
            ? teamA.localeCompare(teamB) 
            : teamB.localeCompare(teamA);
        }
        
        // Default to name
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      })
    : [];

  // Group players by role for display
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'BAT': return 'Batsman';
      case 'BOWL': return 'Bowler';
      case 'AR': return 'All-rounder';
      case 'WK': return 'Wicket-keeper';
      default: return role;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => navigate('/auction')}
            disabled
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Auction
          </Button>
          <h1 className="text-2xl font-semibold">Auction Statistics</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-border p-4 h-24"></div>
          ))}
        </div>
        
        <div className="animate-pulse bg-white rounded-xl border border-border p-4 h-64"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-xl font-semibold text-destructive mb-2">Error loading auction statistics</h3>
        <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Please try again later'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => navigate('/auction')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auction
        </Button>
        <h1 className="text-2xl font-semibold">Auction Statistics</h1>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Players Sold</p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats?.total_players_sold || 0} / {(stats?.total_players_sold || 0) + getTotalAvailablePlayers()}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats && formatPercent((stats.total_players_sold / ((stats.total_players_sold) + getTotalAvailablePlayers())) * 100)} complete
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(stats?.total_money_spent || 0)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {formatCurrency(stats?.average_price || 0)} per player
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highest Purchase</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(stats?.highest_purchase || 0)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Lowest: {formatCurrency(stats?.lowest_purchase || 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Players</p>
                <h3 className="text-2xl font-bold mt-1">
                  {getTotalAvailablePlayers()}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {Object.keys(stats?.available_players || {}).length} roles
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'teams' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'roles' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('roles')}
        >
          Roles
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'players' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Players by Role</CardTitle>
                <CardDescription>Breakdown of remaining players in the auction pool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.available_players && Object.entries(stats.available_players).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          role === 'BAT' ? 'bg-blue-500' :
                          role === 'BOWL' ? 'bg-red-500' :
                          role === 'AR' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}></div>
                        <span>{role === 'BAT' ? 'Batsman' :
                               role === 'BOWL' ? 'Bowler' :
                               role === 'AR' ? 'All-rounder' :
                               role === 'WK' ? 'Wicket-keeper' : role}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Spending Distribution</CardTitle>
                <CardDescription>How much has been spent on different roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.role_stats.map(role => (
                    <div key={role.role} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            role.role === 'BAT' ? 'bg-blue-500' :
                            role.role === 'BOWL' ? 'bg-red-500' :
                            role.role === 'AR' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}></div>
                          <span>{role.role === 'BAT' ? 'Batsman' :
                                 role.role === 'BOWL' ? 'Bowler' :
                                 role.role === 'AR' ? 'All-rounder' :
                                 role.role === 'WK' ? 'Wicket-keeper' : role.role}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(role.total_spent)} ({role.players_sold} players)</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            role.role === 'BAT' ? 'bg-blue-500' :
                            role.role === 'BOWL' ? 'bg-red-500' :
                            role.role === 'AR' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${(role.total_spent / (stats?.total_money_spent || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <Card>
            <CardHeader>
              <CardTitle>Team Summary</CardTitle>
              <CardDescription>Spending and acquisition details by team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Team</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Players</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Spent</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Remaining</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.team_stats.map(team => (
                      <tr key={team.team_id} className="border-b hover:bg-muted/20">
                        <td className="py-3 px-2 font-medium">{team.team_name}</td>
                        <td className="py-3 px-2 text-center">{team.players_bought}</td>
                        <td className="py-3 px-2 text-center">{formatCurrency(team.total_spent)}</td>
                        <td className="py-3 px-2 text-center">{formatCurrency(team.remaining_purse)}</td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 bg-muted h-1.5 rounded-full">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${team.purse_utilization}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{formatPercent(team.purse_utilization)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <Card>
            <CardHeader>
              <CardTitle>Role Analysis</CardTitle>
              <CardDescription>Detailed stats by player role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Players Sold</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Available</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Avg Price</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Highest</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Lowest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.role_stats.map(role => (
                      <tr key={role.role} className="border-b hover:bg-muted/20">
                        <td className="py-3 px-2 font-medium">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              role.role === 'BAT' ? 'bg-blue-500' :
                              role.role === 'BOWL' ? 'bg-red-500' :
                              role.role === 'AR' ? 'bg-green-500' :
                              'bg-purple-500'
                            }`}></div>
                            <span>{role.role === 'BAT' ? 'Batsman' :
                                   role.role === 'BOWL' ? 'Bowler' :
                                   role.role === 'AR' ? 'All-rounder' :
                                   role.role === 'WK' ? 'Wicket-keeper' : role.role}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">{role.players_sold}</td>
                        <td className="py-3 px-2 text-center">{stats.available_players[role.role] || 0}</td>
                        <td className="py-3 px-2 text-center">{formatCurrency(role.avg_price)}</td>
                        <td className="py-3 px-2 text-center">{formatCurrency(role.highest_price)}</td>
                        <td className="py-3 px-2 text-center">{formatCurrency(role.lowest_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Players Tab */}
        {activeTab === 'players' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Sold Players</h2>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search players..." 
                  className="pl-8"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                />
              </div>
            </div>

            {isLoadingPlayers ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            ) : !sortedAndFilteredPlayers?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                {players?.length ? 'No players match your search' : 'No players have been sold yet'}
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium">
                        <button 
                          className="flex items-center focus:outline-none"
                          onClick={() => handleSort('name')}
                        >
                          Player
                          {sortField === 'name' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-2 font-medium">Role</th>
                      <th className="text-left p-2 font-medium">IPL Team</th>
                      <th className="text-left p-2 font-medium">
                        <button 
                          className="flex items-center focus:outline-none"
                          onClick={() => handleSort('teamName')}
                        >
                          Bought By
                          {sortField === 'teamName' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="text-right p-2 font-medium">
                        <button 
                          className="flex items-center ml-auto focus:outline-none"
                          onClick={() => handleSort('soldPrice')}
                        >
                          Price
                          {sortField === 'soldPrice' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedAndFilteredPlayers.map(player => (
                      <tr key={player.id} className="hover:bg-muted/30">
                        <td className="p-2">{player.name}</td>
                        <td className="p-2">
                          <Badge variant="outline" className={
                            player.role === 'BAT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            player.role === 'BOWL' ? 'bg-red-50 text-red-700 border-red-200' :
                            player.role === 'AR' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-purple-50 text-purple-700 border-purple-200'
                          }>
                            {getRoleLabel(player.role)}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="secondary">{player.iplTeam}</Badge>
                        </td>
                        <td className="p-2 font-medium">{player.teamName || '-'}</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(player.soldPrice || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionStats; 