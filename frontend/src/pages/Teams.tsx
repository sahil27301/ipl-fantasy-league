
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, PlusCircle, Search, Filter } from 'lucide-react';
import { teamData } from '@/lib/data';

const Teams = () => {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Teams</h1>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search teams..."
              className="pl-10 pr-4 py-2 rounded-full text-sm w-full sm:w-64 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <Button size="sm" variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Team</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamData.map((team) => (
          <div 
            key={team.id}
            className="rounded-xl border border-border bg-white p-5 transition-all hover-card"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Rank #{team.rank}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">{team.ownerName}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Points</span>
                <span className="font-medium">{team.points}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purse</span>
                  <span className="font-medium">
                    {team.currentPurse} / {team.initialPurse}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-ipl-blue rounded-full transition-all duration-500"
                    style={{ width: `${(team.currentPurse / team.initialPurse) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-border flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs">View Details</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
