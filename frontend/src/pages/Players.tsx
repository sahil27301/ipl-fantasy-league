
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Filter, ChevronDown } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { playerData } from '@/lib/data';

const Players = () => {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Players</h1>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search players..."
              className="pl-10 pr-4 py-2 rounded-full text-sm w-full sm:w-64 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <Button size="sm" variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Player</span>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[800px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>IPL Team</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>Role</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Base Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Sold Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Fantasy Team</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {playerData.slice(0, 10).map((player) => (
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
                  {player.basePrice}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <Chip variant={player.isSold ? 'success' : 'secondary'}>
                    {player.isSold ? 'Sold' : 'Available'}
                  </Chip>
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {player.isSold ? player.soldPrice : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {player.teamId ? (
                    <div className="inline-block rounded-lg bg-secondary px-2 py-1 text-xs">
                      Team {player.teamId}
                    </div>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <svg width="15" height="3" viewBox="0 0 15 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 1.5H1.51M7.5 1.5H7.51M13.5 1.5H13.51M2 1.5C2 1.77614 1.77614 2 1.5 2C1.22386 2 1 1.77614 1 1.5C1 1.22386 1.22386 1 1.5 1C1.77614 1 2 1.22386 2 1.5ZM8 1.5C8 1.77614 7.77614 2 7.5 2C7.22386 2 7 1.77614 7 1.5C7 1.22386 7.22386 1 7.5 1C7.77614 1 8 1.22386 8 1.5ZM14 1.5C14 1.77614 13.7761 2 13.5 2C13.2239 2 13 1.77614 13 1.5C13 1.22386 13.2239 1 13.5 1C13.7761 1 14 1.22386 14 1.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <div className="text-muted-foreground">
          Showing 1-10 of {playerData.length} players
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default Players;
