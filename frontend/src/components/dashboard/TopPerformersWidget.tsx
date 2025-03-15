
import React from 'react';
import { Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';

interface Player {
  id: number;
  name: string;
  role: string;
  iplTeam: string;
  points: number;
  teamId: number | null;
}

interface TopPerformersWidgetProps {
  players: Player[];
}

const TopPerformersWidget: React.FC<TopPerformersWidgetProps> = ({ players }) => {
  return (
    <Card className="h-full overflow-hidden animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-green-500" />
          <span>Top Performers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div className="overflow-y-auto max-h-[320px] scrollbar-thin">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-left">Player</th>
                  <th className="px-4 py-3 text-xs font-medium text-left">Role</th>
                  <th className="px-4 py-3 text-xs font-medium text-left">Team</th>
                  <th className="px-4 py-3 text-xs font-medium text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr 
                    key={player.id} 
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <div className={`
                            h-5 w-5 rounded-full flex items-center justify-center text-xs text-white
                            ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'}
                          `}>
                            {index + 1}
                          </div>
                        )}
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Chip 
                        variant={
                          player.role === 'Batsman' ? 'info' :
                          player.role === 'Bowler' ? 'success' :
                          player.role === 'All-rounder' ? 'warning' : 'default'
                        }
                      >
                        {player.role}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-ipl-blue" />
                        <span className="text-xs">{player.iplTeam}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="font-medium">{player.points}</span>
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

export default TopPerformersWidget;
