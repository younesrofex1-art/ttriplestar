'use client'

import { useEffect, useRef, useState } from 'react'
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

  // Desktop horizontal pinning & scroll
  useEffect(() => {
    if (isMobile || !panelsRef.current || !containerRef.current) return

    const container = containerRef.current
    const panels = panelsRef.current
    const totalPanels = SCENES.length

    let st: ScrollTrigger | null = null

    // Give DOM a frame to compute exact dimensions
    const frameId = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        const scrollDistance = (totalPanels - 1) * window.innerHeight * 1.2

        gsap.to(panels, {
          x: () => -(panels.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            id: 'horizontal-scroll',
            trigger: container,
            pin: true,
            scrub: 0.8,
            start: 'top top',
            end: () => `+=${scrollDistance}`,
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
      }, container)

      ScrollTrigger.refresh()
    })

    // Keyboard arrow navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
        const triggers = ScrollTrigger.getAll()
        const trigger = triggers.find((t) => t.vars.id === 'horizontal-scroll') || triggers[0]
        if (trigger) {
          const currentProgress = trigger.progress
          const currentIndex = Math.round(currentProgress * (totalPanels - 1))
          const nextIndex = Math.min(currentIndex + 1, totalPanels - 1)
          const targetY = trigger.start + (trigger.end - trigger.start) * (nextIndex / (totalPanels - 1))
          const lenis = (window as any).__lenis
          if (lenis) lenis.scrollTo(targetY)
          else window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        const triggers = ScrollTrigger.getAll()
        const trigger = triggers.find((t) => t.vars.id === 'horizontal-scroll') || triggers[0]
        if (trigger) {
          const currentProgress = trigger.progress
          const currentIndex = Math.round(currentProgress * (totalPanels - 1))
          const prevIndex = Math.max(currentIndex - 1, 0)
          const targetY = trigger.start + (trigger.end - trigger.start) * (prevIndex / (totalPanels - 1))
          const lenis = (window as any).__lenis
          if (lenis) lenis.scrollTo(targetY)
          else window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', handleKeyDown)
      ScrollTrigger.getById('horizontal-scroll')?.kill()
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

  // Desktop: horizontal container
  return (
    <div ref={containerRef} className="relative overflow-hidden w-full">
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
    <div
      id={id}
      className={`relative w-screen h-screen flex-shrink-0 overflow-hidden ${className}`}
      aria-label={`${id} scene`}
    >
      {children}
    </div>
  )
}
