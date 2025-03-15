
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Gavel, Plus, Minus, Check, X, RotateCcw } from 'lucide-react';
import { playerData, teamData } from '@/lib/data';

const Auction = () => {
  const [currentBid, setCurrentBid] = React.useState(10);
  const availablePlayers = playerData.filter(player => !player.isSold).slice(0, 8);
  const currentPlayer = availablePlayers[0];
  
  const incrementBid = () => {
    setCurrentBid(prev => prev + 0.5);
  };
  
  const decrementBid = () => {
    if (currentBid > 0.5) {
      setCurrentBid(prev => prev - 0.5);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Auction Dashboard</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Auction History
          </Button>
          
          <Button size="sm" className="gap-2">
            <Gavel className="h-4 w-4" />
            <span>Start New Round</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden animate-scale-in">
            <CardHeader className="pb-2 bg-gradient-to-r from-ipl-blue/5 to-ipl-orange/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gavel className="h-5 w-5 text-ipl-blue" />
                <span>Current Auction</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="aspect-square rounded-lg bg-gradient-to-tr from-ipl-blue/10 to-ipl-orange/10 flex items-center justify-center">
                    <div className="text-6xl font-bold text-ipl-blue opacity-50">
                      {currentPlayer.name.charAt(0)}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-semibold mb-2">{currentPlayer.name}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Chip variant="info">{currentPlayer.iplTeam}</Chip>
                    <Chip 
                      variant={
                        currentPlayer.role === 'Batsman' ? 'info' :
                        currentPlayer.role === 'Bowler' ? 'success' :
                        currentPlayer.role === 'All-rounder' ? 'warning' : 'default'
                      }
                    >
                      {currentPlayer.role}
                    </Chip>
                    <Chip variant="secondary">Base: {currentPlayer.basePrice}</Chip>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={decrementBid}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <div className="text-3xl font-semibold">{currentBid.toFixed(1)}</div>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={incrementBid}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Assign to team</div>
                    <select className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Select team</option>
                      {teamData.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} (Purse: {team.currentPurse})
                        </option>
                      ))}
                    </select>
                    
                    <div className="flex gap-2 pt-2">
                      <Button className="gap-2 flex-1">
                        <Check className="h-4 w-4" />
                        <span>Sold</span>
                      </Button>
                      
                      <Button variant="outline" className="gap-2">
                        <X className="h-4 w-4" />
                        <span>Unsold</span>
                      </Button>
                      
                      <Button variant="secondary" size="icon">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Auction Progress</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {playerData.filter(p => p.isSold).length} / {playerData.length} Players Sold
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-2 bg-muted">
                <div 
                  className="h-full bg-ipl-blue rounded-full transition-all duration-1000"
                  style={{ width: `${(playerData.filter(p => p.isSold).length / playerData.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
                {teamData.slice(0, 8).map(team => (
                  <div key={team.id} className="rounded-lg border border-border p-3">
                    <div className="text-sm font-medium truncate">{team.name}</div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Purse:</span>
                      <span className="font-medium">{team.currentPurse}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Players:</span>
                      <span className="font-medium">{playerData.filter(p => p.teamId === team.id).length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Available Players</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {availablePlayers.map(player => (
                  <div 
                    key={player.id}
                    className="p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-muted-foreground">
                            {player.iplTeam}
                          </div>
                          <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                          <div className="text-xs text-muted-foreground">
                            {player.role}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {player.basePrice}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auction;
