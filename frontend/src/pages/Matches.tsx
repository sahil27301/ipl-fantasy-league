import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { api } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Match {
  id: number;
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  venue: string;
  isCompleted: boolean;
}

const Matches = () => {
  const navigate = useNavigate();
  
  // Fetch matches from API
  const { data: matches, isLoading, isError } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: () => api.get<Match[]>('/matches'),
  });

  const completedMatches = matches?.filter(match => match.isCompleted) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">Matches</h1>
        </div>
        
        <h2 className="text-lg font-semibold pt-4">Completed Matches</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <CardHeader className="p-4 pb-0">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">Matches</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
          <h3 className="text-red-800 font-medium">Error loading matches</h3>
          <p className="text-red-600 mt-1">Unable to fetch match data. Please try again later.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Matches</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar View</span>
          </Button>
          
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => navigate('/scores')}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Match</span>
          </Button>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold pt-4">Completed Matches</h2>
      
      {completedMatches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg">
          No completed matches yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedMatches.map(match => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
