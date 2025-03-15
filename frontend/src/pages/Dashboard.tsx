
import React from 'react';
import { Trophy, Users, User, Calendar } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import LeaderboardWidget from '@/components/dashboard/LeaderboardWidget';
import RecentMatchesWidget from '@/components/dashboard/RecentMatchesWidget';
import TopPerformersWidget from '@/components/dashboard/TopPerformersWidget';
import UpcomingMatchesWidget from '@/components/dashboard/UpcomingMatchesWidget';
import { teamData, matchData, playerData } from '@/lib/data';

const Dashboard = () => {
  const teams = teamData.slice(0, 8);
  const recentMatches = matchData
    .filter(match => match.isCompleted)
    .slice(0, 3);
  
  const upcomingMatches = matchData
    .filter(match => !match.isCompleted)
    .slice(0, 3);
  
  const topPlayers = playerData
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Teams" 
          value={teamData.length}
          description="Active fantasy teams in league"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Players" 
          value={playerData.length}
          description="Players in the auction pool"
          icon={<User className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard 
          title="Top Team" 
          value={teams[0].name}
          description={`${teams[0].points} points`}
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard 
          title="Matches" 
          value={`${matchData.filter(m => m.isCompleted).length}/${matchData.length}`}
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
