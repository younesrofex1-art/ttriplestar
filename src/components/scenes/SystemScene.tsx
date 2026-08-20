'use client'

import React from 'react'

interface SystemSceneProps {
  onEnterSystem?: () => void
}

export function SystemScene({ onEnterSystem }: SystemSceneProps) {
  return (
    <div className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed] relative overflow-hidden select-none">
      {/* Subtle Grid texture */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-grid"
      />

      <div className="relative z-10 max-w-2xl">
        <div className="mb-6">
          <div className="font-mono text-xs text-text-secondary tracking-[0.25em] uppercase mb-3">
            TOURNAMENT OPERATING SYSTEM
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-extrabold tracking-tighter leading-none mb-3">
            TRIPLE<br />STARS
          </h1>
          <h2 className="text-xl md:text-2xl font-display font-medium text-text-secondary tracking-tight">
            GAMING STATION
          </h2>
        </div>

        <div className="h-px w-full max-w-md bg-border my-8" />

        <div className="mb-10 flex items-center gap-6">
          <div>
            <div className="text-[10px] font-mono text-text-secondary tracking-widest uppercase mb-1.5">
              SYSTEM STATUS
            </div>
            <div className="flex items-center gap-2.5">
              <span className="status-dot status-online" />
              <span className="font-mono text-accent text-xs font-bold tracking-widest">
                ONLINE
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          <div>
            <div className="text-[10px] font-mono text-text-secondary tracking-widest uppercase mb-1.5">
              NETWORK
            </div>
            <div className="font-mono text-xs text-text-primary tracking-widest">
              CASABLANCA HQ
            </div>
          </div>
        </div>

        <button
          onClick={onEnterSystem}
          className="group inline-flex items-center gap-4 border border-border-strong hover:border-accent bg-bg-surface/80 hover:bg-accent/10 px-8 py-4 font-mono text-xs tracking-[0.2em] uppercase text-text-primary hover:text-accent transition-all duration-300 backdrop-blur-sm"
        >
          <span>ENTER SYSTEM</span>
          <span className="group-hover:translate-x-1.5 transition-transform duration-300 text-accent">
            →
          </span>
        </button>
      </div>
    </div>
  )
}
