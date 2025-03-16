import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { reverseTransformMatch, transformMatch } from '../api/transforms';
import type { ApiMatch, Match } from '../api/types';

// Query key factory
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...matchKeys.lists(), { filters }] as const,
  details: () => [...matchKeys.all, 'detail'] as const,
  detail: (id: number) => [...matchKeys.details(), id] as const,
};

interface MatchFilters {
  isCompleted?: boolean;
  team?: string;
  fromDate?: string;
  toDate?: string;
}

// Hooks
export const useMatches = (filters?: MatchFilters) => {
  return useQuery({
    queryKey: matchKeys.list(filters ?? {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.isCompleted !== undefined) params.append('is_completed', String(filters.isCompleted));
        if (filters.team) params.append('team', filters.team);
        if (filters.fromDate) params.append('from_date', filters.fromDate);
        if (filters.toDate) params.append('to_date', filters.toDate);
      }
      
      const response = await api.get<ApiMatch[]>(`/matches?${params.toString()}`);
      return response.map(transformMatch);
    },
  });
};

export const useMatch = (id: number) => {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiMatch>(`/matches/${id}`);
      return transformMatch(response);
    },
    enabled: !!id,
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMatch: Partial<Match>) => {
      const response = await api.post<ApiMatch>('/matches', reverseTransformMatch(newMatch));
      return transformMatch(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
};

export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Match> & { id: number }) => {
      const response = await api.put<ApiMatch>(`/matches/${id}`, reverseTransformMatch(data));
      return transformMatch(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
};

// Recent matches hook
export const useRecentMatches = (limit: number = 5) => {
  return useQuery({
    queryKey: [...matchKeys.lists(), { recent: true, limit }],
    queryFn: async () => {
      const response = await api.get<ApiMatch[]>(`/matches/recent?limit=${limit}`);
      return response.map(transformMatch);
    },
  });
};

// Upcoming matches hook
export const useUpcomingMatches = (limit: number = 5) => {
  return useQuery({
    queryKey: [...matchKeys.lists(), { upcoming: true, limit }],
    queryFn: async () => {
      const response = await api.get<ApiMatch[]>(`/matches/upcoming?limit=${limit}`);
      return response.map(transformMatch);
    },
  });
}; 