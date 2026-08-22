'use client'

import React from 'react'

interface SystemSceneProps {
  onEnterSystem?: () => void
  onRegister?: () => void
}

export function SystemScene({ onEnterSystem, onRegister }: SystemSceneProps) {
  const handleAction = onRegister || onEnterSystem

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-transparent text-[#ededed] relative overflow-hidden select-none">
      {/* Background Ambient Radial Glow */}
      <div className="absolute -top-24 -left-24 w-[480px] h-[480px] bg-[#ff6600]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Grid texture */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-grid" />

      <div className="relative z-10 max-w-2xl">
        {/* Top Glowing Stars HUD Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#ff6600]/10 border border-[#ff6600]/30 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(255,102,0,0.15)]">
          <span className="text-[#ff6600] text-xs tracking-wider flex items-center gap-1 drop-shadow-[0_0_8px_rgba(255,102,0,0.8)]">
            ★ ★ ★
          </span>
          <span className="font-mono text-[11px] text-zinc-300 font-semibold tracking-[0.2em] uppercase">
            ESPORTS ARENA
          </span>
        </div>

        {/* Hero Title with Bold Typography & Vibrant Orange Glow */}
        <div className="mb-6">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black tracking-tight uppercase leading-[0.88] mb-2">
            <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.15)] block">
              TRIPLE
            </span>
            <span className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-[#ff5500] via-[#ff7700] to-[#ffaa00] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,102,0,0.6)]">
                STARS
              </span>
              <span className="text-[#ff6600] text-3xl sm:text-5xl md:text-6xl drop-shadow-[0_0_20px_rgba(255,102,0,0.8)] inline-block animate-pulse">
                ✦
              </span>
            </span>
          </h1>

          <p className="text-xs md:text-sm font-mono text-text-secondary tracking-[0.25em] uppercase mt-4">
            COMPETITIVE GAMING & LIVE TOURNAMENTS
          </p>
        </div>

        {/* Action Button: Register for a Tournament */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            type="button"
            onClick={handleAction}
            className="group relative inline-flex items-center justify-center gap-3.5 px-8 py-4 rounded-xl font-mono text-xs md:text-sm font-bold tracking-[0.16em] uppercase text-black bg-gradient-to-r from-[#ff6600] via-[#ff7711] to-[#ff8800] hover:from-[#ff7711] hover:to-[#ff9922] shadow-[0_0_25px_rgba(255,102,0,0.45)] hover:shadow-[0_0_40px_rgba(255,102,0,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>REGISTER FOR A TOURNAMENT</span>
            <span className="text-black font-bold text-base group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </button>
        </div>

        {/* Live Registration Status Tag */}
        <div className="flex items-center gap-3 mt-5 text-[11px] font-mono text-text-muted tracking-wider">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            REGISTRATIONS OPEN
          </span>
          <span className="text-border-strong">•</span>
          <span>CASABLANCA & AGADIR</span>
        </div>
      </div>
    </div>
  )
}
