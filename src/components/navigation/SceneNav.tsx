'use client'

import { useCallback } from 'react'
import { SCENES } from '@/lib/types'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SceneNavProps {
  activeScene: number
  hasLive: boolean
}

export default function SceneNav({ activeScene, hasLive }: SceneNavProps) {
  const scrollToScene = useCallback((index: number) => {
    const isMobile = window.innerWidth < 768

    if (isMobile) {
      const section = document.getElementById(SCENES[index].id)
      section?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Calculate the scroll position based on horizontal progress
      const triggers = ScrollTrigger.getAll()
      if (triggers.length > 0) {
        const trigger = triggers[0]
        const progress = index / (SCENES.length - 1)
        const scrollTo = trigger.start + (trigger.end - trigger.start) * progress
        window.scrollTo({ top: scrollTo, behavior: 'smooth' })
      }
    }
  }, [])

  const navItems = [
    { label: 'LIVE', sceneIndex: 2 },
    { label: 'TOURNAMENTS', sceneIndex: 1 },
    { label: 'RESULTS', sceneIndex: 4 },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 h-12 border-b border-border"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(8px)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <button
        onClick={() => scrollToScene(0)}
        className="font-display text-sm font-semibold tracking-widest text-text-primary hover:text-accent transition-colors"
        aria-label="Go to home"
      >
        TRIPLE STARS
      </button>

      {/* Nav items */}
      <div className="flex items-center gap-6 md:gap-8">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => scrollToScene(item.sceneIndex)}
            className={`font-mono text-xs tracking-wider transition-colors relative ${
              activeScene === item.sceneIndex
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            aria-current={activeScene === item.sceneIndex ? 'page' : undefined}
          >
            {item.label === 'LIVE' && hasLive && (
              <span className="status-dot status-live mr-1.5 inline-block -translate-y-px" />
            )}
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
