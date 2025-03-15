
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Match {
  id: number;
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  venue: string;
  isCompleted: boolean;
}

interface UpcomingMatchesWidgetProps {
  matches: Match[];
}

const UpcomingMatchesWidget: React.FC<UpcomingMatchesWidgetProps> = ({ matches }) => {
  // Filter to only show completed matches for consistency
  const completedMatches = matches.filter(match => match.isCompleted);
  
  return (
    <Card className="h-full overflow-hidden animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          <span>Recent Matches</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-3">
          {completedMatches.map((match) => (
            <div 
              key={match.id}
              className="rounded-lg border border-border p-4 transition-all hover:shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  Match {match.matchNumber}
                </span>
                <div className="text-xs font-medium text-ipl-blue">
                  {new Date(match.matchDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center w-2/5 justify-end gap-2">
                  <span className="font-medium text-right">{match.team1}</span>
                </div>
                <div className="w-1/5 flex justify-center">
                  <span className="text-xs px-2 text-muted-foreground">vs</span>
                </div>
                <div className="flex items-center w-2/5 gap-2">
                  <span className="font-medium">{match.team2}</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground text-center mt-2">
                {match.venue}
              </div>
              
              <div className="mt-3 pt-2 border-t border-border flex justify-between text-xs">
                <div className="text-muted-foreground">
                  {new Date(match.matchDate).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchesWidget;
