import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { api } from '@/lib/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Gavel, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Player {
  id: number;
  name: string;
  iplTeam: string;
  role: string;
  basePrice: number;
  soldPrice: number;
  teamId: number | null;
  isSold: boolean;
  points: number;
}

interface Team {
  id: number;
  name: string;
  ownerName: string;
  initialPurse: number;
  currentPurse: number;
  points: number;
  playerCount?: number;
}

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

const Auction = () => {
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [currentBid, setCurrentBid] = useState(10);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  // Fetch players that aren't sold yet
  const { data: availablePlayers, isLoading: playersLoading, isError: playersError } = useQuery<Player[]>({
    queryKey: ['players', 'unsold'],
    queryFn: async () => {
      // Create interface for paginated response
      interface PaginatedResponse {
        items: {
          id: number;
          name: string;
          ipl_team: string;
          role: string;
          base_price: number;
          sold_price: number | null;
          team_id: number | null;
          is_sold: boolean;
          created_at: string;
          updated_at: string;
          team_name?: string;
          team_owner?: string;
        }[];
        total: number;
        skip: number;
        limit: number;
      }
      
      // Use direct URL with query parameters instead of params object
      const response = await api.get<PaginatedResponse>('/players/?is_sold=false&limit=1000');
      
      // Transform API response to match frontend Player interface
      return response.items.map(player => ({
        id: player.id,
        name: player.name,
        iplTeam: player.ipl_team,
        role: player.role,
        basePrice: player.base_price,
        soldPrice: player.sold_price || 0,
        teamId: player.team_id,
        isSold: player.is_sold,
        points: 0 // Default points
      }));
    }
  });
  
  // Get auction stats to get team information
  const { data: auctionStats, isLoading: statsLoading, isError: statsError } = useQuery<AuctionStats>({
    queryKey: ['auction', 'stats'],
    queryFn: () => api.get<AuctionStats>('/auction/stats/'),
  });
  
  // Get teams data
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => api.get<Team[]>('/teams/'),
  });
  
  // Set current player
  const currentPlayer = availablePlayers?.[currentPlayerIndex];
  
  // Mutations
  const sellPlayerMutation = useMutation({
    mutationFn: (data: { player_id: number; team_id: number; purchase_price: number }) => 
      api.post('/auction/purchase/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['auction'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Player sold successfully');
      resetAuctionState();
      // Move to next player
      if (availablePlayers && currentPlayerIndex < availablePlayers.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
      }
    },
    onError: (error) => {
      toast.error(`Failed to sell player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
  
  const resetPlayerMutation = useMutation({
    mutationFn: (playerId: number) => 
      api.put(`/auction/reset/${playerId}/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['auction'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.info('Player reset successfully');
    },
    onError: (error) => {
      toast.error(`Failed to reset player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
  
  // Helper functions
  const incrementBid = () => {
    setCurrentBid(prev => prev + 0.5);
  };
  
  const decrementBid = () => {
    if (currentBid > 0.5) {
      setCurrentBid(prev => prev - 0.5);
    }
  };
  
  const resetAuctionState = () => {
    if (currentPlayer && typeof currentPlayer.basePrice === 'number' && !isNaN(currentPlayer.basePrice)) {
      setCurrentBid(currentPlayer.basePrice);
    } else {
      setCurrentBid(0); // Default to 0 if basePrice is not a valid number
    }
    setSelectedTeamId(null);
  };
  
  const handleSellPlayer = () => {
    if (!currentPlayer || !selectedTeamId) {
      toast.error('Please select a team to sell the player to');
      return;
    }
    
    sellPlayerMutation.mutate({
      player_id: currentPlayer.id,
      team_id: selectedTeamId,
      purchase_price: currentBid,
    });
  };
  
  const handleMarkUnsold = () => {
    if (!currentPlayer) return;
    
    // Skip to next player (we don't have a real "mark as unsold" endpoint, so just move to next)
    if (availablePlayers && currentPlayerIndex < availablePlayers.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      resetAuctionState();
      toast.info('Player skipped');
    }
  };
  
  const handleStartNewRound = () => {
    // Reset to first player
    setCurrentPlayerIndex(0);
    resetAuctionState();
    toast.success('New auction round started');
  };
  
  // Reset bid when current player changes
  useEffect(() => {
    if (currentPlayer && typeof currentPlayer.basePrice === 'number' && !isNaN(currentPlayer.basePrice)) {
      setCurrentBid(currentPlayer.basePrice);
    } else {
      setCurrentBid(0); // Default to 0 if basePrice is not a valid number
    }
  }, [currentPlayer]);
  
  // Loading state
  const isLoading = playersLoading || statsLoading || teamsLoading;
  
  // Error state
  const hasError = playersError || statsError || teamsError;
  
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Auction Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-pulse bg-white rounded-xl border border-border h-96"></div>
          <div className="lg:col-span-1 animate-pulse bg-white rounded-xl border border-border h-96"></div>
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-xl font-semibold text-destructive mb-2">Error loading auction data</h3>
        <p className="text-muted-foreground mb-4">Please try again later</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Auction Dashboard</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/auction/stats', '_self')}
          >
            View Stats
          </Button>
          
          <Button 
            size="sm" 
            className="gap-2"
            onClick={handleStartNewRound}
          >
            <Gavel className="h-4 w-4" />
            <span>Start New Round</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden animate-scale-in">
            <CardHeader className="pb-2 bg-gradient-to-r from-ipl-blue/5 to-ipl-orange/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gavel className="h-5 w-5 text-ipl-blue" />
                <span>Current Auction</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {currentPlayer ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="aspect-square rounded-lg bg-gradient-to-tr from-ipl-blue/10 to-ipl-orange/10 flex items-center justify-center">
                      <div className="text-6xl font-bold text-ipl-blue opacity-50">
                        {currentPlayer.name.charAt(0)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-2xl font-semibold mb-2">{currentPlayer.name}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Chip variant="info">{currentPlayer.iplTeam}</Chip>
                      <Chip 
                        variant={
                          currentPlayer.role === 'Batsman' ? 'info' :
                          currentPlayer.role === 'Bowler' ? 'success' :
                          currentPlayer.role === 'All-rounder' ? 'warning' : 'default'
                        }
                      >
                        {currentPlayer.role}
                      </Chip>
                      <Chip variant="secondary">Base: {currentPlayer.basePrice}</Chip>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                      <div className="flex items-center gap-4">
                        <div className="relative flex items-center w-full max-w-[200px]">
                          <input
                            type="number"
                            value={isNaN(currentBid) ? 0 : currentBid}
                            min={currentPlayer && typeof currentPlayer.basePrice === 'number' ? currentPlayer.basePrice : 0}
                            step={0.5}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= 0) {
                                setCurrentBid(value);
                              }
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-input text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <div className="absolute right-3 flex flex-col">
                            <button 
                              className="text-muted-foreground hover:text-primary"
                              onClick={incrementBid}
                              type="button"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button 
                              className="text-muted-foreground hover:text-primary"
                              onClick={decrementBid}
                              type="button"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Assign to team</div>
                      <select 
                        className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={selectedTeamId || ''}
                        onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">Select team</option>
                        {teams?.map(team => {
                          // Find team in stats to get remaining purse
                          const teamStat = auctionStats?.team_stats?.find(s => s.team_id === team.id);
                          const remainingPurse = teamStat?.remaining_purse ?? team.currentPurse;
                          
                          return (
                            <option 
                              key={team.id} 
                              value={team.id}
                              disabled={remainingPurse < currentBid}
                            >
                              {team.name} (Purse: {typeof remainingPurse === 'number' ? remainingPurse.toFixed(1) : '0.0'})
                            </option>
                          );
                        })}
                      </select>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="gap-2 flex-1"
                          onClick={handleSellPlayer}
                          disabled={!selectedTeamId || sellPlayerMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                          <span>Sold</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={handleMarkUnsold}
                          disabled={sellPlayerMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                          <span>Skip</span>
                        </Button>
                        
                        <Button
                          variant="secondary" 
                          size="icon"
                          onClick={resetAuctionState}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">No players available for auction</p>
                  <Button onClick={handleStartNewRound}>Start New Round</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Auction Progress</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {auctionStats?.total_players_sold || 0} Players Sold
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {auctionStats && (
                <div className="w-full h-2 bg-muted">
                  <div 
                    className="h-full bg-ipl-blue rounded-full transition-all duration-1000"
                    style={{ 
                      width: auctionStats.available_players 
                        ? `${(auctionStats.total_players_sold / 
                          (auctionStats.total_players_sold + Object.values(auctionStats.available_players).reduce((a, b) => a + b, 0))) * 100}%` 
                        : '0%'
                    }}
                  ></div>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
                {auctionStats?.team_stats?.map(teamStat => (
                  <div key={teamStat.team_id} className="rounded-lg border border-border p-3">
                    <div className="text-sm font-medium truncate">{teamStat.team_name}</div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Purse:</span>
                      <span className="font-medium">{typeof teamStat.remaining_purse === 'number' ? teamStat.remaining_purse.toFixed(1) : '0.0'}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Players:</span>
                      <span className="font-medium">{teamStat.players_bought}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Available Players</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {availablePlayers?.length || 0} players
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {availablePlayers && availablePlayers.length > 0 ? (
                  availablePlayers.map((player, index) => (
                    <div 
                      key={player.id}
                      className={`p-4 hover:bg-muted/20 transition-colors cursor-pointer ${index === currentPlayerIndex ? 'bg-primary/5' : ''}`}
                      onClick={() => {
                        setCurrentPlayerIndex(index);
                        resetAuctionState();
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-muted-foreground">
                              {player.iplTeam}
                            </div>
                            <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                            <div className="text-xs text-muted-foreground">
                              {player.role}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {player.basePrice}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No players available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auction;
