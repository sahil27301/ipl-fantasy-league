import LeaderboardWidget from '@/components/dashboard/LeaderboardWidget';
import RecentMatchesWidget from '@/components/dashboard/RecentMatchesWidget';
import TopPerformersWidget from '@/components/dashboard/TopPerformersWidget';
import UpcomingMatchesWidget from '@/components/dashboard/UpcomingMatchesWidget';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { api } from '@/lib/api/client';
import { matchData, playerData } from '@/lib/data';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Trophy, User, Users } from 'lucide-react';

interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  completedMatches: number;
  totalMatches: number;
  topTeam: {
    name: string;
    points: number;
  };
  newPlayers: number;
}

interface LeaderboardEntry {
  team_id: number;
  team_name: string;
  owner_name: string;
  matches_played: number;
  total_points: number;
  average_points_per_match: number;
  rank?: number;
  change?: number;
}

interface Team {
  id: number;
  name: string;
  ownerName: string;
  points: number;
  change: number;
  rank: number;
  initialPurse?: number;
  currentPurse?: number;
}

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

interface Match {
  id: number;
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  venue: string;
  isCompleted: boolean;
}

const Dashboard = () => {
  // Fetch teams from the API
  const { data: teamsData, isLoading: teamsLoading, isError: teamsError } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => api.get<Team[]>('/teams/'),
  });

  // Fetch leaderboard data from dashboard API
  const { data: leaderboardData, isLoading: leaderboardLoading, isError: leaderboardError } = useQuery<LeaderboardEntry[]>({
    queryKey: ['dashboard', 'leaderboard'],
    queryFn: () => api.get<LeaderboardEntry[]>('/dashboard/leaderboard/'),
  });

  // Fetch players from the API
  const { data: playersFromApi, isLoading: playersLoading, isError: playersError } = useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: () => api.get<Player[]>('/players/?sort_by=points&sort_desc=true&limit=5'),
  });

  // Fetch matches from the API
  const { data: matchesFromApi, isLoading: matchesLoading, isError: matchesError } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: () => api.get<Match[]>('/matches/'),
  });

  // Convert leaderboard entries to Team[] format for LeaderboardWidget
  const teams: Team[] = leaderboardData?.map((entry, index) => ({
    id: entry.team_id,
    name: entry.team_name,
    ownerName: entry.owner_name,
    points: entry.total_points,
    rank: index + 1,
    change: entry.change || 0
  })) || [];

  // Use API data with fallbacks to mock data
  const topPlayers = playersFromApi || playerData.sort((a, b) => b.points - a.points).slice(0, 5);
  const matches = matchesFromApi || matchData;
  const recentMatches = matches.filter(match => match.isCompleted).slice(0, 3);
  const upcomingMatches = matches.filter(match => !match.isCompleted).slice(0, 3);
  
  // Compute dashboard stats
  const stats: DashboardStats = {
    totalTeams: teamsData?.length || 0,
    totalPlayers: playerData.length,
    completedMatches: matches.filter(m => m.isCompleted).length,
    totalMatches: matches.length,
    topTeam: teams.length > 0 
      ? {
          name: teams[0].name,
          points: teams[0].points || 0
        }
      : { name: "No team found", points: 0 },
    newPlayers: 5  // Hardcoded for now
  };

  // Check if any data is loading
  const isLoading = teamsLoading || leaderboardLoading || playersLoading || matchesLoading;

  // Check if any data has error
  const hasError = teamsError || leaderboardError || playersError || matchesError;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-border p-4 h-24"></div>
          ))}
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-border p-4 h-64"></div>
          ))}
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-border p-4 h-64"></div>
          ))}
        </section>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-xl font-semibold text-destructive mb-2">Error loading dashboard data</h3>
        <p className="text-muted-foreground mb-4">Please try again later</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Teams" 
          value={stats.totalTeams}
          description="Active fantasy teams in league"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Players" 
          value={stats.totalPlayers}
          description="Players in the auction pool"
          icon={<User className="h-5 w-5" />}
          trend={{ value: stats.newPlayers, isPositive: true }}
        />
        <StatCard 
          title="Top Team" 
          value={stats.topTeam.name}
          description={`${stats.topTeam.points} points`}
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard 
          title="Matches" 
          value={`${stats.completedMatches}/${stats.totalMatches}`}
          description="Completed matches"
          icon={<Calendar className="h-5 w-5" />}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardWidget teams={teams} />
        <TopPerformersWidget players={topPlayers} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMatchesWidget matches={recentMatches} />
        <UpcomingMatchesWidget matches={upcomingMatches} />
      </section>
    </div>
  );
};

export default Dashboard;
