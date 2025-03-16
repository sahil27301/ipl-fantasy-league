import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { api } from '@/lib/api/client';
import { Player as ApiPlayer } from '@/lib/api/types';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Filter, LoaderCircle, PlusCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

// Extend the Player interface to include team name
interface Player extends ApiPlayer {
  teamName?: string;
}

// Interface for paginated response from API
interface PaginatedResponse {
  items: Player[];
  total: number;
  skip: number;
  limit: number;
}

const Players = () => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [iplTeam, setIplTeam] = useState<string | null>(null);
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch players from API
  const { data, isLoading, isError, error } = useQuery<PaginatedResponse>({
    queryKey: ['players', page, pageSize, debouncedQuery, role, iplTeam],
    queryFn: async () => {
      // Construct query params
      const params: Record<string, any> = {
        skip: (page - 1) * pageSize,
        limit: pageSize
      };
      
      if (debouncedQuery) params.search = debouncedQuery;
      if (role) params.role = role;
      if (iplTeam) params.ipl_team = iplTeam;
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      return await api.get<PaginatedResponse>(`/players/?${queryParams.toString()}`);
    }
  });
  
  const players = data?.items || [];
  const totalPlayers = data?.total || 0;
  
  // Calculate pagination info
  const startIndex = players.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const endIndex = players.length > 0 ? startIndex + players.length - 1 : 0;
  const hasMorePlayers = endIndex < totalPlayers;
  
  // Function to format player role label
  const getPlayerRoleLabel = (role: string) => {
    switch(role) {
      case 'BAT': return 'Batsman';
      case 'BOWL': return 'Bowler';
      case 'AR': return 'All-rounder';
      case 'WK': return 'Wicket-keeper';
      default: return role;
    }
  };
  
  // Function to get chip variant based on role
  const getRoleChipVariant = (role: string) => {
    switch(role) {
      case 'BAT': return 'info';
      case 'BOWL': return 'success';
      case 'AR': return 'warning';
      case 'WK': return 'default';
      default: return 'default';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">Players</h1>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">IPL Team</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Base Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Sold Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Fantasy Team</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-6 bg-gray-200 rounded w-16 ml-auto"></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-6 bg-gray-200 rounded w-16 ml-auto"></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-center">
          <LoaderCircle className="animate-spin text-primary h-6 w-6" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">Players</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
          <h3 className="text-red-800 font-medium">Error loading players</h3>
          <p className="text-red-600 mt-1">
            {error instanceof Error ? error.message : "Unable to fetch player data. Please try again later."}
          </p>
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
        <h1 className="text-2xl font-semibold">Players</h1>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search players..."
              className="pl-10 pr-4 py-2 rounded-full text-sm w-full sm:w-64 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            {players.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  {debouncedQuery ? 'No players found matching your search' : 'No players available in the system'}
                </td>
              </tr>
            ) : (
              players.map((player) => (
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
                      variant={getRoleChipVariant(player.role)}
                    >
                      {getPlayerRoleLabel(player.role)}
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
                        {player.teamName || `Team ${player.teamId}`}
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
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <div className="text-muted-foreground">
          {players.length > 0 
            ? `Showing ${startIndex}-${endIndex} of ${totalPlayers} players`
            : `0 players found`
          }
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!hasMorePlayers}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Players;
