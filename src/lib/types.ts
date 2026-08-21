// ─── Tournament Status ──────────────────────────────────────────────
export type TournamentStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'CHECK_IN'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED'

export type TournamentFormat =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss'

export type MatchStatus =
  | 'scheduled'
  | 'check_in'
  | 'live'
  | 'finished'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled'

export type CheckInStatus =
  | 'registered'
  | 'paid'
  | 'checked_in'
  | 'no_show'
  | 'disqualified'

export type StreamProvider = 'youtube' | 'twitch' | 'custom'

// ─── Database Models ────────────────────────────────────────────────

export interface Game {
  id: string
  code: string
  name: string
  category: string
  logo_url: string | null
  banner_url: string | null
  created_at: string
}

export interface Tournament {
  id: string
  slug: string
  name: string
  description: string | null
  game_id: string
  banner_url: string | null
  entry_fee_mad: number
  prize_pool_mad: number
  early_bird_fee_mad: number | null
  vip_fee_mad: number | null
  max_players: number
  format: TournamentFormat
  status: TournamentStatus
  location: string
  rules: string | null
  stream_url: string | null
  stream_embed_url: string | null
  stream_title: string | null
  registration_start_at: string | null
  registration_end_at: string | null
  start_at: string
  created_at: string
  updated_at: string
  // Joined relations
  game?: Game
  registrations_count?: number
}

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  email: string
  phone: string | null
  wins: number
  losses: number
  championships: number
  total_prize_money: number
  points: number
  is_disabled: boolean
  created_at: string
  updated_at: string
}

export interface TournamentRegistration {
  id: string
  tournament_id: string
  player_id: string
  registered_at: string
  payment_status: PaymentStatus
  check_in_status: CheckInStatus
  payment_method: string
  amount_paid_mad: number
  seed: number | null
  team_name: string | null
  // Joined relations
  player?: Profile
  tournament?: Tournament
}

export interface TournamentRound {
  id: string
  tournament_id: string
  round_number: number
  name: string
  created_at: string
}

export interface TournamentMatch {
  id: string
  tournament_id: string
  round_id: string | null
  round_number: number
  match_number: number
  player1_id: string | null
  player2_id: string | null
  player1_score: number
  player2_score: number
  winner_id: string | null
  status: MatchStatus
  scheduled_at: string | null
  next_match_id: string | null
  next_match_slot: 1 | 2 | null
  is_bye: boolean
  updated_at: string
  // Joined relations
  player1?: Profile
  player2?: Profile
  winner?: Profile
  round?: TournamentRound
}

export interface Stream {
  id: string
  tournament_id: string | null
  match_id: string | null
  title: string
  provider: StreamProvider
  stream_url: string
  embed_url: string
  is_live: boolean
  created_at: string
}

// ─── Derived UI Types ───────────────────────────────────────────────

/** Simplified tournament state for driving UI scenes */
export type PublicTournamentState =
  | 'NO_EVENT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'LIVE'
  | 'COMPLETED'

export function getPublicState(tournament: Tournament | null): PublicTournamentState {
  if (!tournament) return 'NO_EVENT'
  switch (tournament.status) {
    case 'DRAFT':
    case 'CANCELLED':
      return 'NO_EVENT'
    case 'REGISTRATION_OPEN':
      return 'REGISTRATION_OPEN'
    case 'REGISTRATION_CLOSED':
    case 'CHECK_IN':
      return 'REGISTRATION_CLOSED'
    case 'LIVE':
      return 'LIVE'
    case 'COMPLETED':
      return 'COMPLETED'
    default:
      return 'NO_EVENT'
  }
}

/** Scene identifiers for horizontal navigation */
export type SceneId = 'system' | 'tournament' | 'live' | 'bracket' | 'results' | 'contact'

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'system', label: 'SYSTEM' },
  { id: 'tournament', label: 'TOURNAMENT' },
  { id: 'live', label: 'LIVE' },
  { id: 'bracket', label: 'BRACKET' },
  { id: 'results', label: 'RESULTS' },
  { id: 'contact', label: 'CONNECT' },
]
