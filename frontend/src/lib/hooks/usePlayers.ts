import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { reverseTransformPlayer, transformPlayer } from '../api/transforms';
import type { ApiPlayer, IplTeam, Player, Role } from '../api/types';

// Query key factory
export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...playerKeys.lists(), { filters }] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (id: number) => [...playerKeys.details(), id] as const,
};

interface PlayerFilters {
  role?: Role;
  iplTeam?: IplTeam;
  isSold?: boolean;
  teamId?: number;
  search?: string;
}

// Hooks
export const usePlayers = (filters?: PlayerFilters) => {
  return useQuery({
    queryKey: playerKeys.list(filters ?? {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.role) params.append('role', filters.role);
        if (filters.iplTeam) params.append('ipl_team', filters.iplTeam);
        if (filters.isSold !== undefined) params.append('is_sold', String(filters.isSold));
        if (filters.teamId) params.append('team_id', String(filters.teamId));
        if (filters.search) params.append('search', filters.search);
      }
      
      const response = await api.get<ApiPlayer[]>(`/players?${params.toString()}`);
      return response.map(transformPlayer);
    },
  });
};

export const usePlayer = (id: number) => {
  return useQuery({
    queryKey: playerKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiPlayer>(`/players/${id}`);
      return transformPlayer(response);
    },
    enabled: !!id,
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPlayer: Partial<Player>) => {
      const response = await api.post<ApiPlayer>('/players', reverseTransformPlayer(newPlayer));
      return transformPlayer(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Player> & { id: number }) => {
      const response = await api.put<ApiPlayer>(`/players/${id}`, reverseTransformPlayer(data));
      return transformPlayer(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/players/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
}; 