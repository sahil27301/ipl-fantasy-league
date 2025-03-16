// API Response Types (matching backend schema)
export interface ApiTeam {
  id: number;
  name: string;
  owner_name: string;
  initial_purse: number;
  remaining_purse: number;
  total_players: number;
  total_spent: number;
  players_by_role?: {
    BAT: number;
    BOWL: number;
    AR: number;
    WK: number;
  };
  created_at: string;
  updated_at: string;
  total_points?: number;
  rank?: number;
  rank_change?: number;
}

export interface ApiPlayer {
  id: number;
  name: string;
  ipl_team: string;
  role: string;
  base_price: number;
  sold_price: number | null;
  team_id: number | null;
  created_at: string;
  updated_at: string;
  is_sold: boolean;
  total_points?: number;
}

export interface ApiMatch {
  id: number;
  match_number: number;
  team1: string;
  team2: string;
  match_date: string;
  venue: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiPlayerScore {
  id: number;
  player_id: number;
  match_id: number;
  points: number;
  created_at: string;
  updated_at: string;
}

// Frontend Types (camelCase)
export interface Team {
  id: number;
  name: string;
  ownerName: string;
  initialPurse: number;
  currentPurse: number;
  points: number;
  rank: number;
  change: number;
  createdAt: string;
  updatedAt: string;
  playersByRole?: {
    BAT: number;
    BOWL: number;
    AR: number;
    WK: number;
  };
}

export interface Player {
  id: number;
  name: string;
  iplTeam: string;
  role: string;
  basePrice: number;
  soldPrice: number | null;
  teamId: number | null;
  isSold: boolean;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: number;
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  venue: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerScore {
  id: number;
  playerId: number;
  matchId: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

// Common types
export type Role = 'BAT' | 'BOWL' | 'AR' | 'WK';
export type IplTeam = 'CSK' | 'MI' | 'RCB' | 'KKR' | 'SRH' | 'DC' | 'PBKS' | 'RR' | 'LSG' | 'GT'; 