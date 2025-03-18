import type {
  ApiMatch,
  ApiPlayer,
  ApiPlayerScore,
  ApiTeam,
  Match,
  Player,
  PlayerScore,
  Team,
} from "./types";

// Helper function to convert snake_case dates to camelCase
const transformDates = (obj: any) => {
  const { created_at, updated_at, ...rest } = obj;
  return {
    ...rest,
    createdAt: created_at,
    updatedAt: updated_at,
  };
};

// Team transformations
export const transformTeam = (team: ApiTeam): Team => ({
  id: team.id,
  name: team.name,
  ownerName: team.owner_name,
  initialPurse: team.initial_purse,
  currentPurse: team.remaining_purse ?? team.initial_purse,
  points: team.total_points || 0,
  rank: team.rank || 0,
  change: team.rank_change || 0,
  playersByRole: team.players_by_role,
  ...transformDates(team),
});

// Player transformations
export const transformPlayer = (player: ApiPlayer): Player => ({
  id: player.id,
  name: player.name,
  iplTeam: player.ipl_team,
  role: player.role,
  basePrice: player.base_price,
  soldPrice: player.sold_price,
  teamId: player.team_id,
  isSold: player.is_sold,
  points: player.total_points || 0,
  ...transformDates(player),
});

// Match transformations
export const transformMatch = (match: ApiMatch): Match => ({
  id: match.id,
  matchNumber: match.match_number,
  team1: match.team1,
  team2: match.team2,
  matchDate: match.match_date,
  venue: match.venue,
  isCompleted: match.is_completed,
  ...transformDates(match),
});

// PlayerScore transformations
export const transformPlayerScore = (score: ApiPlayerScore): PlayerScore => ({
  id: score.id,
  playerId: score.player_id,
  matchId: score.match_id,
  points: score.points,
  ...transformDates(score),
});

// Reverse transformations (frontend to API format)
export const reverseTransformTeam = (team: Partial<Team>) => ({
  name: team.name,
  owner_name: team.ownerName,
  initial_purse: team.initialPurse,
  remaining_purse: team.currentPurse,
});

export const reverseTransformPlayer = (player: Partial<Player>) => ({
  name: player.name,
  ipl_team: player.iplTeam,
  role: player.role,
  base_price: player.basePrice,
  sold_price: player.soldPrice,
  team_id: player.teamId,
});

export const reverseTransformMatch = (match: Partial<Match>) => ({
  match_number: match.matchNumber,
  team1: match.team1,
  team2: match.team2,
  match_date: match.matchDate,
  venue: match.venue,
  is_completed: match.isCompleted,
});

export const reverseTransformPlayerScore = (score: Partial<PlayerScore>) => ({
  player_id: score.playerId,
  match_id: score.matchId,
  points: score.points,
});
