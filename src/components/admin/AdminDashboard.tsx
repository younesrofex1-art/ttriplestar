'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLogin from './AdminLogin'
import type {
  Tournament,
  TournamentRegistration,
  TournamentMatch,
  TournamentRound,
  Game,
  Profile,
  TournamentStatus,
} from '@/lib/types'
import { generateTournamentBracket, advanceMatchWinner } from '@/lib/bracket-utils'

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), [])

  // Auth State
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [authChecking, setAuthChecking] = useState(true)

  // Check auth session
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        setCurrentUser({ id: data.session.user.id, email: data.session.user.email })
      } else {
        setCurrentUser(null)
      }
    } catch {
      setCurrentUser(null)
    } finally {
      setAuthChecking(false)
    }
  }, [supabase])

  useEffect(() => {
    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({ id: session.user.id, email: session.user.email })
      } else {
        setCurrentUser(null)
      }
      setAuthChecking(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [checkAuth, supabase])

  // State
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('')
  const [games, setGames] = useState<Game[]>([])
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([])
  const [matches, setMatches] = useState<TournamentMatch[]>([])
  const [rounds, setRounds] = useState<TournamentRound[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeTab, setActiveTab] = useState<'players' | 'setup' | 'bracket' | 'stream'>('players')

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Manual Player Add Form
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerPhone, setNewPlayerPhone] = useState('')
  const [newPlayerPayment, setNewPlayerPayment] = useState<'pending' | 'paid'>('paid')

  // New Tournament Form
  const [newTourneyName, setNewTourneyName] = useState('Triple Stars FC 26 Championship')
  const [newTourneyGameId, setNewTourneyGameId] = useState('')
  const [newTourneyMaxPlayers, setNewTourneyMaxPlayers] = useState(20)
  const [newTourneyFee, setNewTourneyFee] = useState(100)
  const [newTourneyPrize, setNewTourneyPrize] = useState(2000)

  // Live Stream Form
  const [streamUrl, setStreamUrl] = useState('')
  const [streamTitle, setStreamTitle] = useState('')
  const [isStreamLive, setIsStreamLive] = useState(false)

  // Selected tournament object
  const currentTournament = useMemo(
    () => tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0] || null,
    [tournaments, selectedTournamentId]
  )

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true)

    const [tRes, gRes, pRes] = await Promise.all([
      supabase.from('tournaments').select('*, game:games(*)').order('created_at', { ascending: false }),
      supabase.from('games').select('*').order('name'),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ])

    const tourneys = (tRes.data as unknown as Tournament[]) || []
    setTournaments(tourneys)
    setGames((gRes.data as unknown as Game[]) || [])
    setProfiles((pRes.data as unknown as Profile[]) || [])

    if (tourneys.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(tourneys[0].id)
    }

    setIsLoading(false)
  }, [supabase, selectedTournamentId])

  // Fetch registrations and matches for the selected tournament
  const fetchTournamentDetails = useCallback(async () => {
    if (!currentTournament) return

    const [rRes, mRes, roRes] = await Promise.all([
      supabase
        .from('tournament_registrations')
        .select('*, player:profiles!tournament_registrations_player_id_fkey(*), tournament:tournaments!tournament_registrations_tournament_id_fkey(*)')
        .eq('tournament_id', currentTournament.id)
        .order('registered_at', { ascending: true }),
      supabase
        .from('tournament_matches')
        .select('*, player1:profiles!tournament_matches_player1_id_fkey(*), player2:profiles!tournament_matches_player2_id_fkey(*), winner:profiles!tournament_matches_winner_id_fkey(*)')
        .eq('tournament_id', currentTournament.id)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true }),
      supabase
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', currentTournament.id)
        .order('round_number', { ascending: true }),
    ])

    setRegistrations((rRes.data as unknown as TournamentRegistration[]) || [])
    setMatches((mRes.data as unknown as TournamentMatch[]) || [])
    setRounds((roRes.data as unknown as TournamentRound[]) || [])
    setStreamUrl(currentTournament.stream_url || '')
    setStreamTitle(currentTournament.stream_title || '')
  }, [supabase, currentTournament])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchTournamentDetails()

    if (!currentTournament) return

    // Realtime subscription to registrations and matches
    const channel = supabase
      .channel(`admin-${currentTournament.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_registrations' }, () =>
        fetchTournamentDetails()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_matches' }, () =>
        fetchTournamentDetails()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () =>
        fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentTournament, fetchTournamentDetails, fetchData, supabase])

  const showNotification = (msg: string) => {
    setActionMessage(msg)
    setTimeout(() => setActionMessage(null), 4000)
  }

  // ─── Actions: Tournament Status ────────────────────────────────────
  const handleUpdateStatus = async (status: TournamentStatus) => {
    if (!currentTournament) return
    setIsProcessing(true)
    const { error } = await supabase
      .from('tournaments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', currentTournament.id)

    setIsProcessing(false)
    if (error) {
      showNotification(`Error: ${error.message}`)
    } else {
      showNotification(`Tournament status updated to ${status}`)
      fetchData()
    }
  }

  // ─── Actions: Manual Player Add ────────────────────────────────────
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTournament) return
    if (!newPlayerName.trim() || !newPlayerPhone.trim()) {
      showNotification('Please provide both Player Name and Phone Number.')
      return
    }

    setIsProcessing(true)
    try {
      const { data, error } = await supabase.rpc('public_register', {
        p_tournament_id: currentTournament.id,
        p_name: newPlayerName.trim(),
        p_phone: newPlayerPhone.trim(),
      })

      if (error) {
        showNotification(`Error: ${error.message}`)
      } else {
        // If payment status is marked paid, update registration
        if (newPlayerPayment === 'paid' && data?.registration_id) {
          await supabase
            .from('tournament_registrations')
            .update({ payment_status: 'paid', amount_paid_mad: currentTournament.entry_fee_mad })
            .eq('id', data.registration_id)
        }

        showNotification(`Player ${newPlayerName} registered successfully!`)
        setNewPlayerName('')
        setNewPlayerPhone('')
        fetchTournamentDetails()
      }
    } catch {
      showNotification('Unexpected error registering player.')
    } finally {
      setIsProcessing(false)
    }
  }

  // ─── Actions: Toggle Payment & Check-in ─────────────────────────────
  const handleTogglePayment = async (regId: string, current: string) => {
    const next = current === 'paid' ? 'pending' : 'paid'
    const amount = next === 'paid' ? currentTournament?.entry_fee_mad || 0 : 0
    await supabase
      .from('tournament_registrations')
      .update({ payment_status: next, amount_paid_mad: amount })
      .eq('id', regId)
    fetchTournamentDetails()
    showNotification(`Payment status changed to ${next.toUpperCase()}`)
  }

  const handleToggleCheckIn = async (regId: string, current: string) => {
    const next = current === 'checked_in' ? 'registered' : 'checked_in'
    await supabase
      .from('tournament_registrations')
      .update({ check_in_status: next })
      .eq('id', regId)
    fetchTournamentDetails()
    showNotification(`Check-in status changed to ${next.toUpperCase()}`)
  }

  const handleDeleteRegistration = async (regId: string, playerName: string) => {
    if (!confirm(`Are you sure you want to remove ${playerName}?`)) return
    await supabase.from('tournament_registrations').delete().eq('id', regId)
    fetchTournamentDetails()
    showNotification(`Removed ${playerName} from tournament.`)
  }

  // ─── Actions: Create Tournament ────────────────────────────────────
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    const gameId = newTourneyGameId || games[0]?.id

    if (!gameId) {
      showNotification('Please select or create a game first.')
      setIsProcessing(false)
      return
    }

    const slug = `${newTourneyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name: newTourneyName,
        slug,
        game_id: gameId,
        max_players: Number(newTourneyMaxPlayers) || 20,
        entry_fee_mad: Number(newTourneyFee) || 0,
        prize_pool_mad: Number(newTourneyPrize) || 0,
        format: 'single_elimination',
        status: 'REGISTRATION_OPEN',
        start_at: new Date(Date.now() + 86400000).toISOString(),
        location: 'Triple Stars Gaming Arena',
      })
      .select()
      .single()

    setIsProcessing(false)
    if (error) {
      showNotification(`Error: ${error.message}`)
    } else if (data) {
      showNotification(`Tournament "${newTourneyName}" created with ${newTourneyMaxPlayers} players!`)
      setSelectedTournamentId(data.id)
      fetchData()
    }
  }

  // ─── Actions: Delete Tournament ────────────────────────────────────
  const handleDeleteTournament = async (tourneyId: string, tourneyName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete tournament "${tourneyName}"? This will permanently remove all registrations, rounds, and matches for this tournament.`
      )
    )
      return

    setIsProcessing(true)
    try {
      await supabase.from('tournament_matches').delete().eq('tournament_id', tourneyId)
      await supabase.from('tournament_rounds').delete().eq('tournament_id', tourneyId)
      await supabase.from('tournament_registrations').delete().eq('tournament_id', tourneyId)
      await supabase.from('streams').delete().eq('tournament_id', tourneyId)
      const { error } = await supabase.from('tournaments').delete().eq('id', tourneyId)

      if (error) {
        showNotification(`Error deleting tournament: ${error.message}`)
      } else {
        showNotification(`Tournament "${tourneyName}" deleted.`)
        setSelectedTournamentId('')
        fetchData()
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // ─── Actions: Generate 20-Player Bracket ───────────────────────────
  const handleGenerateBracket = async () => {
    if (!currentTournament) return

    // Extract players from checked-in or all registrations
    const registeredPlayers: Profile[] = registrations
      .map((r) => r.player)
      .filter((p): p is Profile => p !== undefined)

    if (registeredPlayers.length < 2) {
      showNotification('Need at least 2 registered players to build a tournament bracket.')
      return
    }

    if (!confirm(`Generate single elimination bracket for ${registeredPlayers.length} players?`)) return

    setIsProcessing(true)
    try {
      const result = await generateTournamentBracket({
        tournamentId: currentTournament.id,
        players: registeredPlayers,
      })

      showNotification(`Generated ${result.matchCount} bracket matches across ${result.totalRounds} rounds!`)
      setActiveTab('bracket')
      fetchTournamentDetails()
    } catch (err: any) {
      showNotification(`Failed to generate bracket: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // ─── Actions: Match Score & Advance Winner ──────────────────────────
  const handleScoreChange = async (matchId: string, playerNum: 1 | 2, delta: number) => {
    const match = matches.find((m) => m.id === matchId)
    if (!match) return

    const currentScore = playerNum === 1 ? match.player1_score ?? 0 : match.player2_score ?? 0
    const newScore = Math.max(0, currentScore + delta)

    const payload = playerNum === 1 ? { player1_score: newScore } : { player2_score: newScore }

    await supabase.from('tournament_matches').update(payload).eq('id', matchId)
    fetchTournamentDetails()
  }

  const handleDeclareWinner = async (match: TournamentMatch, winnerId: string) => {
    if (!winnerId) return
    setIsProcessing(true)
    try {
      await advanceMatchWinner(
        match.id,
        winnerId,
        match.player1_score ?? 0,
        match.player2_score ?? 0
      )
      showNotification('Winner declared and advanced to the next bracket round!')
      fetchTournamentDetails()
    } catch (err: any) {
      showNotification(`Error: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSetFeaturedMatch = async (match: TournamentMatch) => {
    // Set all other matches to scheduled/finished, set this to live
    await supabase.from('tournament_matches').update({ status: 'scheduled' }).eq('tournament_id', match.tournament_id).eq('status', 'live')
    await supabase.from('tournament_matches').update({ status: 'live' }).eq('id', match.id)
    fetchTournamentDetails()
    showNotification(`Match #${match.match_number} set as LIVE featured broadcast!`)
  }

  // ─── Filtered Registrations ─────────────────────────────────────────
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations
    const q = searchQuery.toLowerCase()
    return registrations.filter(
      (r) =>
        r.player?.display_name?.toLowerCase().includes(q) ||
        r.player?.phone?.toLowerCase().includes(q) ||
        r.player?.username?.toLowerCase().includes(q)
    )
  }, [registrations, searchQuery])

  // Group matches by round for bracket view
  const matchesByRound = useMemo(() => {
    const grouped = new Map<number, TournamentMatch[]>()
    matches.forEach((m) => {
      const r = m.round_number || 1
      if (!grouped.has(r)) grouped.set(r, [])
      grouped.get(r)!.push(m)
    })
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b)
  }, [matches])

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col items-center justify-center font-mono select-none">
        <div className="w-10 h-10 border-2 border-[#ff6600] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs tracking-widest text-[#ff6600] uppercase">
          VERIFYING SECURITY CREDENTIALS...
        </span>
      </div>
    )
  }

  if (!currentUser) {
    return <AdminLogin onSuccess={checkAuth} />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      {/* Top Cyber Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border-strong bg-[#0f0f11]/90 backdrop-blur-lg px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="/" className="group flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-widest text-[#ff6600]">
                TRIPLE STARS
              </span>
              <span className="font-mono text-[10px] uppercase bg-[#ff6600]/10 border border-[#ff6600]/40 text-[#ff6600] px-2 py-0.5 rounded tracking-wider">
                ADMIN CONSOLE
              </span>
            </a>

            <div className="hidden md:flex items-center gap-2 border-l border-border-strong pl-4 text-xs font-mono text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-[#ff6600] animate-pulse" />
              <span>CASABLANCA SERVER CONNECTED</span>
            </div>
          </div>

          {/* Tournament Selector & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {tournaments.length > 0 && (
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="bg-[#161616] border border-border-strong text-text-primary text-xs font-mono px-3 py-2 rounded focus:border-[#ff6600] focus:outline-none"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status})
                  </option>
                ))}
              </select>
            )}

            {currentTournament && (
              <div className="flex items-center gap-1.5 bg-[#161616] border border-border px-2 py-1 rounded">
                <span className="text-[10px] font-mono text-text-secondary">STATUS:</span>
                {(['REGISTRATION_OPEN', 'CHECK_IN', 'LIVE', 'COMPLETED'] as TournamentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                      currentTournament.status === st
                        ? 'bg-[#ff6600] text-black font-bold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {st === 'REGISTRATION_OPEN'
                      ? 'REG OPEN'
                      : st === 'CHECK_IN'
                      ? 'CHECK-IN'
                      : st}
                  </button>
                ))}
              </div>
            )}

            <a
              href="/"
              className="text-xs font-mono border border-border hover:border-[#ff6600] text-text-secondary hover:text-[#ff6600] px-3 py-2 rounded transition-colors"
            >
              ← VIEW SITE
            </a>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-border-strong">
                <span className="hidden xl:inline-block text-[10px] font-mono text-text-secondary truncate max-w-[150px]">
                  {currentUser.email}
                </span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    setCurrentUser(null)
                  }}
                  className="text-xs font-mono bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-3 py-2 rounded transition-colors"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Action Notification Banner */}
        {actionMessage && (
          <div className="max-w-7xl mx-auto mt-3 bg-[#ff6600]/15 border border-[#ff6600]/40 text-[#ff6600] px-4 py-2 text-xs font-mono flex items-center justify-between rounded">
            <span>⚡ {actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-text-muted hover:text-white">
              ✕
            </button>
          </div>
        )}
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-[#121214] px-6">
        <div className="max-w-7xl mx-auto flex gap-2">
          {[
            { id: 'players', label: `📋 PLAYERS & ROSTER (${registrations.length})` },
            { id: 'setup', label: '🎮 20-PLAYER TOURNAMENT SETUP' },
            { id: 'bracket', label: `⚔️ LIVE BRACKET & MATCHES (${matches.length})` },
            { id: 'stream', label: '📡 STREAM BROADCAST' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-mono text-xs tracking-wider py-3.5 px-4 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#ff6600] text-[#ff6600] font-bold bg-[#ff6600]/5'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {/* ════════════════ TAB 1: PLAYERS & ROSTER ════════════════ */}
        {activeTab === 'players' && (
          <div className="space-y-8">
            {/* Quick Stats & Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#141416] border border-border p-4 rounded">
                <div className="text-[10px] font-mono text-text-secondary uppercase">TOTAL REGISTERED</div>
                <div className="text-3xl font-mono font-bold text-[#ff6600] mt-1">
                  {registrations.length} <span className="text-xs text-text-muted">/ {currentTournament?.max_players || 20} SLOTS</span>
                </div>
              </div>

              <div className="bg-[#141416] border border-border p-4 rounded">
                <div className="text-[10px] font-mono text-text-secondary uppercase">PAID PLAYERS</div>
                <div className="text-3xl font-mono font-bold text-[#ffaa00] mt-1">
                  {registrations.filter((r) => r.payment_status === 'paid').length}
                </div>
              </div>

              <div className="bg-[#141416] border border-border p-4 rounded">
                <div className="text-[10px] font-mono text-text-secondary uppercase">CHECKED IN</div>
                <div className="text-3xl font-mono font-bold text-green-400 mt-1">
                  {registrations.filter((r) => r.check_in_status === 'checked_in').length}
                </div>
              </div>

              <div className="bg-[#141416] border border-border p-4 rounded flex flex-col justify-center">
                <button
                  onClick={handleGenerateBracket}
                  disabled={registrations.length < 2 || isProcessing}
                  className="w-full bg-[#ff6600] hover:bg-[#ff7700] text-black font-mono text-xs font-bold py-3 px-4 rounded tracking-wider uppercase transition-colors disabled:opacity-40"
                >
                  ⚡ GENERATE BRACKET ({registrations.length}P)
                </button>
              </div>
            </div>

            {/* Quick Add Player Card */}
            <div className="bg-[#141416] border border-border p-6 rounded space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold tracking-wider uppercase text-text-primary">
                  ⚡ QUICK ADD WALK-IN PLAYER
                </h3>
                <span className="font-mono text-[10px] text-text-muted">
                  REGISTER DIRECTLY INTO {currentTournament?.name?.toUpperCase()}
                </span>
              </div>

              <form onSubmit={handleAddPlayer} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-text-secondary mb-1">PLAYER NAME</label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="e.g. Yassine Gamer"
                    required
                    className="w-full bg-[#1b1b1f] border border-border-strong text-text-primary text-xs font-mono px-3 py-2 rounded focus:border-[#ff6600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-text-secondary mb-1">PHONE NUMBER</label>
                  <input
                    type="tel"
                    value={newPlayerPhone}
                    onChange={(e) => setNewPlayerPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    required
                    className="w-full bg-[#1b1b1f] border border-border-strong text-text-primary text-xs font-mono px-3 py-2 rounded focus:border-[#ff6600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-text-secondary mb-1">PAYMENT STATUS</label>
                  <select
                    value={newPlayerPayment}
                    onChange={(e) => setNewPlayerPayment(e.target.value as any)}
                    className="w-full bg-[#1b1b1f] border border-border-strong text-text-primary text-xs font-mono px-3 py-2 rounded focus:border-[#ff6600] focus:outline-none"
                  >
                    <option value="paid">PAID (CASH)</option>
                    <option value="pending">PENDING</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#ff6600]/20 hover:bg-[#ff6600] border border-[#ff6600] text-[#ff6600] hover:text-black font-mono text-xs font-bold py-2 px-4 rounded tracking-wider uppercase transition-colors"
                  >
                    + ADD PLAYER
                  </button>
                </div>
              </form>
            </div>

            {/* Players Table with Phone Numbers & Actions */}
            <div className="bg-[#141416] border border-border rounded overflow-hidden">
              <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
                <h3 className="font-mono text-xs tracking-wider uppercase font-bold text-text-primary">
                  CONFIRMED TOURNAMENT ROSTER
                </h3>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full bg-[#1b1b1f] border border-border text-xs font-mono px-3 py-1.5 rounded placeholder:text-text-muted focus:border-[#ff6600] focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#18181c] text-text-secondary border-b border-border">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">PLAYER NAME</th>
                      <th className="py-3 px-4">PHONE NUMBER</th>
                      <th className="py-3 px-4">REGISTERED AT</th>
                      <th className="py-3 px-4">PAYMENT</th>
                      <th className="py-3 px-4">CHECK-IN</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-text-muted">
                          No players found. Use the quick registration form above to add players.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((reg, idx) => {
                        const player = reg.player
                        const phone = player?.phone || 'No phone'
                        const isPaid = reg.payment_status === 'paid'
                        const isCheckedIn = reg.check_in_status === 'checked_in'
                        const cleanPhone = phone.replace(/[^0-9]/g, '')

                        return (
                          <tr key={reg.id} className="hover:bg-[#1b1b1f] transition-colors">
                            <td className="py-3 px-4 text-text-muted">#{idx + 1}</td>
                            <td className="py-3 px-4 font-sans font-semibold text-text-primary">
                              {player?.display_name || 'Anonymous'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#ff6600]">{phone}</span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone.startsWith('0') ? '212' + cleanPhone.slice(1) : cleanPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] bg-green-950 text-green-400 border border-green-800 px-1.5 py-0.5 rounded hover:bg-green-900"
                                    title="Chat on WhatsApp"
                                  >
                                    WA
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-muted text-[11px]">
                              {new Date(reg.registered_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleTogglePayment(reg.id, reg.payment_status)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                  isPaid
                                    ? 'bg-green-950 text-green-400 border-green-800 hover:bg-green-900'
                                    : 'bg-amber-950 text-amber-400 border-amber-800 hover:bg-amber-900'
                                }`}
                              >
                                {isPaid ? '✓ PAID' : '⏳ PENDING'}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleCheckIn(reg.id, reg.check_in_status)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                  isCheckedIn
                                    ? 'bg-blue-950 text-blue-400 border-blue-800 hover:bg-blue-900'
                                    : 'bg-[#1e1e24] text-text-muted border-border hover:text-white'
                                }`}
                              >
                                {isCheckedIn ? '✓ CHECKED IN' : 'WAITING'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteRegistration(reg.id, player?.display_name || 'Player')}
                                className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-900 hover:border-red-700 transition-colors"
                              >
                                REMOVE
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ TAB 2: TOURNAMENT SETUP ════════════════ */}
        {activeTab === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create New Tournament Form */}
            <div className="bg-[#141416] border border-border p-6 rounded space-y-6">
              <div>
                <span className="text-[10px] font-mono text-[#ff6600] uppercase tracking-widest font-bold">
                  CREATE & CONFIGURE
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-text-primary mt-1">
                  NEW ESPORTS TOURNAMENT
                </h3>
              </div>

              <form onSubmit={handleCreateTournament} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-text-secondary mb-1">TOURNAMENT TITLE</label>
                  <input
                    type="text"
                    value={newTourneyName}
                    onChange={(e) => setNewTourneyName(e.target.value)}
                    required
                    className="w-full bg-[#1b1b1f] border border-border text-text-primary px-3 py-2.5 rounded focus:border-[#ff6600] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-text-secondary mb-1">SELECT GAME</label>
                    <select
                      value={newTourneyGameId}
                      onChange={(e) => setNewTourneyGameId(e.target.value)}
                      className="w-full bg-[#1b1b1f] border border-border text-text-primary px-3 py-2.5 rounded focus:border-[#ff6600] focus:outline-none"
                    >
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">PLAYER CAPACITY</label>
                    <select
                      value={newTourneyMaxPlayers}
                      onChange={(e) => setNewTourneyMaxPlayers(Number(e.target.value))}
                      className="w-full bg-[#1b1b1f] border border-border text-text-primary px-3 py-2.5 rounded focus:border-[#ff6600] focus:outline-none"
                    >
                      <option value={20}>20 PLAYERS (Recommended)</option>
                      <option value={16}>16 PLAYERS</option>
                      <option value={32}>32 PLAYERS</option>
                      <option value={8}>8 PLAYERS</option>
                      <option value={64}>64 PLAYERS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-text-secondary mb-1">ENTRY FEE (MAD)</label>
                    <input
                      type="number"
                      value={newTourneyFee}
                      onChange={(e) => setNewTourneyFee(Number(e.target.value))}
                      className="w-full bg-[#1b1b1f] border border-border text-text-primary px-3 py-2.5 rounded focus:border-[#ff6600] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">PRIZE POOL (MAD)</label>
                    <input
                      type="number"
                      value={newTourneyPrize}
                      onChange={(e) => setNewTourneyPrize(Number(e.target.value))}
                      className="w-full bg-[#1b1b1f] border border-border text-text-primary px-3 py-2.5 rounded focus:border-[#ff6600] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#ff6600] hover:bg-[#ff7700] text-black font-bold py-3.5 px-4 rounded tracking-wider uppercase transition-colors mt-4"
                >
                  🚀 CREATE TOURNAMENT
                </button>
              </form>
            </div>

            {/* 20-Player Bracket Setup Guide */}
            <div className="bg-[#141416] border border-border p-6 rounded space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#ff6600] uppercase tracking-widest font-bold">
                    BRACKET BLUEPRINT
                  </span>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-text-primary mt-1">
                    20-PLAYER ELIMINATION STRUCTURE
                  </h3>
                </div>

                <p className="font-sans text-xs text-text-secondary leading-relaxed">
                  The tournament platform uses an automated single elimination bracket engine tailored for 20 players:
                </p>

                <div className="space-y-2 font-mono text-xs text-text-primary">
                  <div className="p-2.5 bg-[#1b1b1f] border border-border rounded flex items-center justify-between">
                    <span>ROUND 1 (OPENING ROUND)</span>
                    <span className="text-[#ff6600]">4 MATCHES (Seeds 13-20)</span>
                  </div>
                  <div className="p-2.5 bg-[#1b1b1f] border border-border rounded flex items-center justify-between">
                    <span>ROUND 2 (ROUND OF 16)</span>
                    <span className="text-[#ffaa00]">8 MATCHES (12 Byes + 4 R1 Winners)</span>
                  </div>
                  <div className="p-2.5 bg-[#1b1b1f] border border-border rounded flex items-center justify-between">
                    <span>ROUND 3 (QUARTERFINALS)</span>
                    <span className="text-text-secondary">4 MATCHES</span>
                  </div>
                  <div className="p-2.5 bg-[#1b1b1f] border border-border rounded flex items-center justify-between">
                    <span>ROUND 4 (SEMIFINALS)</span>
                    <span className="text-text-secondary">2 MATCHES</span>
                  </div>
                  <div className="p-2.5 bg-[#1b1b1f] border border-border rounded flex items-center justify-between">
                    <span>ROUND 5 (GRAND FINAL)</span>
                    <span className="text-[#ff6600] font-bold">1 MATCH (CHAMPIONSHIP)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={handleGenerateBracket}
                  disabled={registrations.length < 2 || isProcessing}
                  className="w-full bg-[#ff6600]/20 hover:bg-[#ff6600] border border-[#ff6600] text-[#ff6600] hover:text-black font-mono text-xs font-bold py-3 px-4 rounded tracking-wider uppercase transition-colors"
                >
                  ⚡ GENERATE & POPULATE BRACKET FOR {currentTournament?.name}
                </button>
              </div>
            </div>

            {/* Existing Tournaments List */}
            <div className="lg:col-span-2 bg-[#141416] border border-border p-6 rounded space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#ff6600] uppercase tracking-widest font-bold">
                    DATABASE REGISTRY
                  </span>
                  <h3 className="font-display text-xl font-bold tracking-tight text-text-primary mt-1">
                    ALL TOURNAMENTS ({tournaments.length})
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      <th className="pb-3 px-3">NAME</th>
                      <th className="pb-3 px-3">STATUS</th>
                      <th className="pb-3 px-3">GAME</th>
                      <th className="pb-3 px-3">CAPACITY</th>
                      <th className="pb-3 px-3">CREATED</th>
                      <th className="pb-3 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {tournaments.map((t) => (
                      <tr
                        key={t.id}
                        className={`hover:bg-[#1b1b1f] transition-colors ${
                          t.id === selectedTournamentId ? 'bg-[#ff6600]/10 border-l-2 border-[#ff6600]' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-text-primary">
                          {t.name}
                          {t.id === selectedTournamentId && (
                            <span className="ml-2 text-[10px] bg-[#ff6600] text-black px-1.5 py-0.5 rounded font-bold">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              t.status === 'LIVE'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : t.status === 'REGISTRATION_OPEN'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-text-secondary">{t.game?.name || 'FC 26'}</td>
                        <td className="py-3 px-3 text-text-secondary">{t.max_players} PLAYERS</td>
                        <td className="py-3 px-3 text-text-muted">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => setSelectedTournamentId(t.id)}
                            className="bg-[#1b1b1f] hover:bg-[#ff6600] text-text-primary hover:text-black px-3 py-1 rounded transition-colors text-[11px]"
                          >
                            SELECT
                          </button>
                          <button
                            onClick={() => handleDeleteTournament(t.id, t.name)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2.5 py-1 rounded transition-colors text-[11px]"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ TAB 3: LIVE BRACKET & MATCHES ════════════════ */}
        {activeTab === 'bracket' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141416] border border-border p-4 rounded">
              <div>
                <span className="text-[10px] font-mono text-[#ff6600] uppercase font-bold tracking-widest">
                  INTERACTIVE MATCH CONTROLLER
                </span>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  {currentTournament?.name} ({matches.length} MATCHES)
                </h3>
              </div>

              <button
                onClick={handleGenerateBracket}
                disabled={isProcessing}
                className="bg-[#1e1e24] hover:bg-[#ff6600] text-text-primary hover:text-black font-mono text-xs px-4 py-2 rounded border border-border transition-colors"
              >
                🔄 RE-GENERATE BRACKET
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="bg-[#141416] border border-border p-12 text-center rounded space-y-4">
                <div className="font-mono text-text-muted text-sm">No matches created for this tournament yet.</div>
                <button
                  onClick={handleGenerateBracket}
                  className="bg-[#ff6600] text-black font-mono text-xs font-bold px-6 py-3 rounded uppercase tracking-wider hover:bg-[#ff7700] transition-colors"
                >
                  GENERATE TOURNAMENT BRACKET NOW
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {matchesByRound.map(([roundNum, roundMatches]) => {
                  const roundInfo = rounds.find((r) => r.round_number === roundNum)
                  const roundName = roundInfo?.name || `ROUND ${roundNum}`

                  return (
                    <div key={roundNum} className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-border pb-2">
                        <span className="w-2 h-2 rounded-full bg-[#ff6600]" />
                        <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-text-primary">
                          {roundName}
                        </h4>
                        <span className="font-mono text-[10px] text-text-muted">({roundMatches.length} matches)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roundMatches.map((match) => {
                          const p1 = match.player1
                          const p2 = match.player2
                          const p1Wins = match.winner_id === match.player1_id && match.player1_id != null
                          const p2Wins = match.winner_id === match.player2_id && match.player2_id != null
                          const isLive = match.status === 'live'
                          const isFinished = match.status === 'finished'

                          return (
                            <div
                              key={match.id}
                              className={`bg-[#141416] border ${
                                isLive
                                  ? 'border-red-500 shadow-[0_0_15px_rgba(255,51,51,0.25)]'
                                  : isFinished
                                  ? 'border-border/60'
                                  : 'border-border'
                              } rounded p-4 space-y-4 relative`}
                            >
                              {/* Match Header */}
                              <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary">
                                <span>MATCH #{match.match_number}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                    isLive
                                      ? 'bg-red-950 text-red-400 animate-pulse'
                                      : isFinished
                                      ? 'bg-green-950 text-green-400'
                                      : 'bg-[#222] text-text-muted'
                                  }`}
                                >
                                  {match.status}
                                </span>
                              </div>

                              {/* Player 1 Row */}
                              <div
                                className={`p-2.5 rounded border flex items-center justify-between ${
                                  p1Wins
                                    ? 'bg-[#ff6600]/15 border-[#ff6600]/60'
                                    : 'bg-[#1b1b1f] border-border-strong'
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <div className={`font-sans text-xs font-bold ${p1Wins ? 'text-[#ff6600]' : 'text-text-primary'}`}>
                                    {p1?.display_name || 'TBD (Waiting)'}
                                  </div>
                                  {p1?.phone && <div className="font-mono text-[10px] text-text-muted">{p1.phone}</div>}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleScoreChange(match.id, 1, -1)}
                                    className="w-5 h-5 bg-[#222] hover:bg-[#333] text-xs font-mono rounded flex items-center justify-center text-text-muted hover:text-white"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-sm font-bold w-6 text-center text-text-primary">
                                    {match.player1_score ?? 0}
                                  </span>
                                  <button
                                    onClick={() => handleScoreChange(match.id, 1, 1)}
                                    className="w-5 h-5 bg-[#222] hover:bg-[#333] text-xs font-mono rounded flex items-center justify-center text-text-muted hover:text-white"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Player 2 Row */}
                              <div
                                className={`p-2.5 rounded border flex items-center justify-between ${
                                  p2Wins
                                    ? 'bg-[#ff6600]/15 border-[#ff6600]/60'
                                    : 'bg-[#1b1b1f] border-border-strong'
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <div className={`font-sans text-xs font-bold ${p2Wins ? 'text-[#ff6600]' : 'text-text-primary'}`}>
                                    {p2?.display_name || 'TBD (Waiting)'}
                                  </div>
                                  {p2?.phone && <div className="font-mono text-[10px] text-text-muted">{p2.phone}</div>}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleScoreChange(match.id, 2, -1)}
                                    className="w-5 h-5 bg-[#222] hover:bg-[#333] text-xs font-mono rounded flex items-center justify-center text-text-muted hover:text-white"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-sm font-bold w-6 text-center text-text-primary">
                                    {match.player2_score ?? 0}
                                  </span>
                                  <button
                                    onClick={() => handleScoreChange(match.id, 2, 1)}
                                    className="w-5 h-5 bg-[#222] hover:bg-[#333] text-xs font-mono rounded flex items-center justify-center text-text-muted hover:text-white"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Match Action Buttons */}
                              <div className="pt-2 flex flex-col gap-2 font-mono text-[10px]">
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => p1 && handleDeclareWinner(match, p1.id)}
                                    disabled={!p1 || isProcessing}
                                    className="bg-green-950 hover:bg-green-900 border border-green-800 text-green-300 py-1.5 px-2 rounded font-bold transition-colors disabled:opacity-40"
                                  >
                                    👑 P1 WINS
                                  </button>

                                  <button
                                    onClick={() => p2 && handleDeclareWinner(match, p2.id)}
                                    disabled={!p2 || isProcessing}
                                    className="bg-green-950 hover:bg-green-900 border border-green-800 text-green-300 py-1.5 px-2 rounded font-bold transition-colors disabled:opacity-40"
                                  >
                                    👑 P2 WINS
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleSetFeaturedMatch(match)}
                                  className={`w-full py-1.5 px-2 rounded border transition-colors ${
                                    isLive
                                      ? 'bg-red-900/40 text-red-300 border-red-700 font-bold'
                                      : 'bg-[#1b1b1f] hover:bg-[#25252b] text-text-secondary hover:text-text-primary border-border'
                                  }`}
                                >
                                  {isLive ? '🔴 LIVE ON MAIN BROADCAST' : '📡 SET AS LIVE MATCH'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════ TAB 4: STREAM BROADCAST ════════════════ */}
        {activeTab === 'stream' && (
          <div className="max-w-2xl bg-[#141416] border border-border p-6 rounded space-y-6">
            <div>
              <span className="text-[10px] font-mono text-[#ff6600] uppercase tracking-widest font-bold">
                BROADCAST CONTROL
              </span>
              <h3 className="font-display text-2xl font-bold tracking-tight text-text-primary mt-1">
                LIVE STREAM SETTINGS
              </h3>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-text-secondary mb-1">STREAM TITLE</label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="e.g. Triple Stars Casablanca FIFA 26 Grand Finals"
                  className="w-full bg-[#1b1b1f] border border-border text-text-primary px-3 py-2.5 rounded focus:border-[#ff6600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">STREAM URL (YOUTUBE / TWITCH)</label>
                <input
                  type="url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://twitch.tv/triplestars or https://youtube.com/watch?v=..."
                  className="w-full bg-[#1b1b1f] border border-border text-text-primary px-3 py-2.5 rounded focus:border-[#ff6600] focus:outline-none"
                />
              </div>

              <button
                onClick={async () => {
                  if (!currentTournament) return
                  await supabase
                    .from('tournaments')
                    .update({ stream_url: streamUrl, stream_title: streamTitle })
                    .eq('id', currentTournament.id)
                  showNotification('Stream settings updated successfully!')
                }}
                className="w-full bg-[#ff6600] hover:bg-[#ff7700] text-black font-bold py-3 px-4 rounded tracking-wider uppercase transition-colors"
              >
                SAVE STREAM SETTINGS
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
