import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api/client';
import { Role } from '@/lib/api/types';
import { useTeam, useTeamPlayers } from '@/lib/hooks/useTeams';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface LeaderboardEntry {
  team_id: number;
  team_name: string;
  owner_name: string;
  matches_played: number;
  total_points: number;
  average_points_per_match: number;
}

// Helper to group players by role
const roleLabels: Record<Role, string> = {
  BAT: 'Batsmen',
  BOWL: 'Bowlers',
  AR: 'All-Rounders',
  WK: 'Wicket-Keepers'
};

const roleOrder: Role[] = ['BAT', 'BOWL', 'AR', 'WK'];

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Handle invalid id
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-xl font-semibold text-destructive mb-2">Invalid team ID</h3>
        <p className="text-muted-foreground mb-4">Please select a valid team to view details.</p>
        <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
      </div>
    );
  }

  const teamId = parseInt(id);
  
  // Fetch team details
  const { data: team, isLoading, isError, error } = useTeam(teamId);
  
  // Fetch team players
  const { data: players, isLoading: isLoadingPlayers } = useTeamPlayers(teamId);

  // Get leaderboard data for points and rankings
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['dashboard', 'leaderboard'],
    queryFn: () => api.get<LeaderboardEntry[]>('/dashboard/leaderboard'),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-xl font-semibold text-destructive mb-2">Error loading team details</h3>
        <p className="text-muted-foreground mb-4">{error?.message || 'Please try again later'}</p>
        <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  // Calculate rank and points from leaderboard
  const leaderboardEntry = leaderboard?.find(entry => entry.team_id === team.id);
  const rank = team.rank || (leaderboardEntry ? leaderboard?.findIndex(e => e.team_id === team.id) + 1 : 0);
  const points = team.points || leaderboardEntry?.total_points || 0;

  // Group players by role for display
  const playersByRole = players?.reduce(
    (acc, player) => {
      if (player.role && player.role in acc) {
        acc[player.role as Role].push(player);
      }
      return acc;
    },
    { BAT: [], BOWL: [], AR: [], WK: [] } as Record<Role, typeof players>
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => navigate('/teams')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Button>
        <h1 className="text-2xl font-semibold">{team.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Owner</span>
              <span className="font-medium">{team.ownerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Points</span>
              <span className="font-medium">{points}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rank</span>
              <span className="font-medium">#{rank || 'Not Ranked'}</span>
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
          </CardContent>
        </Card>

        {/* Squad Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Squad Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="text-2xl font-semibold">{team.playersByRole?.BAT || 0}</div>
                <div className="text-sm text-muted-foreground">Batsmen</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="text-2xl font-semibold">{team.playersByRole?.BOWL || 0}</div>
                <div className="text-sm text-muted-foreground">Bowlers</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="text-2xl font-semibold">{team.playersByRole?.AR || 0}</div>
                <div className="text-sm text-muted-foreground">All-rounders</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/20">
                <div className="text-2xl font-semibold">{team.playersByRole?.WK || 0}</div>
                <div className="text-sm text-muted-foreground">Wicket-keepers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Players List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Players</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPlayers ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ) : !players || players.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No players have been bought by this team yet.
            </div>
          ) : (
            <div className="space-y-6">
              {roleOrder.map(role => (
                playersByRole && playersByRole[role] && playersByRole[role].length > 0 && (
                  <div key={role} className="space-y-2">
                    <h3 className="font-medium text-lg">{roleLabels[role]}</h3>
                    <div className="divide-y">
                      {playersByRole[role].map(player => (
                        <div key={player.id} className="py-2 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{player.name}</span>
                            <Badge variant="outline">{player.iplTeam}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{player.soldPrice} L</div>
                            <div className="text-xs text-muted-foreground">{player.points} pts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDetails; 