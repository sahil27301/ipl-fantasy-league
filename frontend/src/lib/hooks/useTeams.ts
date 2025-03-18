import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import {
  reverseTransformTeam,
  transformPlayer,
  transformTeam,
} from "../api/transforms";
import type { ApiPlayer, ApiTeam, Team } from "../api/types";

// Query key factory
export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...teamKeys.lists(), { filters }] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: number) => [...teamKeys.details(), id] as const,
  players: (id: number) => [...teamKeys.detail(id), "players"] as const,
};

// Hooks
export const useTeams = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: teamKeys.list(filters ?? {}),
    queryFn: async () => {
      const response = await api.get<ApiTeam[]>("/teams");
      return response.map(transformTeam);
    },
  });
};

export const useTeam = (id: number) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiTeam>(`/teams/${id}`);
      return transformTeam(response);
    },
    enabled: !!id, // Only run query if id is provided
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTeam: Partial<Team>) => {
      const response = await api.post<ApiTeam>(
        "/teams",
        reverseTransformTeam(newTeam)
      );
      return transformTeam(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Team> & { id: number }) => {
      const response = await api.put<ApiTeam>(
        `/teams/${id}`,
        reverseTransformTeam(data)
      );
      return transformTeam(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/teams/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

// Fetch players for a specific team
export const useTeamPlayers = (teamId: number) => {
  return useQuery({
    queryKey: teamKeys.players(teamId),
    queryFn: async () => {
      try {
        const response = await api.get<ApiPlayer[]>(`/teams/${teamId}/players`);
        return response.map(transformPlayer);
      } catch (error) {
        console.error("Error fetching team players:", error);
        return [];
      }
    },
    enabled: !!teamId, // Only run query if teamId is provided
  });
};
