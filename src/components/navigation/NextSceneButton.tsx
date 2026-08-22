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
  const canGoBack = activeScene > 0
  const canGoForward = activeScene < SCENES.length - 1

  return (
    <>
      {/* ─── Desktop & Tablet Horizontal Navigation (>= 768px) ─── */}

      {/* Desktop Previous Section (Left Arrow ←) */}
      {canGoBack && (
        <button
          onClick={() => onNavigate(activeScene - 1)}
          aria-label="Previous Section"
          className="hidden md:flex fixed left-5 md:left-8 top-1/2 -translate-y-1/2 z-40 group items-center justify-center w-12 h-12 md:w-13 md:h-13 rounded-full bg-[#0a0a0d]/80 hover:bg-[#ff6600] border border-[#ff6600]/40 hover:border-[#ff6600] text-[#ff6600] hover:text-black transition-all duration-300 backdrop-blur-md shadow-[0_0_15px_rgba(255,102,0,0.2)] hover:shadow-[0_0_25px_rgba(255,102,0,0.6)] active:scale-95 select-none cursor-pointer"
        >
          <svg
            className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Desktop Next Section (Right Arrow →) */}
      {canGoForward && (
        <button
          onClick={() => onNavigate(activeScene + 1)}
          aria-label="Next Section"
          className="hidden md:flex fixed right-5 md:right-8 top-1/2 -translate-y-1/2 z-40 group items-center justify-center w-12 h-12 md:w-13 md:h-13 rounded-full bg-[#0a0a0d]/80 hover:bg-[#ff6600] border border-[#ff6600]/40 hover:border-[#ff6600] text-[#ff6600] hover:text-black transition-all duration-300 backdrop-blur-md shadow-[0_0_15px_rgba(255,102,0,0.2)] hover:shadow-[0_0_25px_rgba(255,102,0,0.6)] active:scale-95 select-none cursor-pointer"
        >
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
      )}

      {/* ─── Mobile Vertical Top-and-Bottom Navigation (< 768px) ─── */}
      <div className="md:hidden fixed bottom-6 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
        {/* Mobile Up Arrow (↑) */}
        {canGoBack && (
          <button
            onClick={() => onNavigate(activeScene - 1)}
            aria-label="Scroll Up to Previous Section"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#0a0a0d]/85 hover:bg-[#ff6600] border border-[#ff6600]/50 hover:border-[#ff6600] text-[#ff6600] hover:text-black transition-all duration-200 backdrop-blur-md shadow-[0_0_15px_rgba(255,102,0,0.3)] active:scale-95 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        )}

        {/* Mobile Down Arrow (↓) */}
        {canGoForward && (
          <button
            onClick={() => onNavigate(activeScene + 1)}
            aria-label="Scroll Down to Next Section"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#0a0a0d]/85 hover:bg-[#ff6600] border border-[#ff6600]/50 hover:border-[#ff6600] text-[#ff6600] hover:text-black transition-all duration-200 backdrop-blur-md shadow-[0_0_15px_rgba(255,102,0,0.3)] active:scale-95 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14" />
              <path d="M19 12l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </>
  )
}
