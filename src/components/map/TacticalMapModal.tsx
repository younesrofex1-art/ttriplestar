'use client'

import React, { useEffect } from 'react'
import ArenaMap, { ARENA_COORDINATES, GOOGLE_MAPS_URL } from './ArenaMap'

interface TacticalMapModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TacticalMapModal({ isOpen, onClose }: TacticalMapModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-[#0b0b10] border border-[#ff6600]/50 shadow-[0_0_50px_rgba(255,102,0,0.25)] flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar HUD */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-strong/90 bg-[#121218]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6600] animate-pulse" />
            <div>
              <div className="font-mono text-[10px] text-[#ff6600] font-bold tracking-widest uppercase">
                TACTICAL RADAR // HQ COORDINATES
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight">
                TRIPLE STARS ESPORTS ARENA
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff6600] hover:bg-[#ff7711] text-black font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,102,0,0.3)]"
            >
              <span>OPEN IN GOOGLE MAPS</span>
              <span>↗</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1a1a24] hover:bg-[#ff6600] hover:text-black border border-border flex items-center justify-center font-mono text-xs font-bold transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Large Tactical Map Canvas */}
        <div className="p-4 sm:p-5 flex-1">
          <ArenaMap
            height="420px"
            initialZoom={18}
            interactive={true}
            showControls={true}
            className="shadow-2xl"
          />

          {/* Quick Info Grid below map */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#121218] border border-border">
              <span className="text-[10px] text-text-muted uppercase block mb-0.5">
                EXACT GPS COORDINATES
              </span>
              <span className="text-[#ff6600] font-bold text-[11px]">
                {ARENA_COORDINATES[0]}° N, {Math.abs(ARENA_COORDINATES[1])}° W
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#121218] border border-border">
              <span className="text-[10px] text-text-muted uppercase block mb-0.5">
                OPERATING HOURS
              </span>
              <span className="text-white font-bold text-[11px]">
                DAILY: 10:00 AM – 02:00 AM
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#121218] border border-border">
              <span className="text-[10px] text-text-muted uppercase block mb-0.5">
                FACILITY HARDWARE
              </span>
              <span className="text-zinc-300 font-bold text-[11px]">
                240Hz Gaming Rigs • PS5 Pro • 1Gbps
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border-strong/90 bg-[#0d0d12] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-[#ff6600]">📍</span>
            <span>Boulevard Hassan II • Gaming & Tournament Complex</span>
          </div>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden w-full py-2 rounded-lg bg-[#ff6600] text-black font-bold text-center"
          >
            OPEN IN GOOGLE MAPS ↗
          </a>
        </div>
      </div>
    </div>
  )
}
