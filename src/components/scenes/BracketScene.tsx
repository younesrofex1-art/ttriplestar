'use client'

import React, { useMemo } from 'react'
import type { Tournament, TournamentMatch, TournamentRound } from '@/lib/types'

interface BracketSceneProps {
  tournament: Tournament | null
  matches: TournamentMatch[]
  rounds: TournamentRound[]
  onNavigate?: (index: number) => void
}

function BracketMatchCard({ match }: { match: TournamentMatch }) {
  const p1Winner = match.winner_id === match.player1_id && match.player1_id != null
  const p2Winner = match.winner_id === match.player2_id && match.player2_id != null
  const isLive = match.status === 'live'

  return (
    <div
      className={`relative flex flex-col w-60 border ${
        isLive ? 'border-live shadow-[0_0_15px_rgba(255,51,51,0.2)]' : 'border-border'
      } bg-bg-surface overflow-hidden`}
    >
      {isLive && (
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-live animate-pulse" />
      )}

      {/* Player 1 */}
      <div
        className={`flex justify-between items-center px-3.5 py-2.5 border-b border-border/60 ${
          p1Winner ? 'bg-accent/10' : ''
        }`}
      >
        <span
          className={`font-sans text-xs font-medium truncate pr-2 ${
            p1Winner ? 'text-accent font-bold' : 'text-text-primary'
          }`}
        >
          {match.player1?.display_name || 'TBD'}
        </span>
        <span
          className={`font-mono text-xs font-bold ${
            p1Winner ? 'text-accent' : 'text-text-muted'
          }`}
        >
          {match.player1_score ?? '-'}
        </span>
      </div>

      {/* Player 2 */}
      <div
        className={`flex justify-between items-center px-3.5 py-2.5 ${
          p2Winner ? 'bg-accent/10' : ''
        }`}
      >
        <span
          className={`font-sans text-xs font-medium truncate pr-2 ${
            p2Winner ? 'text-accent font-bold' : 'text-text-primary'
          }`}
        >
          {match.player2?.display_name || 'TBD'}
        </span>
        <span
          className={`font-mono text-xs font-bold ${
            p2Winner ? 'text-accent' : 'text-text-muted'
          }`}
        >
          {match.player2_score ?? '-'}
        </span>
      </div>
    </div>
  )
}

export function BracketScene({ tournament, matches, rounds, onNavigate }: BracketSceneProps) {
  const matchesByRound = useMemo(() => {
    const grouped = new Map<number, TournamentMatch[]>()
    matches.forEach((m) => {
      const round = m.round_number || 1
      if (!grouped.has(round)) {
        grouped.set(round, [])
      }
      grouped.get(round)!.push(m)
    })

    return Array.from(grouped.entries()).sort(([a], [b]) => a - b)
  }, [matches])

  if (!tournament || matches.length === 0) {
    return (
      <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-transparent text-[#ededed] select-none">
        <div className="font-mono text-xs text-text-secondary uppercase tracking-[0.25em] mb-2">
          TOURNAMENT BRACKET
        </div>
        <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-4">
          BRACKET STANDBY
        </h2>
        <div className="font-mono text-xs text-text-muted">
          Tournament brackets will generate once player registration closes and seeds are drawn.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col pt-24 pb-12 px-8 md:px-16 lg:px-24 bg-transparent text-[#ededed] select-none">
      <div className="mb-6 shrink-0">
        <div className="font-mono text-xs text-accent tracking-widest uppercase mb-1">
          ELIMINATION BRACKET
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
          {tournament.name}
        </h2>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 relative pr-12 pb-6">
        <div className="flex flex-row gap-12 min-w-max h-full items-center">
          {matchesByRound.map(([roundNumber, roundMatches]) => {
            const roundInfo = rounds.find((r) => r.round_number === roundNumber)
            const roundName = roundInfo?.name || `ROUND ${roundNumber}`

            return (
              <div
                key={roundNumber}
                className="flex flex-col gap-6 h-full justify-around relative"
              >
                <div className="font-mono text-text-secondary text-[10px] font-bold tracking-[0.25em] uppercase text-center border-b border-border pb-2">
                  {roundName}
                </div>

                <div className="flex flex-col gap-6 justify-around flex-1">
                  {roundMatches
                    .sort((a, b) => (a.match_number || 0) - (b.match_number || 0))
                    .map((match) => (
                      <BracketMatchCard key={match.id} match={match} />
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
