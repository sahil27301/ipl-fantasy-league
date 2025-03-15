import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { useTeams } from '@/lib/hooks/useTeams';
import { useQuery } from '@tanstack/react-query';
import { Filter, PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';

interface LeaderboardEntry {
  team_id: number;
  team_name: string;
  owner_name: string;
  matches_played: number;
  total_points: number;
  average_points_per_match: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
}

const Teams = () => {
  const [search, setSearch] = useState('');

  // Get teams data
  const { data: teams, isLoading, isError, error } = useTeams({
    search: search || undefined,
  });

  // Get leaderboard data for points and rankings
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['dashboard', 'leaderboard'],
    queryFn: async () => {
      const response = await api.get<LeaderboardResponse>('/dashboard/leaderboard/');
      return response.data;
    },
  });

  // Merge leaderboard data with teams
  const teamsWithStats = teams?.map(team => {
    const leaderboardEntry = leaderboard?.find(entry => entry.team_id === team.id);
    return {
      ...team,
      points: leaderboardEntry?.total_points || 0,
      rank: leaderboardEntry ? leaderboard.findIndex(e => e.team_id === team.id) + 1 : 0,
    };
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">Teams</h1>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search teams..."
                className="pl-10 pr-4 py-2 rounded-full text-sm w-full sm:w-64 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                disabled
              />
            </div>
            
            <Button size="sm" variant="outline" className="gap-2" disabled>
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            
            <Button size="sm" className="gap-2" disabled>
              <PlusCircle className="h-4 w-4" />
              <span>Add Team</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-white p-5">
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-xl font-semibold text-destructive mb-2">Error loading teams</h3>
        <p className="text-muted-foreground mb-4">{error?.message || 'Please try again later'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Teams</h1>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full text-sm w-full sm:w-64 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <Button size="sm" variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Team</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamsWithStats?.map((team) => (
          <div 
            key={team.id}
            className="rounded-xl border border-border bg-white p-5 transition-all hover-card"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {team.rank ? `Rank #${team.rank}` : 'Not Ranked'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">{team.ownerName}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Points</span>
                <span className="font-medium">{team.points}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purse</span>
                  <span className="font-medium">
                    {team.currentPurse} / {team.initialPurse}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-ipl-blue rounded-full transition-all duration-500"
                    style={{ width: `${(team.currentPurse / team.initialPurse) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-border flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => window.location.href = `/teams/${team.id}`}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;

