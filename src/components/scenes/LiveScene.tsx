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
  const streamUrl = liveStream?.stream_url || tournament?.stream_url

  const renderContent = () => {
    // ─── Case 1: No tournament selected or created ───────────────────
    if (!tournament) {
      return (
        <div className="space-y-5 bg-[#0e0e13]/90 border border-border-strong/80 p-6 sm:p-8 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.7)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] md:text-xs text-text-secondary font-bold tracking-widest uppercase bg-[#14141a] border border-border px-3 py-1 rounded-full">
              03 // BROADCAST ARENA
            </span>
            <span className="font-mono text-[9px] text-text-muted border border-border px-2 py-0.5 rounded">
              STANDBY
            </span>
          </div>

          <div>
            <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white uppercase">
              NO ACTIVE <span className="text-[#ff6600]">TOURNAMENT</span>
            </h2>
            <p className="font-mono text-xs md:text-sm text-text-secondary mt-2 leading-relaxed">
              Official tournament broadcasts and real-time scoreboards will appear automatically during active rounds.
            </p>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={() => onNavigate?.(1)}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-mono text-xs font-bold text-black bg-[#ff6600] hover:bg-[#ff7711] shadow-[0_0_20px_rgba(255,102,0,0.4)] transition-all cursor-pointer"
            >
              <span>BROWSE TOURNAMENTS</span>
              <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.(3)}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-mono text-xs font-bold text-zinc-300 hover:text-white bg-[#14141a] hover:bg-[#1f1f28] border border-border hover:border-[#ff6600]/40 transition-all cursor-pointer"
            >
              <span>VIEW BRACKET →</span>
            </button>
          </div>
        </div>
      )
    }

    // ─── Case 2: Live Tournament Event in Progress (Standby or Between Matches) ─
    if (!liveMatch) {
      const isLiveState = tournament.status === 'LIVE'

      return (
        <div className="space-y-5 bg-[#0e0e13]/90 border border-border-strong/80 hover:border-[#ff6600]/40 p-6 sm:p-8 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all">
          {/* Header HUD */}
          <div className="flex items-center justify-between gap-3">
            <span
              className={`flex items-center gap-2 font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
                isLiveState
                  ? 'text-live bg-live/10 border-live/30'
                  : 'text-[#ff6600] bg-[#ff6600]/10 border-[#ff6600]/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveState ? 'bg-live animate-ping' : 'bg-[#ff6600] animate-pulse'
                }`}
              />
              03 // {isLiveState ? 'LIVE BROADCAST' : 'ARENA EVENT'}
            </span>

            <span className="font-mono text-[9px] md:text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              ● BROADCAST ACTIVE
            </span>
          </div>

          {/* Title & Tag */}
          <div>
            <div className="font-mono text-xs text-[#ff6600] font-bold tracking-widest uppercase mb-1.5 flex items-center gap-2">
              <span>★</span>
              <span>LIVE EVENT IN PROGRESS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight text-white uppercase leading-tight">
              {tournament.name}
            </h2>
            <p className="font-mono text-xs md:text-sm text-text-secondary mt-2">
              Next scheduled match starting shortly. Real-time bracket telemetry & scoreboard will update automatically.
            </p>
          </div>

          {/* 4-Box Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="p-3 bg-[#14141a] border border-border rounded-xl">
              <div className="text-text-muted text-[9px] uppercase tracking-wider mb-0.5">DISCIPLINE</div>
              <div className="text-white font-bold truncate">
                {tournament.game?.name || 'COMPETITIVE'}
              </div>
            </div>

            <div className="p-3 bg-[#14141a] border border-border rounded-xl">
              <div className="text-text-muted text-[9px] uppercase tracking-wider mb-0.5">FORMAT</div>
              <div className="text-white font-bold truncate">
                {tournament.format?.replace('_', ' ').toUpperCase() || 'ELIMINATION'}
              </div>
            </div>

            <div className="p-3 bg-[#14141a] border border-border rounded-xl">
              <div className="text-text-muted text-[9px] uppercase tracking-wider mb-0.5">PRIZE POOL</div>
              <div className="text-[#ff6600] font-bold truncate">
                {tournament.prize_pool_mad ? `${tournament.prize_pool_mad} MAD` : 'TROPHY'}
              </div>
            </div>

            <div className="p-3 bg-[#14141a] border border-border rounded-xl">
              <div className="text-text-muted text-[9px] uppercase tracking-wider mb-0.5">LOCATION</div>
              <div className="text-white font-bold truncate">
                {tournament.location || 'CASABLANCA'}
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {streamUrl ? (
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-mono text-xs tracking-widest uppercase font-bold text-white bg-gradient-to-r from-red-600 to-[#ff3333] hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(255,51,51,0.45)] hover:shadow-[0_0_30px_rgba(255,51,51,0.7)] transition-all text-center"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>WATCH LIVE STREAM</span>
                <span className="text-xs">↗</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate?.(1)}
                className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-mono text-xs font-bold text-black bg-[#ff6600] hover:bg-[#ff7711] shadow-[0_0_20px_rgba(255,102,0,0.4)] transition-all cursor-pointer text-center"
              >
                <span>REGISTER FOR TOURNAMENT</span>
                <span>→</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate?.(3)}
              className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-mono text-xs font-bold text-zinc-300 hover:text-white bg-[#14141a] hover:bg-[#1f1f28] border border-border hover:border-[#ff6600]/50 transition-all cursor-pointer"
            >
              <span>VIEW BRACKET →</span>
            </button>
          </div>
        </div>
      )
    }

    // ─── Case 3: Live Active Match Scoreboard ────────────────────────
    return (
      <div className="w-full space-y-5 bg-[#0e0e13]/90 border border-border-strong/80 hover:border-[#ff6600]/40 p-6 sm:p-8 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all">
        {/* Header HUD */}
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-mono text-[10px] md:text-xs text-live font-bold tracking-widest uppercase bg-live/10 border border-live/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-live animate-ping" />
            03 // LIVE MATCH TELEMETRY
          </span>
          <span className="font-mono text-[9px] md:text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
            ● IN PLAY
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            {tournament.name}
          </h2>
          <div className="font-mono text-xs text-[#ff6600] font-semibold tracking-widest uppercase mt-1">
            MATCH #{liveMatch.match_number ?? 1} • ROUND {liveMatch.round_number ?? 1}
          </div>
        </div>

        {/* Dynamic High-Impact Scoreboard */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-center border border-border/80 p-5 sm:p-6 bg-[#14141a] rounded-xl">
          {/* Player 1 */}
          <div className="flex flex-col">
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <span>●</span> PLAYER 1
            </div>
            <div className="text-lg sm:text-2xl font-display font-extrabold text-white truncate mt-1">
              {liveMatch.player1?.display_name || 'PLAYER 1'}
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-black text-[#ff6600] mt-2 drop-shadow-[0_0_15px_rgba(255,102,0,0.4)]">
              {liveMatch.player1_score ?? 0}
            </div>
          </div>

          {/* VS Divider */}
          <div className="font-mono text-xs font-black text-zinc-400 text-center uppercase tracking-widest py-1.5 sm:py-2 px-3 sm:px-4 bg-[#1e1e26] rounded-lg border border-border">
            VS
          </div>

          {/* Player 2 */}
          <div className="flex flex-col sm:items-end sm:text-right">
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest flex items-center sm:justify-end gap-1.5">
              PLAYER 2 <span>●</span>
            </div>
            <div className="text-lg sm:text-2xl font-display font-extrabold text-white truncate mt-1">
              {liveMatch.player2?.display_name || 'PLAYER 2'}
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-black text-[#ff6600] mt-2 drop-shadow-[0_0_15px_rgba(255,102,0,0.4)]">
              {liveMatch.player2_score ?? 0}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {streamUrl ? (
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-mono text-xs tracking-widest uppercase font-bold text-white bg-gradient-to-r from-red-600 to-[#ff3333] hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(255,51,51,0.45)] hover:shadow-[0_0_30px_rgba(255,51,51,0.7)] transition-all text-center"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>WATCH LIVE STREAM</span>
              <span className="text-xs">↗</span>
            </a>
          ) : (
            <div className="font-mono text-xs text-text-muted border border-border px-4 py-3 rounded-xl bg-[#14141a]">
              STREAM OFFLINE
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigate?.(3)}
            className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-mono text-xs font-bold text-zinc-300 hover:text-white bg-[#14141a] hover:bg-[#1f1f28] border border-border hover:border-[#ff6600]/50 transition-all cursor-pointer"
          >
            <span>VIEW BRACKET →</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center md:items-end px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-16 md:py-0 bg-transparent text-[#ededed] relative select-none">
      <div className="relative z-10 max-w-lg lg:max-w-xl xl:max-w-2xl w-full mx-auto md:ml-auto md:mr-0">
        {renderContent()}
      </div>
    </div>
  )
}

