'use client'

import React from 'react'
import type { Tournament, PublicTournamentState } from '@/lib/types'

interface TournamentSceneProps {
  tournament: Tournament | null
  publicState: PublicTournamentState
  registrationCount: number
  onRegister?: () => void
  onNavigate?: (index: number) => void
}

export function TournamentScene({
  tournament,
  publicState,
  registrationCount,
  onRegister,
  onNavigate,
}: TournamentSceneProps) {
  const renderContent = () => {
    if (publicState === 'NO_EVENT' || !tournament) {
      return (
        <div className="space-y-4">
          <div className="font-mono text-xs text-text-secondary uppercase tracking-[0.25em]">
            TOURNAMENT SCHEDULE
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
            NO OPEN TOURNAMENT
          </h2>
          <div className="font-mono text-text-secondary uppercase tracking-widest text-xs">
            <div>NEXT EVENT COMING SOON</div>
            <div className="text-text-muted mt-1">Check back for the next registration window.</div>
          </div>
        </div>
      )
    }

    if (publicState === 'REGISTRATION_OPEN') {
      const maxPlayers = tournament.max_players || 32
      const fee = tournament.entry_fee_mad ? `${tournament.entry_fee_mad} MAD` : 'FREE ENTRY'
      const gameName = tournament.game?.name || 'FC 26'

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="status-dot status-online" />
            <span className="font-mono text-xs text-accent uppercase tracking-[0.25em] font-bold">
              REGISTRATION OPEN
            </span>
          </div>

          <div>
            <div className="font-mono text-xs text-text-secondary tracking-widest uppercase mb-1">
              NEXT EVENT
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-none">
              {tournament.name}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-border/80 max-w-lg font-mono text-xs">
            <div>
              <div className="text-text-secondary uppercase tracking-wider text-[10px]">GAME</div>
              <div className="text-text-primary font-bold mt-0.5">{gameName}</div>
            </div>
            <div>
              <div className="text-text-secondary uppercase tracking-wider text-[10px]">ENTRY FEE</div>
              <div className="text-accent font-bold mt-0.5">{fee}</div>
            </div>
            <div>
              <div className="text-text-secondary uppercase tracking-wider text-[10px]">CAPACITY</div>
              <div className="text-text-primary font-bold mt-0.5">
                {registrationCount} / {maxPlayers} SLOTS
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onRegister}
              className="inline-flex items-center justify-center border border-accent bg-accent/10 hover:bg-accent hover:text-bg text-accent transition-all duration-300 px-10 py-4 font-mono text-xs tracking-[0.25em] uppercase font-bold shadow-[0_0_20px_rgba(0,255,136,0.15)]"
            >
              [ REGISTER FOR EVENT ]
            </button>
          </div>
        </div>
      )
    }

    if (publicState === 'REGISTRATION_CLOSED') {
      return (
        <div className="space-y-4">
          <div className="font-mono text-xs text-text-secondary tracking-widest uppercase">
            EVENT ROSTER LOCKED
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight">
            {tournament.name}
          </h2>
          <div className="font-mono text-text-secondary tracking-wider text-xs">
            REGISTRATION CLOSED — {registrationCount} PLAYERS CONFIRMED
          </div>
          <div className="pt-4">
            <button
              onClick={() => onNavigate?.(3)}
              className="inline-block border border-border-strong hover:border-accent hover:text-accent transition-colors px-6 py-3 font-mono text-xs tracking-widest uppercase"
            >
              VIEW BRACKET
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h2 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight">
          {tournament.name}
        </h2>
        <div className="font-mono text-accent tracking-widest uppercase text-xs">
          EVENT {publicState}
        </div>
        <div className="pt-4">
          <button
            onClick={() => onNavigate?.(publicState === 'LIVE' ? 2 : 4)}
            className="inline-block border border-border-strong hover:border-accent hover:text-accent transition-colors px-8 py-3.5 font-mono text-xs tracking-widest uppercase"
          >
            VIEW {publicState === 'LIVE' ? 'LIVE MATCHES' : 'RESULTS'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed] relative select-none">
      <div className="relative z-10 max-w-2xl">{renderContent()}</div>
    </div>
  )
}
