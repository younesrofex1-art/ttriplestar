'use client'

import React, { useState, useMemo } from 'react'
import type { Tournament, PublicTournamentState } from '@/lib/types'
import type { TournamentWithCount } from '@/hooks/use-tournament-data'

interface TournamentSceneProps {
  tournament: Tournament | null
  allTournaments?: TournamentWithCount[]
  publicState: PublicTournamentState
  registrationCount: number
  onRegister?: (tourney?: Tournament) => void
  onSelectTournament?: (tourney: Tournament) => void
  onNavigate?: (index: number) => void
}

export function TournamentScene({
  tournament,
  allTournaments = [],
  publicState,
  registrationCount,
  onRegister,
  onSelectTournament,
  onNavigate,
}: TournamentSceneProps) {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'LIVE'>('ALL')
  const [page, setPage] = useState(0)
  const CARDS_PER_PAGE = 2

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    if (allTournaments.length === 0 && tournament) {
      return [{ ...tournament, registration_count: registrationCount }]
    }
    if (filter === 'OPEN') {
      return allTournaments.filter((t) => t.status === 'REGISTRATION_OPEN')
    }
    if (filter === 'LIVE') {
      return allTournaments.filter((t) => t.status === 'LIVE')
    }
    return allTournaments
  }, [allTournaments, tournament, registrationCount, filter])

  const totalPages = Math.max(1, Math.ceil(filteredTournaments.length / CARDS_PER_PAGE))
  const currentPage = Math.min(page, totalPages - 1)

  const currentCards = useMemo(() => {
    const start = currentPage * CARDS_PER_PAGE
    return filteredTournaments.slice(start, start + CARDS_PER_PAGE)
  }, [filteredTournaments, currentPage])

  const openCount = allTournaments.filter((t) => t.status === 'REGISTRATION_OPEN').length
  const liveCount = allTournaments.filter((t) => t.status === 'LIVE').length

  const handleNextPage = () => {
    setPage((prev) => (prev + 1) % totalPages)
  }

  const handlePrevPage = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  return (
    <div className="w-full h-full flex flex-col justify-center px-4 sm:px-6 md:px-14 lg:px-20 py-16 md:py-0 bg-transparent text-[#ededed] relative select-none overflow-hidden">
      <div className="max-w-5xl w-full z-10 mx-auto">
        {/* Header HUD */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] md:text-xs text-[#ff6600] font-bold tracking-widest uppercase bg-[#ff6600]/10 border border-[#ff6600]/30 px-2.5 py-0.5 rounded">
              02 // TOURNAMENT HUB
            </span>
            <span className="h-px flex-1 max-w-xs bg-gradient-to-r from-[#ff6600]/40 to-transparent" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white uppercase">
                ALL <span className="text-[#ff6600]">TOURNAMENTS</span>
              </h2>
              <p className="font-mono text-xs text-text-secondary mt-1">
                Browse open registrations, select an active championship, and secure your roster slot.
              </p>
            </div>

            {/* Filter Pills & Pagination Controls */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <button
                onClick={() => {
                  setFilter('ALL')
                  setPage(0)
                }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filter === 'ALL'
                    ? 'border-[#ff6600] bg-[#ff6600]/20 text-[#ff6600] font-bold'
                    : 'border-border bg-[#141418]/60 text-text-secondary hover:text-white'
                }`}
              >
                ALL ({allTournaments.length})
              </button>
              <button
                onClick={() => {
                  setFilter('OPEN')
                  setPage(0)
                }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filter === 'OPEN'
                    ? 'border-[#ff6600] bg-[#ff6600]/20 text-[#ff6600] font-bold'
                    : 'border-border bg-[#141418]/60 text-text-secondary hover:text-white'
                }`}
              >
                OPEN ({openCount})
              </button>
              {liveCount > 0 && (
                <button
                  onClick={() => {
                    setFilter('LIVE')
                    setPage(0)
                  }}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    filter === 'LIVE'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'border-border bg-[#141418]/60 text-text-secondary hover:text-white'
                  }`}
                >
                  LIVE ({liveCount})
                </button>
              )}

              {/* Page Switcher */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
                  <button
                    onClick={handlePrevPage}
                    className="w-7 h-7 rounded bg-[#16161c] hover:bg-[#ff6600] text-white hover:text-black border border-border flex items-center justify-center transition-colors text-xs"
                    aria-label="Previous Page"
                  >
                    ←
                  </button>
                  <span className="px-2 text-[10px] text-text-muted">
                    {currentPage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    className="w-7 h-7 rounded bg-[#16161c] hover:bg-[#ff6600] text-white hover:text-black border border-border flex items-center justify-center transition-colors text-xs"
                    aria-label="Next Page"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Card Clean Showcase (Zero Vertical Scroll) */}
        {currentCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCards.map((t) => {
              const isSelected = tournament?.id === t.id
              const maxPlayers = t.max_players || 20
              const regCount = t.registration_count ?? 0
              const percentFilled = Math.min(100, Math.round((regCount / maxPlayers) * 100))
              const fee = t.entry_fee_mad ? `${t.entry_fee_mad} MAD` : 'FREE'
              const prize = t.prize_pool_mad ? `${t.prize_pool_mad} MAD` : 'TROPHY'
              const gameName = t.game?.name || 'ESPORTS'

              const isLive = t.status === 'LIVE'
              const isOpen = t.status === 'REGISTRATION_OPEN'
              const isFinished = t.status === 'COMPLETED'

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl p-5 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#14141a]/95 border-[#ff6600] shadow-[0_0_25px_rgba(255,102,0,0.25)] ring-1 ring-[#ff6600]/40'
                      : 'bg-[#0f0f14]/85 border-border hover:border-[#ff6600]/50'
                  }`}
                >
                  <div>
                    {/* Status & Game Tag */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isLive
                              ? 'bg-emerald-500 animate-pulse'
                              : isOpen
                              ? 'bg-[#ff6600] animate-pulse'
                              : 'bg-zinc-500'
                          }`}
                        />
                        <span
                          className={`font-mono text-[10px] font-bold tracking-wider uppercase ${
                            isLive
                              ? 'text-emerald-400'
                              : isOpen
                              ? 'text-[#ff6600]'
                              : 'text-text-muted'
                          }`}
                        >
                          {isLive
                            ? 'LIVE BROADCAST'
                            : isOpen
                            ? 'OPEN REGISTRATION'
                            : isFinished
                            ? 'COMPLETED'
                            : 'ROSTER LOCKED'}
                        </span>
                      </div>

                      <span className="font-mono text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-text-secondary uppercase">
                        {gameName}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg md:text-xl font-bold text-white tracking-tight mb-2">
                      {t.name}
                    </h3>

                    {/* Specs Row */}
                    <div className="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-xl bg-[#14141a] border border-border/60 mb-3 font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-text-muted uppercase block">ENTRY FEE</span>
                        <span className="text-[#ff6600] font-bold">{fee}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-muted uppercase block">PRIZE POOL</span>
                        <span className="text-white font-bold">{prize}</span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1 font-mono text-[11px] mb-4">
                      <div className="flex justify-between text-text-muted">
                        <span>ROSTER SLOTS</span>
                        <span className="text-white font-bold">
                          {regCount} / {maxPlayers} PLAYERS
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-border/40">
                        <div
                          className="h-full bg-[#ff6600] transition-all duration-500"
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    {isOpen ? (
                      <>
                        <button
                          onClick={() => {
                            if (onSelectTournament) onSelectTournament(t)
                            if (onRegister) onRegister(t)
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#ff6600] hover:bg-[#ff7711] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,102,0,0.3)] text-center"
                        >
                          REGISTER NOW
                        </button>
                        <button
                          onClick={() => onSelectTournament?.(t)}
                          className={`py-2 px-3 rounded-xl font-mono text-xs transition-colors border ${
                            isSelected
                              ? 'bg-[#ff6600]/20 text-[#ff6600] border-[#ff6600] font-bold'
                              : 'bg-transparent text-text-secondary border-border hover:border-white'
                          }`}
                        >
                          {isSelected ? '✓ ACTIVE' : 'SELECT'}
                        </button>
                      </>
                    ) : isLive ? (
                      <>
                        <button
                          onClick={() => {
                            if (onSelectTournament) onSelectTournament(t)
                            onNavigate?.(2)
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          WATCH LIVE ↗
                        </button>
                        <button
                          onClick={() => {
                            if (onSelectTournament) onSelectTournament(t)
                            onNavigate?.(3)
                          }}
                          className="py-2 px-3 rounded-xl font-mono text-xs text-text-secondary border border-border hover:border-white transition-colors"
                        >
                          BRACKET
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          if (onSelectTournament) onSelectTournament(t)
                          onNavigate?.(3)
                        }}
                        className="flex-1 py-2 px-3 rounded-xl font-mono text-xs text-text-secondary hover:text-white border border-border hover:border-[#ff6600] transition-colors uppercase tracking-wider"
                      >
                        VIEW BRACKET & ROSTER →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#121215]/80 border border-border p-8 rounded-2xl text-center space-y-2 max-w-md backdrop-blur-md">
            <h3 className="text-xl font-display font-bold text-white">NO TOURNAMENTS FOUND</h3>
            <p className="font-mono text-xs text-text-muted">
              No tournaments currently match the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

