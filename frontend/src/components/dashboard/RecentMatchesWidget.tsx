
import React from 'react';
import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';

interface Match {
  id: number;
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  venue: string;
  isCompleted: boolean;
}

interface RecentMatchesWidgetProps {
  matches: Match[];
}

const RecentMatchesWidget: React.FC<RecentMatchesWidgetProps> = ({ matches }) => {
  return (
    <Card className="h-full overflow-hidden animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-ipl-blue" />
          <span>Recent Matches</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-4">
          {matches.map((match) => (
            <div 
              key={match.id}
              className="rounded-lg border border-border p-4 transition-all hover:shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    Match {match.matchNumber}
                  </span>
                  <Chip 
                    variant={match.isCompleted ? 'success' : 'warning'}
                  >
                    {match.isCompleted ? 'Completed' : 'Upcoming'}
                  </Chip>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(match.matchDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center w-2/5 justify-end">
                  <span className="font-medium text-right">{match.team1}</span>
                </div>
                <div className="w-1/5 flex justify-center">
                  <span className="text-xs px-2 text-muted-foreground">vs</span>
                </div>
                <div className="flex items-center w-2/5">
                  <span className="font-medium">{match.team2}</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground text-center mt-2">
                {match.venue}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMatchesWidget;
