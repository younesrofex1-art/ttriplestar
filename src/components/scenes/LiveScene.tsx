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
        <div className="space-y-5 bg-[#141418]/70 border border-border/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] md:text-xs text-text-secondary font-bold tracking-widest uppercase bg-bg-surface border border-border px-2.5 py-0.5 rounded">
              03 // LIVE BROADCAST
            </span>
            <span className="h-px flex-1 bg-border/40" />
          </div>

          <div>
            <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white uppercase">
              NO ACTIVE <span className="text-[#ff6600]">TOURNAMENT</span>
            </h2>
            <p className="font-mono text-xs md:text-sm text-text-secondary mt-2 leading-relaxed">
              Live broadcast feed and real-time scoreboards will appear automatically during active tournament rounds.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate?.(1)}
              className="border border-[#ff6600]/60 hover:border-[#ff6600] bg-[#ff6600]/10 hover:bg-[#ff6600] text-[#ff6600] hover:text-black font-mono text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-lg transition-all cursor-pointer"
            >
              BROWSE TOURNAMENTS →
            </button>
            <button
              onClick={() => onNavigate?.(3)}
              className="border border-border-strong hover:border-text-primary text-text-secondary hover:text-white font-mono text-xs tracking-widest uppercase px-6 py-3 rounded-lg transition-all cursor-pointer"
            >
              VIEW BRACKET →
            </button>
          </div>
        </div>
      )
    }

    if (!liveMatch) {
      return (
        <div className="space-y-5 bg-[#141418]/70 border border-border/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 font-mono text-[10px] md:text-xs text-live font-bold tracking-widest uppercase bg-live/10 border border-live/30 px-2.5 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-live animate-ping" />
              03 // LIVE ARENA
            </span>
            <span className="h-px flex-1 bg-border/40" />
          </div>

          <div>
            <div className="font-mono text-xs text-[#ff6600] tracking-widest uppercase mb-1">
              LIVE EVENT IN PROGRESS
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight text-white uppercase leading-tight">
              {tournament.name}
            </h2>
            <p className="font-mono text-xs md:text-sm text-text-secondary mt-2">
              Next scheduled match starting shortly. Standby for scoreboard feed.
            </p>
          </div>

          <div className="p-4 bg-bg-surface/60 border border-border/60 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div>
              <div className="text-text-muted text-[10px] uppercase tracking-wider">FORMAT</div>
              <div className="text-white font-bold">{tournament.format?.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px] uppercase tracking-wider">PRIZE POOL</div>
              <div className="text-[#ff6600] font-bold">{tournament.prize_pool_mad} MAD</div>
            </div>
            <div>
              <div className="text-text-muted text-[10px] uppercase tracking-wider">VENUE</div>
              <div className="text-white font-bold">{tournament.location || 'CASABLANCA HQ'}</div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            {(liveStream?.stream_url || tournament?.stream_url) && (
              <a
                href={liveStream?.stream_url || tournament?.stream_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-live bg-live/15 text-live hover:bg-live hover:text-white transition-all px-6 py-3 font-mono text-xs tracking-widest uppercase font-bold rounded-lg"
              >
                <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
                WATCH STREAM
              </a>
            )}
            <button
              onClick={() => onNavigate?.(3)}
              className="inline-block border border-border-strong hover:border-text-primary text-text-primary hover:text-white transition-colors px-6 py-3 font-mono text-xs tracking-widest uppercase cursor-pointer rounded-lg"
            >
              VIEW BRACKET →
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full space-y-5 bg-[#141418]/70 border border-border/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-mono text-[10px] md:text-xs text-live font-bold tracking-widest uppercase bg-live/10 border border-live/30 px-2.5 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-live animate-ping" />
            03 // LIVE MATCH
          </span>
          <span className="h-px flex-1 bg-border/40" />
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight">
            {tournament.name}
          </h2>
          <div className="font-mono text-xs text-[#ff6600] tracking-widest uppercase mt-1">
            MATCH #{liveMatch.match_number} • ROUND {liveMatch.round_number}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-center border border-border/80 py-5 px-5 sm:px-6 bg-bg-surface/50 rounded-lg">
          {/* Player 1 */}
          <div className="flex flex-col">
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest">PLAYER 1</div>
            <div className="text-xl md:text-2xl font-display font-extrabold text-white truncate mt-0.5">
              {liveMatch.player1?.display_name || 'PLAYER 1'}
            </div>
            <div className="text-4xl md:text-5xl font-mono font-black text-[#ff6600] mt-2">
              {liveMatch.player1_score ?? 0}
            </div>
          </div>

          {/* VS Divider */}
          <div className="font-mono text-xs font-bold text-text-muted text-center uppercase tracking-widest py-2 sm:py-0 px-2 sm:px-4 bg-[#1e1e24] rounded border border-border/40">
            VS
          </div>

          {/* Player 2 */}
          <div className="flex flex-col sm:items-end sm:text-right">
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest">PLAYER 2</div>
            <div className="text-xl md:text-2xl font-display font-extrabold text-white truncate mt-0.5">
              {liveMatch.player2?.display_name || 'PLAYER 2'}
            </div>
            <div className="text-4xl md:text-5xl font-mono font-black text-[#ff6600] mt-2">
              {liveMatch.player2_score ?? 0}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          {(liveStream?.stream_url || tournament?.stream_url) ? (
            <a
              href={liveStream?.stream_url || tournament?.stream_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-live bg-live/15 text-live hover:bg-live hover:text-white transition-all px-6 py-3 font-mono text-xs tracking-widest uppercase font-bold rounded-lg"
            >
              <span className="w-2 h-2 rounded-full bg-live animate-ping" />
              WATCH LIVE STREAM
            </a>
          ) : (
            <div className="font-mono text-xs text-text-muted border border-border px-4 py-3 rounded-lg bg-bg-surface/30">
              STREAM OFFLINE
            </div>
          )}

          <button
            onClick={() => onNavigate?.(3)}
            className="inline-block border border-border-strong hover:border-text-primary text-text-primary hover:text-white transition-colors px-6 py-3 font-mono text-xs tracking-widest uppercase cursor-pointer rounded-lg"
          >
            VIEW BRACKET →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center md:items-end px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 py-16 md:py-0 bg-transparent text-[#ededed] relative select-none">
      <div className="relative z-10 max-w-xl lg:max-w-2xl xl:max-w-2xl w-full mx-auto md:ml-auto">
        {renderContent()}
      </div>
    </div>
  )
}

