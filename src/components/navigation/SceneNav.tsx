'use client'

import { useCallback } from 'react'
import { SCENES } from '@/lib/types'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SceneNavProps {
  activeScene: number
  hasLive: boolean
  onNavigate?: (index: number) => void
}

export default function SceneNav({ activeScene, hasLive, onNavigate }: SceneNavProps) {
  const handleNavClick = useCallback((index: number) => {
    if (onNavigate) {
      onNavigate(index)
      return
    }

    const isMobile = window.innerWidth < 768

    if (isMobile) {
      const section = document.getElementById(SCENES[index].id)
      section?.scrollIntoView({ behavior: 'smooth' })
    } else {
      const triggers = ScrollTrigger.getAll()
      const trigger = triggers.find((t) => t.vars.id === 'horizontal-scroll') || triggers[0]
      if (trigger) {
        const progress = index / (SCENES.length - 1)
        const targetY = trigger.start + (trigger.end - trigger.start) * progress
        const lenis = (window as any).__lenis
        if (lenis) {
          lenis.scrollTo(targetY, { duration: 1.2 })
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      }
    }
  }, [onNavigate])

  const navItems = [
    { label: 'LIVE', sceneIndex: 2 },
    { label: 'TOURNAMENTS', sceneIndex: 1 },
    { label: 'RESULTS', sceneIndex: 4 },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-border/80"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(12px)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Brand Logo / Home */}
      <button
        onClick={() => handleNavClick(0)}
        className="flex items-center gap-3 text-left group"
        aria-label="Triple Stars - Return to home"
      >
        <span className="font-display text-sm md:text-base font-bold tracking-widest text-text-primary group-hover:text-accent transition-colors">
          TRIPLE STARS
        </span>
        <span className="hidden sm:inline-block font-mono text-[10px] text-text-secondary border border-border px-1.5 py-0.5 tracking-wider">
          OS v2.6
        </span>
      </button>

      {/* Nav links */}
      <div className="flex items-center gap-6 md:gap-8">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item.sceneIndex)}
            className={`font-mono text-xs tracking-wider transition-all relative py-1 ${
              activeScene === item.sceneIndex
                ? 'text-text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            aria-current={activeScene === item.sceneIndex ? 'page' : undefined}
          >
            {item.label === 'LIVE' && hasLive && (
              <span className="status-dot status-live mr-2 inline-block -translate-y-px" />
            )}
            {item.label}
            {activeScene === item.sceneIndex && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
            )}
          </button>
        ))}

        {/* Direct Admin Control Console */}
        <a
          href="/admin"
          className="font-mono text-[11px] font-bold tracking-wider px-3 py-1.5 rounded border border-accent/60 bg-accent/10 text-accent hover:bg-accent hover:text-black transition-all"
        >
          ⚙ ADMIN
        </a>
      </div>
    </nav>
  )
}
