import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api/client';
import { useTeam } from '@/lib/hooks/useTeams';
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

  // Fetch team details
  const { data: team, isLoading, isError, error } = useTeam(parseInt(id));

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
    </div>
  );
};

export default TeamDetails; 