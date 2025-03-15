
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Calendar, PlusCircle } from 'lucide-react';
import { matchData } from '@/lib/data';

const Matches = () => {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Matches</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar View</span>
          </Button>
          
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Match</span>
          </Button>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold pt-4">Completed Matches</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchData
          .filter(match => match.isCompleted)
          .map(match => (
            <Card key={match.id} className="overflow-hidden hover-card">
              <CardHeader className="p-4 pb-0 flex-row justify-between items-start">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Match #{match.matchNumber}</div>
                  <CardTitle className="text-lg">{match.team1} vs {match.team2}</CardTitle>
                </div>
                <Chip variant="success">Completed</Chip>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {new Date(match.matchDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Venue</span>
                    <span className="font-medium">{match.venue}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-border flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="text-xs">View Scores</Button>
                  <Button variant="ghost" size="sm" className="text-xs">Details</Button>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
};

export default Matches;
