'use client'

import React from 'react'
import { SCENES } from '@/lib/types'

interface NextSceneButtonProps {
  activeScene: number
  onNavigate: (index: number) => void
}

export default function NextSceneButton({
  activeScene,
  onNavigate,
}: NextSceneButtonProps) {
  const nextIndex = (activeScene + 1) % SCENES.length

  return (
    <button
      onClick={() => onNavigate(nextIndex)}
      aria-label="Next Section"
      className="fixed right-5 md:right-8 top-1/2 -translate-y-1/2 z-40 group flex items-center justify-center w-12 h-12 md:w-13 md:h-13 rounded-full bg-[#0a0a0d]/80 hover:bg-[#ff6600] border border-[#ff6600]/40 hover:border-[#ff6600] text-[#ff6600] hover:text-black transition-all duration-300 backdrop-blur-md shadow-[0_0_15px_rgba(255,102,0,0.2)] hover:shadow-[0_0_25px_rgba(255,102,0,0.6)] active:scale-95 select-none cursor-pointer"
    >
      {/* Sleek Forward Arrow SVG */}
      <svg
        className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </svg>
    </button>
  )
}
