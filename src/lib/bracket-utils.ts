import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export interface BracketGenerationOptions {
  tournamentId: string
  players: Profile[]
  format?: 'single_elimination'
}

/**
 * Generates an esports Single-Elimination bracket for any player count (e.g. 20 players, 16, 32, 8).
 * For 20 players:
 * - Total slots: 32 (5 rounds)
 * - Round 1 (Opening / Wildcard Round): 4 matches (8 lowest-seeded players: Seeds 13-20)
 * - Top 12 seeds receive a BYE into Round 2 (Round of 16)
 * - Round 2 (Round of 16): 8 matches (12 seeds + 4 winners from Round 1)
 * - Round 3 (Quarterfinals): 4 matches
 * - Round 4 (Semifinals): 2 matches
 * - Round 5 (Grand Final): 1 match
 */
export async function generateTournamentBracket({
  tournamentId,
  players,
}: BracketGenerationOptions) {
  const supabase = createClient()
  const n = players.length

  if (n < 2) {
    throw new Error('At least 2 players are required to generate a tournament bracket.')
  }

  // 1. Delete existing rounds and matches for this tournament
  await supabase.from('tournament_matches').delete().eq('tournament_id', tournamentId)
  await supabase.from('tournament_rounds').delete().eq('tournament_id', tournamentId)

  // Determine bracket power of 2 size (e.g., 20 -> 32 slots, 16 -> 16 slots, 8 -> 8 slots)
  let bracketSize = 4
  while (bracketSize < n) {
    bracketSize *= 2
  }

  const totalRounds = Math.log2(bracketSize) // e.g. for 32 slots: 5 rounds; 16 slots: 4 rounds; 8 slots: 3 rounds

  // Round Names
  const roundNamesMap: Record<number, string> = {
    1: bracketSize === 32 ? 'OPENING ROUND' : 'ROUND OF 16',
    2: bracketSize === 32 ? 'ROUND OF 16' : 'QUARTERFINALS',
    3: bracketSize === 32 ? 'QUARTERFINALS' : 'SEMIFINALS',
    4: bracketSize === 32 ? 'SEMIFINALS' : 'GRAND FINAL',
    5: 'GRAND FINAL',
  }

  // Create rounds in DB
  const roundRecords: { id: string; tournament_id: string; round_number: number; name: string }[] = []
  for (let r = 1; r <= totalRounds; r++) {
    const roundName =
      r === totalRounds
        ? 'GRAND FINAL'
        : r === totalRounds - 1
        ? 'SEMIFINALS'
        : r === totalRounds - 2
        ? 'QUARTERFINALS'
        : r === totalRounds - 3
        ? 'ROUND OF 16'
        : `ROUND ${r}`

    roundRecords.push({
      id: crypto.randomUUID(),
      tournament_id: tournamentId,
      round_number: r,
      name: roundName,
    })
  }

  const { error: roundsError } = await supabase.from('tournament_rounds').insert(roundRecords)
  if (roundsError) {
    throw new Error(`Failed to create rounds: ${roundsError.message}`)
  }

  // Generate match node tree (from Finals back to Round 1)
  // Round totalRounds has 1 match, Round totalRounds-1 has 2 matches, etc.
  interface MatchNode {
    id: string
    tournament_id: string
    round_id: string
    round_number: number
    match_number: number
    player1_id: string | null
    player2_id: string | null
    player1_score: number
    player2_score: number
    winner_id: string | null
    status: 'scheduled' | 'live' | 'finished'
    next_match_id: string | null
    next_match_slot: 1 | 2 | null
    is_bye: boolean
  }

  const allMatches: MatchNode[] = []
  const matchesByRound: Record<number, MatchNode[]> = {}

  for (let r = totalRounds; r >= 1; r--) {
    const matchCount = Math.pow(2, totalRounds - r)
    const roundId = roundRecords[r - 1].id
    matchesByRound[r] = []

    for (let m = 1; m <= matchCount; m++) {
      let nextMatchId: string | null = null
      let nextSlot: 1 | 2 | null = null

      if (r < totalRounds) {
        // Parent match in the next round
        const parentMatchIndex = Math.floor((m - 1) / 2)
        const parentMatch = matchesByRound[r + 1][parentMatchIndex]
        nextMatchId = parentMatch.id
        nextSlot = m % 2 === 1 ? 1 : 2
      }

      const match: MatchNode = {
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        round_id: roundId,
        round_number: r,
        match_number: m,
        player1_id: null,
        player2_id: null,
        player1_score: 0,
        player2_score: 0,
        winner_id: null,
        status: 'scheduled',
        next_match_id: nextMatchId,
        next_match_slot: nextSlot,
        is_bye: false,
      }

      matchesByRound[r].push(match)
      allMatches.push(match)
    }
  }

  // Seed Assignment for the First Active Round
  // If n === bracketSize (e.g. exactly 16 or 32 players), all start in Round 1
  // If n < bracketSize (e.g. 20 players in 32 slots):
  //   numByes = bracketSize - n = 32 - 20 = 12 Byes
  //   numWildcardMatches = n - (bracketSize / 2) = 20 - 16 = 4 Matches in Round 1 (8 players)
  //   Top 12 players go directly to Round 2 (Round of 16)
  if (n === bracketSize) {
    // Standard pairing for round 1
    const r1Matches = matchesByRound[1]
    for (let i = 0; i < r1Matches.length; i++) {
      const p1 = players[i * 2] || null
      const p2 = players[i * 2 + 1] || null
      r1Matches[i].player1_id = p1 ? p1.id : null
      r1Matches[i].player2_id = p2 ? p2.id : null
    }
  } else {
    // 20-Player Setup in 32-slot bracket (or any partial count)
    const numWildcardMatches = n - bracketSize / 2 // e.g. 20 - 16 = 4 matches in Round 1
    const numByes = bracketSize / 2 - numWildcardMatches // e.g. 16 - 4 = 12 byes in Round 2

    const r1Matches = matchesByRound[1]
    const r2Matches = matchesByRound[2]

    // Top seeds get Byes in Round 2
    let playerIdx = 0

    // Assign top 12 seeds to Round 2 bye slots
    for (let i = 0; i < numByes; i++) {
      if (playerIdx < players.length) {
        if (i % 2 === 0) {
          r2Matches[Math.floor(i / 2)].player1_id = players[playerIdx].id
        } else {
          r2Matches[Math.floor(i / 2)].player2_id = players[playerIdx].id
        }
        playerIdx++
      }
    }

    // Remaining players (seeds 13 to 20) are placed in Round 1 Opening matches
    for (let i = 0; i < numWildcardMatches; i++) {
      if (i < r1Matches.length) {
        const p1 = playerIdx < players.length ? players[playerIdx++] : null
        const p2 = playerIdx < players.length ? players[playerIdx++] : null
        r1Matches[i].player1_id = p1 ? p1.id : null
        r1Matches[i].player2_id = p2 ? p2.id : null
      }
    }

    // Remaining unused Round 1 matches can be marked as Bye / Auto-advancing if any
    for (let i = numWildcardMatches; i < r1Matches.length; i++) {
      r1Matches[i].is_bye = true
      r1Matches[i].status = 'finished'
    }
  }

  // Insert all generated matches into Supabase
  const { error: matchesError } = await supabase.from('tournament_matches').insert(allMatches)
  if (matchesError) {
    throw new Error(`Failed to create matches: ${matchesError.message}`)
  }

  // Update Tournament status to 'LIVE'
  await supabase.from('tournaments').update({ status: 'LIVE' }).eq('id', tournamentId)

  return { totalRounds, matchCount: allMatches.length }
}

/**
 * Declares the winner of a match, updates scores, and advances the winner into the next bracket node.
 */
export async function advanceMatchWinner(
  matchId: string,
  winnerId: string,
  player1Score: number,
  player2Score: number
) {
  const supabase = createClient()

  // 1. Fetch the match
  const { data: match, error: fetchErr } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (fetchErr || !match) {
    throw new Error(`Match not found: ${fetchErr?.message}`)
  }

  // 2. Update current match
  const { error: updateErr } = await supabase
    .from('tournament_matches')
    .update({
      player1_score: player1Score,
      player2_score: player2Score,
      winner_id: winnerId,
      status: 'finished',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (updateErr) {
    throw new Error(`Failed to update match: ${updateErr.message}`)
  }

  // Update winner stats in profile
  const { data: currentWinner } = await supabase
    .from('profiles')
    .select('wins, points')
    .eq('id', winnerId)
    .single()

  if (currentWinner) {
    await supabase
      .from('profiles')
      .update({
        wins: (currentWinner.wins || 0) + 1,
        points: (currentWinner.points || 0) + 10,
      })
      .eq('id', winnerId)
  }

  // 3. Advance to next match if present
  if (match.next_match_id && match.next_match_slot) {
    const updatePayload =
      match.next_match_slot === 1
        ? { player1_id: winnerId, status: 'scheduled' }
        : { player2_id: winnerId, status: 'scheduled' }

    await supabase
      .from('tournament_matches')
      .update(updatePayload)
      .eq('id', match.next_match_id)
  } else {
    // This was the Grand Final! Tournament is COMPLETED
    await supabase
      .from('tournaments')
      .update({ status: 'COMPLETED' })
      .eq('id', match.tournament_id)

    // Grant championship to the winner
    if (currentWinner) {
      const { data: champProfile } = await supabase
        .from('profiles')
        .select('championships')
        .eq('id', winnerId)
        .single()

      if (champProfile) {
        await supabase
          .from('profiles')
          .update({ championships: (champProfile.championships || 0) + 1 })
          .eq('id', winnerId)
      }
    }
  }

  return { success: true }
}
