'use client'

import React from 'react'
import type { Tournament, TournamentMatch, Stream } from '@/lib/types'

interface LiveSceneProps {
  tournament: Tournament | null
  liveMatch: TournamentMatch | null
  liveStream: Stream | null
  onNavigate?: (index: number) => void
}

export function LiveScene({
  tournament,
  liveMatch,
  liveStream,
  onNavigate,
}: LiveSceneProps) {
  const renderContent = () => {
    if (!tournament) {
      return (
        <div className="space-y-4">
          <div className="font-mono text-xs text-text-secondary tracking-widest uppercase">
            LIVE BROADCAST
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
            NO ACTIVE TOURNAMENT
          </h2>
          <div className="font-mono text-text-muted text-xs tracking-wider">
            Live matches and stream will appear during scheduled tournament hours.
          </div>
        </div>
      )
    }

    if (!liveMatch) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="status-dot status-live" />
            <span className="font-mono text-live tracking-[0.2em] text-xs font-bold uppercase">
              LIVE TOURNAMENT
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
            {tournament.name}
          </h2>
          <div className="font-mono text-text-secondary text-sm">
            NEXT MATCH STARTING SHORTLY
          </div>
          <div className="pt-4">
            <button
              onClick={() => onNavigate?.(3)}
              className="inline-block border border-border-strong hover:border-text-primary text-text-secondary hover:text-text-primary transition-colors px-6 py-3 font-mono text-xs tracking-widest uppercase"
            >
              VIEW BRACKET
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex items-center gap-2.5">
          <span className="status-dot status-live" />
          <span className="font-mono text-live tracking-[0.25em] text-xs font-bold uppercase">
            LIVE NOW
          </span>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-text-secondary tracking-tight">
            {tournament.name}
          </h2>
          <div className="font-mono text-xs text-text-muted tracking-widest uppercase mt-1">
            MATCH #{liveMatch.match_number} • ROUND {liveMatch.round_number}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-6 items-center border-y border-border/80 py-8 bg-bg-surface/30 px-6">
          {/* Player 1 */}
          <div className="flex flex-col">
            <div className="text-2xl md:text-4xl font-display font-extrabold text-text-primary truncate">
              {liveMatch.player1?.display_name || 'PLAYER 1'}
            </div>
            <div className="text-5xl md:text-7xl font-mono font-black text-accent mt-2">
              {liveMatch.player1_score ?? 0}
            </div>
          </div>

          {/* VS Divider */}
          <div className="font-mono text-sm text-text-muted text-center uppercase tracking-widest py-2 sm:py-0 px-4">
            VS
          </div>

          {/* Player 2 */}
          <div className="flex flex-col sm:items-end sm:text-right">
            <div className="text-2xl md:text-4xl font-display font-extrabold text-text-primary truncate">
              {liveMatch.player2?.display_name || 'PLAYER 2'}
            </div>
            <div className="text-5xl md:text-7xl font-mono font-black text-accent mt-2">
              {liveMatch.player2_score ?? 0}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {(liveStream?.stream_url || tournament?.stream_url) ? (
            <a
              href={liveStream?.stream_url || tournament?.stream_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-live bg-live/10 text-live hover:bg-live hover:text-white transition-all px-8 py-3.5 font-mono text-xs tracking-widest uppercase font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-live animate-ping" />
              WATCH LIVE STREAM
            </a>
          ) : (
            <div className="font-mono text-xs text-text-muted border border-border px-4 py-3">
              LIVE VIDEO NOT AVAILABLE
            </div>
          )}

          <button
            onClick={() => onNavigate?.(3)}
            className="inline-block border border-border-strong hover:border-text-primary text-text-primary transition-colors px-6 py-3 font-mono text-xs tracking-widest uppercase"
          >
            VIEW BRACKET →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-transparent text-[#ededed] relative select-none">
      <div className="relative z-10 w-full">{renderContent()}</div>
    </div>
  )
}
