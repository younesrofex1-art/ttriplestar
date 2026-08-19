'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Tournament,
  TournamentMatch,
  TournamentRound,
  TournamentRegistration,
  Profile,
  Stream,
  PublicTournamentState,
  getPublicState,
} from '@/lib/types'
import { getPublicState as computePublicState } from '@/lib/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

const supabase = createClient()

// ─── useTournament ──────────────────────────────────────────────────
// Fetches the most relevant active tournament and subscribes to changes

export function useTournament() {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [registrationCount, setRegistrationCount] = useState(0)

  const fetchTournament = useCallback(async () => {
    // Prioritize: LIVE > REGISTRATION_OPEN > REGISTRATION_CLOSED/CHECK_IN > COMPLETED > DRAFT
    const statusPriority = ['LIVE', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'CHECK_IN', 'COMPLETED']

    for (const status of statusPriority) {
      const { data } = await supabase
        .from('tournaments')
        .select('*, game:games(*)')
        .eq('status', status)
        .order('start_at', { ascending: true })
        .limit(1)
        .single()

      if (data) {
        setTournament(data as Tournament)
        // Fetch registration count
        const { count } = await supabase
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

    const channel = supabase
      .channel('tournament-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          fetchTournament()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_registrations' },
        () => {
          // Refetch to update registration count
          if (tournament?.id) {
            supabase
              .from('tournament_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('tournament_id', tournament.id)
              .then(({ count }) => {
                setRegistrationCount(count ?? 0)
              })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTournament])

  const publicState: PublicTournamentState = computePublicState(tournament)

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

    const [matchesRes, roundsRes] = await Promise.all([
      supabase
        .from('tournament_matches')
        .select('*, player1:profiles!tournament_matches_player1_id_fkey(*), player2:profiles!tournament_matches_player2_id_fkey(*), winner:profiles!tournament_matches_winner_id_fkey(*)')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true }),
      supabase
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true }),
    ])

    setMatches((matchesRes.data as TournamentMatch[]) ?? [])
    setRounds((roundsRes.data as TournamentRound[]) ?? [])
    setIsLoading(false)
  }, [tournamentId])

  useEffect(() => {
    fetchMatches()

    if (!tournamentId) return

    const channel = supabase
      .channel(`matches-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchMatches()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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

    const fetchStreams = async () => {
      const { data } = await supabase
        .from('streams')
        .select('*')
        .eq('tournament_id', tournamentId)

      setStreams((data as Stream[]) ?? [])
    }

    fetchStreams()

    const channel = supabase
      .channel(`streams-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchStreams()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId])

  const liveStream = streams.find((s) => s.is_live) ?? null

  return { streams, liveStream }
}

// ─── useRegistration (for submitting) ───────────────────────────────

export function useRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TournamentRegistration | null>(null)

  const register = async (tournamentId: string, name: string, phone: string) => {
    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      // First, check if this phone is already registered
      const { data: existing } = await supabase
        .from('tournament_registrations')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('player_id', phone) // We'll use a different approach
        .limit(1)

      // Create or find a profile for this person (simple public registration)
      // For public registration, we insert directly with name and phone
      // The RPC function handles the logic
      const { data, error: insertError } = await supabase.rpc('public_register', {
        p_tournament_id: tournamentId,
        p_name: name,
        p_phone: phone,
      })

      if (insertError) {
        if (insertError.message.includes('duplicate') || insertError.message.includes('already registered')) {
          setError('This phone number is already registered for this tournament.')
        } else if (insertError.message.includes('not open')) {
          setError('Registration is not currently open for this tournament.')
        } else {
          setError(insertError.message)
        }
        setIsSubmitting(false)
        return null
      }

      setResult(data)
      setIsSubmitting(false)
      return data
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
      return null
    }
  }

  const reset = () => {
    setError(null)
    setResult(null)
    setIsSubmitting(false)
  }

  return { register, isSubmitting, error, result, reset }
}
