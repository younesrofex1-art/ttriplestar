'use client'

import React, { useMemo } from 'react'
import type { Tournament, TournamentMatch } from '@/lib/types'

interface ResultsSceneProps {
  tournament: Tournament | null
  matches: TournamentMatch[]
  onNavigate?: (index: number) => void
}

export function ResultsScene({ tournament, matches, onNavigate }: ResultsSceneProps) {
  const results = useMemo(() => {
    if (!tournament || tournament.status !== 'COMPLETED' || matches.length === 0) {
      return null
    }

    const maxRound = Math.max(...matches.map((m) => m.round_number || 1))
    const finalMatch = matches.find((m) => m.round_number === maxRound)

    let winner = null
    let runnerUp = null
    let thirdPlace = null

    if (finalMatch) {
      if (finalMatch.winner_id === finalMatch.player1_id) {
        winner = finalMatch.player1
        runnerUp = finalMatch.player2
      } else if (finalMatch.winner_id === finalMatch.player2_id) {
        winner = finalMatch.player2
        runnerUp = finalMatch.player1
      }
    }

    const semiFinals = matches.filter((m) => m.round_number === maxRound - 1)
    const semiLosers = semiFinals
      .map((m) => {
        if (m.winner_id === m.player1_id) return m.player2
        if (m.winner_id === m.player2_id) return m.player1
        return null
      })
      .filter(Boolean)

    if (semiLosers.length > 0) {
      thirdPlace = semiLosers[0]
    }

    return { winner, runnerUp, thirdPlace }
  }, [tournament, matches])

  if (!tournament || tournament.status !== 'COMPLETED' || !results) {
    return (
      <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-transparent text-[#ededed] select-none">
        <div className="font-mono text-xs text-text-secondary tracking-[0.25em] uppercase mb-2">
          TOURNAMENT ARCHIVE
        </div>
        <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-4">
          RESULTS PENDING
        </h2>
        <div className="font-mono text-xs text-text-muted">
          Official podium rankings and prize distribution will be published upon tournament conclusion.
        </div>
      </div>
    )
  }

  const { winner, runnerUp, thirdPlace } = results

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-transparent text-[#ededed] relative select-none">
      <div className="relative z-10 max-w-3xl w-full">
        <div className="font-mono text-accent tracking-[0.25em] uppercase mb-2 text-xs font-bold flex items-center gap-2">
          <span className="status-dot status-online" />
          TOURNAMENT COMPLETE
        </div>
        <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-12">
          {tournament.name}
        </h2>

        <div className="space-y-6 mb-12 border-y border-border/80 py-8 bg-bg-surface/30 px-6">
          {winner && (
            <div className="flex items-center gap-6">
              <div className="font-mono text-accent text-5xl md:text-7xl font-black leading-none w-20 md:w-28">
                1ST
              </div>
              <div className="flex-1">
                <div className="text-2xl md:text-4xl font-display font-extrabold text-text-primary truncate">
                  {winner.display_name}
                </div>
                <div className="font-mono text-xs text-accent mt-0.5">CHAMPION</div>
              </div>
            </div>
          )}

          {runnerUp && (
            <div className="flex items-center gap-6 border-t border-border/40 pt-4">
              <div className="font-mono text-text-muted text-3xl md:text-5xl font-black leading-none w-20 md:w-28">
                2ND
              </div>
              <div className="flex-1">
                <div className="text-xl md:text-2xl font-display font-bold text-text-secondary truncate">
                  {runnerUp.display_name}
                </div>
                <div className="font-mono text-xs text-text-muted mt-0.5">FINALIST</div>
              </div>
            </div>
          )}

          {thirdPlace && (
            <div className="flex items-center gap-6 border-t border-border/40 pt-4">
              <div className="font-mono text-text-muted text-2xl md:text-4xl font-black leading-none w-20 md:w-28">
                3RD
              </div>
              <div className="flex-1">
                <div className="text-lg md:text-xl font-display font-bold text-text-secondary truncate">
                  {thirdPlace.display_name}
                </div>
                <div className="font-mono text-xs text-text-muted mt-0.5">SEMI-FINALIST</div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigate?.(3)}
          className="inline-block border border-border-strong hover:border-text-primary text-text-primary transition-colors px-8 py-3.5 font-mono text-xs tracking-widest uppercase"
        >
          VIEW COMPLETED BRACKET →
        </button>
      </div>
    </div>
  )
}
