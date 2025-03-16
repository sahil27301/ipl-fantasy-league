import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { reverseTransformPlayerScore, transformPlayerScore } from '../api/transforms';
import type { ApiPlayerScore, PlayerScore } from '../api/types';

// Query key factory
export const scoreKeys = {
  all: ['scores'] as const,
  lists: () => [...scoreKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...scoreKeys.lists(), { filters }] as const,
  details: () => [...scoreKeys.all, 'detail'] as const,
  detail: (id: number) => [...scoreKeys.details(), id] as const,
  player: (playerId: number) => [...scoreKeys.all, 'player', playerId] as const,
  match: (matchId: number) => [...scoreKeys.all, 'match', matchId] as const,
};

interface ScoreFilters {
  playerId?: number;
  matchId?: number;
  minPoints?: number;
  maxPoints?: number;
}

// Hooks
export const useScores = (filters?: ScoreFilters) => {
  return useQuery({
    queryKey: scoreKeys.list(filters ?? {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.playerId) params.append('player_id', String(filters.playerId));
        if (filters.matchId) params.append('match_id', String(filters.matchId));
        if (filters.minPoints) params.append('min_points', String(filters.minPoints));
        if (filters.maxPoints) params.append('max_points', String(filters.maxPoints));
      }
      
      const response = await api.get<ApiPlayerScore[]>(`/scores?${params.toString()}`);
      return response.map(transformPlayerScore);
    },
  });
};

export const usePlayerScores = (playerId: number) => {
  return useQuery({
    queryKey: scoreKeys.player(playerId),
    queryFn: async () => {
      const response = await api.get<ApiPlayerScore[]>(`/scores/players/${playerId}`);
      return response.map(transformPlayerScore);
    },
    enabled: !!playerId,
  });
};

export const useMatchScores = (matchId: number) => {
  return useQuery({
    queryKey: scoreKeys.match(matchId),
    queryFn: async () => {
      const response = await api.get<ApiPlayerScore[]>(`/scores/matches/${matchId}`);
      return response.map(transformPlayerScore);
    },
    enabled: !!matchId,
  });
};

export const useCreateScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newScore: Partial<PlayerScore>) => {
      const response = await api.post<ApiPlayerScore>('/scores', reverseTransformPlayerScore(newScore));
      return transformPlayerScore(response);
    },
    onSuccess: (score) => {
      queryClient.invalidateQueries({ queryKey: scoreKeys.player(score.playerId) });
      queryClient.invalidateQueries({ queryKey: scoreKeys.match(score.matchId) });
      queryClient.invalidateQueries({ queryKey: scoreKeys.lists() });
    },
  });
};

export const useUpdateScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<PlayerScore> & { id: number }) => {
      const response = await api.put<ApiPlayerScore>(`/scores/${id}`, reverseTransformPlayerScore(data));
      return transformPlayerScore(response);
    },
    onSuccess: (score) => {
      queryClient.invalidateQueries({ queryKey: scoreKeys.player(score.playerId) });
      queryClient.invalidateQueries({ queryKey: scoreKeys.match(score.matchId) });
      queryClient.invalidateQueries({ queryKey: scoreKeys.lists() });
    },
  });
};

// Batch score submission
interface BatchScore {
  playerId: number;
  matchId: number;
  points: number;
}

export const useBatchCreateScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scores: BatchScore[]) => {
      const response = await api.post<ApiPlayerScore[]>('/scores/batch', scores);
      return response.map(transformPlayerScore);
    },
    onSuccess: (scores) => {
      // Invalidate all affected queries
      const playerIds = new Set(scores.map(s => s.playerId));
      const matchIds = new Set(scores.map(s => s.matchId));
      
      playerIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: scoreKeys.player(id) });
      });
      
      matchIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: scoreKeys.match(id) });
      });
      
      queryClient.invalidateQueries({ queryKey: scoreKeys.lists() });
    },
  });
}; 