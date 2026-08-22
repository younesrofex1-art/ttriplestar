'use client'

import React, { useEffect, useRef } from 'react'

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Pause video rendering when tab is inactive to free up CPU & GPU
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!videoRef.current) return
      if (document.hidden) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {})
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none gpu-accelerated"
      aria-hidden="true"
      style={{ transform: 'translate3d(0,0,0)' }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover scale-105 brightness-75 contrast-110 will-change-transform"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay system for readability and sleek esports atmosphere */}
      {/* Base dark tint */}
      <div className="absolute inset-0 bg-[#0a0a0a]/80" />

      {/* Vignette edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.85)_80%)]" />

      {/* Top & Bottom gradient fades for nav and footer contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-transparent to-[#0a0a0a]/95 pointer-events-none" />

      {/* Subtle fine scanlines/grid overlay */}
      <div className="absolute inset-0 opacity-10 bg-grid pointer-events-none" />
    </div>
  )
}
