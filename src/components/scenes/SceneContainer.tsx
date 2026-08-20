'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCENES, type SceneId } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface SceneContainerProps {
  children: React.ReactNode
  onSceneChange?: (index: number) => void
}

export default function SceneContainer({
  children,
  onSceneChange,
}: SceneContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)
  const onSceneChangeRef = useRef(onSceneChange)
  const [isMobile, setIsMobile] = useState(false)

  // Keep callback ref in sync without triggering effect re-runs
  useEffect(() => {
    onSceneChangeRef.current = onSceneChange
  }, [onSceneChange])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile || !panelsRef.current || !containerRef.current) return

    const panels = panelsRef.current
    const totalPanels = SCENES.length

    // Wait a tick for layout to settle
    const timer = setTimeout(() => {
      const totalWidth = panels.scrollWidth - window.innerWidth

      if (totalWidth <= 0) return

      const ctx = gsap.context(() => {
        gsap.to(panels, {
          x: -totalWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            pin: true,
            scrub: 1,
            end: () => `+=${totalWidth}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress
              const sceneIndex = Math.min(
                Math.floor(progress * totalPanels),
                totalPanels - 1
              )
              onSceneChangeRef.current?.(sceneIndex)
            },
          },
        })
      }, containerRef)

      // Store ctx for cleanup
      ;(containerRef.current as any).__gsapCtx = ctx
    }, 100)

    return () => {
      clearTimeout(timer)
      const ctx = (containerRef.current as any)?.__gsapCtx
      if (ctx) ctx.revert()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [isMobile])

  // Mobile: vertical layout
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex flex-col">{children}</div>
      </div>
    )
  }

  // Desktop: horizontal scroll
  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <div
        ref={panelsRef}
        className="flex h-screen will-change-transform"
        style={{ width: `${SCENES.length * 100}vw` }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Individual Scene Panel ──────────────────────────────────────────

interface ScenePanelProps {
  id: SceneId
  children: React.ReactNode
  className?: string
}

export function ScenePanel({ id, children, className = '' }: ScenePanelProps) {
  return (
    <section
      id={id}
      className={`relative w-screen h-screen flex-shrink-0 overflow-hidden ${className}`}
      aria-label={`${id} scene`}
    >
      {children}
    </section>
  )
}
