
import React from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';

interface Team {
  id: number;
  name: string;
  ownerName: string;
  points: number;
  change: number;
  rank: number;
}

interface LeaderboardWidgetProps {
  teams: Team[];
}

const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ teams }) => {
  return (
    <Card className="h-full overflow-hidden animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-ipl-orange" />
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div className="overflow-y-auto max-h-[320px] scrollbar-thin">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-left">Rank</th>
                  <th className="px-4 py-3 text-xs font-medium text-left">Team</th>
                  <th className="px-4 py-3 text-xs font-medium text-right">Points</th>
                  <th className="px-4 py-3 text-xs font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr 
                    key={team.id} 
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        {team.rank <= 3 ? (
                          <div className={`
                            h-6 w-6 rounded-full flex items-center justify-center text-white
                            ${team.rank === 1 ? 'bg-amber-400' : team.rank === 2 ? 'bg-gray-400' : 'bg-amber-700'}
                          `}>
                            {team.rank}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{team.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.ownerName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="font-medium">{team.points}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end">
                        <Chip
                          variant={team.change > 0 ? 'success' : team.change < 0 ? 'danger' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {team.change > 0 ? '+' : team.change < 0 ? '' : '±'}
                          {team.change}
                        </Chip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardWidget;
