
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Save, BarChart3, Check, Calendar, Users } from 'lucide-react';
import { playerData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const Scores = () => {
  const { toast } = useToast();
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [team1, setTeam1] = useState<string>('');
  const [team2, setTeam2] = useState<string>('');
  const [venue, setVenue] = useState<string>('');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  
  // Filter players that have been assigned to fantasy teams
  const playersToScore = playerData.filter(player => player.isSold);
  
  const handleScoreChange = (playerId: number, value: number) => {
    setScores(prev => ({
      ...prev,
      [playerId]: value
    }));
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!matchDate || !team1 || !team2 || !venue) {
      toast({
        title: "Missing information",
        description: "Please fill in all match details",
        variant: "destructive"
      });
      return;
    }
    
    // Check if any scores have been entered
    if (Object.keys(scores).length === 0) {
      toast({
        title: "No scores entered",
        description: "Please enter at least one player score",
        variant: "destructive"
      });
      return;
    }
    
    // Create new match with scores
    const newMatch = {
      id: Date.now(),
      matchDate,
      team1,
      team2,
      venue,
      scores: { ...scores },
      playersScored: Object.keys(scores).length,
      totalPoints: Object.values(scores).reduce((sum, score) => sum + score, 0)
    };
    
    // Add to recent matches
    setRecentMatches(prev => [newMatch, ...prev]);
    
    // Reset form
    setMatchDate(new Date().toISOString().split('T')[0]);
    setTeam1('');
    setTeam2('');
    setVenue('');
    setScores({});
    
    toast({
      title: "Match scores submitted",
      description: `Match between ${team1} vs ${team2} has been recorded`,
    });
    
    console.log('Submitting match and scores:', newMatch);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Score Entry</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Score History</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Create New Match & Enter Scores</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add a new match and record fantasy points for players
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Match Date</label>
              <div className="flex">
                <div className="relative flex-grow">
                  <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="pl-10"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Venue</label>
              <Input 
                placeholder="Enter match venue" 
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Team 1</label>
              <div className="flex">
                <div className="relative flex-grow">
                  <Users className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Enter team name" 
                    className="pl-10"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Team 2</label>
              <div className="flex">
                <div className="relative flex-grow">
                  <Users className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Enter team name" 
                    className="pl-10"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Player</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {playersToScore.map((player) => (
                  <tr 
                    key={player.id}
                    className="bg-white hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{player.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-ipl-blue"></div>
                        <span>{player.iplTeam}</span>
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
                    <td className="px-4 py-3 text-sm text-right">
                      <input
                        type="number"
                        className="w-20 text-right px-2 py-1 rounded border border-input focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="0.0"
                        step="0.5"
                        min="0"
                        value={scores[player.id] || ''}
                        onChange={(e) => handleScoreChange(player.id, Number(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </Button>
            
            <Button onClick={handleSubmit} className="gap-2">
              <Check className="h-4 w-4" />
              <span>Submit Match</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {recentMatches.length > 0 && (
        <div className="pt-4">
          <h2 className="text-lg font-semibold mb-4">Recent Score Entries</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentMatches.slice(0, 3).map(match => (
              <Card key={match.id} className="overflow-hidden hover-card">
                <CardHeader className="p-4 pb-0 flex-row justify-between items-start">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {new Date(match.matchDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <CardTitle className="text-lg">{match.team1} vs {match.team2}</CardTitle>
                  </div>
                  <Chip variant="success">Completed</Chip>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Venue</span>
                      <span className="font-medium">{match.venue}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Players Scored</span>
                      <span className="font-medium">{match.playersScored}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Points</span>
                      <span className="font-medium">{match.totalPoints.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scores;
