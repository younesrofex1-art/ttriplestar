'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Tournament,
  TournamentMatch,
  TournamentRound,
  Stream,
  PublicTournamentState,
} from '@/lib/types'
import { getPublicState } from '@/lib/types'

// Create client once at module level
let supabase: ReturnType<typeof createClient>
function getSupabase() {
  if (!supabase) supabase = createClient()
  return supabase
}

// ─── useTournament ──────────────────────────────────────────────────

export function useTournament() {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [registrationCount, setRegistrationCount] = useState(0)

  const fetchTournament = useCallback(async () => {
    const sb = getSupabase()
    const statusPriority = ['LIVE', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'CHECK_IN', 'COMPLETED']

    for (const status of statusPriority) {
      const { data, error } = await sb
        .from('tournaments')
        .select('*, game:games(*)')
        .eq('status', status)
        .order('start_at', { ascending: true })
        .limit(1)
        .single()

      if (data && !error) {
        setTournament(data as unknown as Tournament)

        const { count } = await sb
          .from('tournament_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('tournament_id', data.id)

        setRegistrationCount(count ?? 0)
        setIsLoading(false)
        return
      }
    }

    setTournament(null)
    setRegistrationCount(0)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchTournament()

    const sb = getSupabase()
    const channel = sb
      .channel('tournament-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => fetchTournament()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_registrations' },
        () => fetchTournament()
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [fetchTournament])

  const publicState: PublicTournamentState = getPublicState(tournament)

  return { tournament, publicState, registrationCount, isLoading }
}

// ─── useMatches ─────────────────────────────────────────────────────

export function useMatches(tournamentId: string | undefined) {
  const [matches, setMatches] = useState<TournamentMatch[]>([])
  const [rounds, setRounds] = useState<TournamentRound[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMatches = useCallback(async () => {
    if (!tournamentId) {
      setMatches([])
      setRounds([])
      setIsLoading(false)
      return
    }

    const sb = getSupabase()
    const [matchesRes, roundsRes] = await Promise.all([
      sb
        .from('tournament_matches')
        .select('*, player1:profiles!tournament_matches_player1_id_fkey(*), player2:profiles!tournament_matches_player2_id_fkey(*), winner:profiles!tournament_matches_winner_id_fkey(*)')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true }),
      sb
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true }),
    ])

    setMatches((matchesRes.data as unknown as TournamentMatch[]) ?? [])
    setRounds((roundsRes.data as unknown as TournamentRound[]) ?? [])
    setIsLoading(false)
  }, [tournamentId])

  useEffect(() => {
    fetchMatches()

    if (!tournamentId) return

    const sb = getSupabase()
    const channel = sb
      .channel(`matches-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => fetchMatches()
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [tournamentId, fetchMatches])

  const liveMatch = matches.find((m) => m.status === 'live') ?? null

  return { matches, rounds, liveMatch, isLoading }
}

// ─── useStreams ──────────────────────────────────────────────────────

export function useStreams(tournamentId: string | undefined) {
  const [streams, setStreams] = useState<Stream[]>([])

  useEffect(() => {
    if (!tournamentId) {
      setStreams([])
      return
    }

    const sb = getSupabase()

    const fetchStreams = async () => {
      const { data } = await sb
        .from('streams')
        .select('*')
        .eq('tournament_id', tournamentId)

      setStreams((data as unknown as Stream[]) ?? [])
    }

    fetchStreams()

    const channel = sb
      .channel(`streams-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => fetchStreams()
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [tournamentId])

  const liveStream = streams.find((s) => s.is_live) ?? null

  return { streams, liveStream }
}
