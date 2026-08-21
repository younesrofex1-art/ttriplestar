'use client'

import React, { useState } from 'react'
import { SCENES } from '@/lib/types'

interface NextSceneButtonProps {
  activeScene: number
  onNavigate: (index: number) => void
}

export default function NextSceneButton({
  activeScene,
  onNavigate,
}: NextSceneButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const total = SCENES.length
  const nextIndex = (activeScene + 1) % total
  const nextScene = SCENES[nextIndex]

  const handleNext = () => {
    onNavigate(nextIndex)
  }

  const handlePrev = () => {
    const prevIndex = (activeScene - 1 + total) % total
    onNavigate(prevIndex)
  }

  return (
    <div
      className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mini Up/Prev Arrow if not on first scene */}
      {activeScene > 0 && (
        <button
          onClick={handlePrev}
          aria-label="Previous Section"
          className="group flex items-center justify-center w-8 h-8 rounded-full bg-[#121216]/80 hover:bg-[#ff6600]/20 border border-border hover:border-[#ff6600] text-text-secondary hover:text-[#ff6600] transition-all backdrop-blur-md"
          title="Previous section"
        >
          <span className="text-xs transition-transform group-hover:-translate-y-0.5">↑</span>
        </button>
      )}

      {/* Main Next Section Button */}
      <button
        onClick={handleNext}
        aria-label={`Go to next section: ${nextScene.label}`}
        className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#0f0f13]/85 hover:bg-[#18181f]/95 border border-[#ff6600]/40 hover:border-[#ff6600] text-text-primary shadow-[0_0_20px_rgba(255,102,0,0.15)] hover:shadow-[0_0_30px_rgba(255,102,0,0.4)] transition-all duration-300 backdrop-blur-xl"
      >
        {/* Glowing Corner Accents */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#ff6600] opacity-80" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#ff6600] opacity-80" />

        {/* Counter Badge */}
        <div className="font-mono text-[9px] font-bold text-[#ff6600] tracking-widest uppercase mb-1">
          {String(activeScene + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </div>

        {/* Next Arrow Icon */}
        <div className="w-8 h-8 rounded-full bg-[#ff6600]/10 border border-[#ff6600]/50 flex items-center justify-center group-hover:bg-[#ff6600] text-[#ff6600] group-hover:text-black transition-all duration-300 my-0.5">
          <span className="font-bold text-sm transform transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </div>

        {/* Action Label */}
        <span className="font-mono text-[9px] tracking-wider text-text-secondary group-hover:text-text-primary uppercase mt-1">
          NEXT
        </span>

        {/* Tooltip on Hover */}
        <div
          className={`absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#141418]/95 border border-[#ff6600]/60 text-text-primary font-mono text-[10px] whitespace-nowrap pointer-events-none transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.8)] ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <span className="text-[#ff6600] font-bold mr-1">JUMP TO:</span>
          <span className="tracking-wider">{nextScene.label}</span>
          <span className="ml-1 text-[8px] text-text-muted">→</span>
        </div>
      </button>
    </div>
  )
}
