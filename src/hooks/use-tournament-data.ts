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

export interface TournamentWithCount extends Tournament {
  registration_count?: number
}

export function useTournament(initialTournamentId?: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [allTournaments, setAllTournaments] = useState<TournamentWithCount[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>(initialTournamentId)
  const [isLoading, setIsLoading] = useState(true)
  const [registrationCount, setRegistrationCount] = useState(0)

  const fetchTournament = useCallback(async () => {
    const sb = getSupabase()

    // Fetch all tournaments
    const { data: allData } = await sb
      .from('tournaments')
      .select('*, game:games(*)')
      .order('created_at', { ascending: false })

    const list: TournamentWithCount[] = (allData as unknown as TournamentWithCount[]) || []

    if (list.length > 0) {
      const countsPromises = list.map(async (t) => {
        const { count } = await sb
          .from('tournament_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('tournament_id', t.id)
        return { id: t.id, count: count ?? 0 }
      })
      const counts = await Promise.all(countsPromises)
      const countMap = new Map(counts.map((c) => [c.id, c.count]))
      list.forEach((t) => {
        t.registration_count = countMap.get(t.id) ?? 0
      })
    }

    setAllTournaments(list)

    // Find active / chosen tournament
    let chosen: TournamentWithCount | null = null

    if (selectedId) {
      chosen = list.find((t) => t.id === selectedId) || null
    }

    if (!chosen && list.length > 0) {
      const statusPriority = ['LIVE', 'REGISTRATION_OPEN', 'CHECK_IN', 'REGISTRATION_CLOSED', 'COMPLETED']
      for (const st of statusPriority) {
        const found = list.find((t) => t.status === st)
        if (found) {
          chosen = found
          break
        }
      }
      if (!chosen) chosen = list[0]
    }

    if (chosen) {
      setTournament(chosen)
      setRegistrationCount(chosen.registration_count ?? 0)
    } else {
      setTournament(null)
      setRegistrationCount(0)
    }

    setIsLoading(false)
  }, [selectedId])

  useEffect(() => {
    fetchTournament()

    const sb = getSupabase()
    const channel = sb
      .channel('tournament-global-changes')
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

  const selectTournament = useCallback((t: Tournament) => {
    setSelectedId(t.id)
    setTournament(t)
  }, [])

  const publicState: PublicTournamentState = getPublicState(tournament)

  return {
    tournament,
    allTournaments,
    publicState,
    registrationCount,
    isLoading,
    selectTournament,
    refresh: fetchTournament,
  }
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
        .select(
          '*, player1:profiles!tournament_matches_player1_id_fkey(*), player2:profiles!tournament_matches_player2_id_fkey(*), winner:profiles!tournament_matches_winner_id_fkey(*)'
        )
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
      .channel(`matches-rounds-${tournamentId}`)
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_rounds',
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

  return { matches, rounds, liveMatch, isLoading, refresh: fetchMatches }
}

// ─── useStreams ──────────────────────────────────────────────────────

export function useStreams(tournamentId: string | undefined, tournamentStreamUrl?: string | null) {
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

  const tableLiveStream = streams.find((s) => s.is_live) ?? streams[0] ?? null

  const liveStream: Stream | null = tableLiveStream
    ? tableLiveStream
    : tournamentStreamUrl
    ? ({
        id: 'tournament-stream',
        tournament_id: tournamentId || '',
        stream_url: tournamentStreamUrl,
        is_live: true,
        title: 'Live Broadcast',
      } as unknown as Stream)
    : null

  return { streams, liveStream }
}

