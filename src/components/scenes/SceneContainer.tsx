'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCENES, type SceneId } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface SceneContainerProps {
  children: React.ReactNode
  onSceneChange?: (index: number) => void
  onScrollProgress?: (progress: number) => void
}

export default function SceneContainer({
  children,
  onSceneChange,
  onScrollProgress,
}: SceneContainerProps) {
  const scrollWrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const onSceneChangeRef = useRef(onSceneChange)
  const onScrollProgressRef = useRef(onScrollProgress)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    onSceneChangeRef.current = onSceneChange
  }, [onSceneChange])

  useEffect(() => {
    onScrollProgressRef.current = onScrollProgress
  }, [onScrollProgress])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Desktop horizontal translation driven by CSS sticky + GSAP scrub (ZERO pin-spacer DOM reparenting)
  useEffect(() => {
    if (isMobile || !trackRef.current || !scrollWrapperRef.current) return

    const scrollWrapper = scrollWrapperRef.current
    const track = trackRef.current
    const totalPanels = SCENES.length

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          id: 'horizontal-scroll',
          trigger: scrollWrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress
            onScrollProgressRef.current?.(progress)
            const sceneIndex = Math.min(
              Math.floor(progress * totalPanels),
              totalPanels - 1
            )
            onSceneChangeRef.current?.(sceneIndex)
          },
        },
      })
    }, scrollWrapper)

    ScrollTrigger.refresh()

    // Keyboard arrow navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      const trigger = ScrollTrigger.getById('horizontal-scroll')
      if (!trigger) return

      if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault()
        const currentProgress = trigger.progress
        const currentIndex = Math.round(currentProgress * (totalPanels - 1))
        const nextIndex = Math.min(currentIndex + 1, totalPanels - 1)
        const targetY =
          trigger.start +
          (trigger.end - trigger.start) * (nextIndex / (totalPanels - 1))
        const lenis = (window as any).__lenis
        if (lenis) lenis.scrollTo(targetY, { duration: 1.2 })
        else window.scrollTo({ top: targetY, behavior: 'smooth' })
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        const currentProgress = trigger.progress
        const currentIndex = Math.round(currentProgress * (totalPanels - 1))
        const prevIndex = Math.max(currentIndex - 1, 0)
        const targetY =
          trigger.start +
          (trigger.end - trigger.start) * (prevIndex / (totalPanels - 1))
        const lenis = (window as any).__lenis
        if (lenis) lenis.scrollTo(targetY, { duration: 1.2 })
        else window.scrollTo({ top: targetY, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      ctx.revert()
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

  // Desktop: CSS Sticky container with horizontal translation track
  return (
    <div
      ref={scrollWrapperRef}
      className="relative w-full"
      style={{ height: `${SCENES.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-screen will-change-transform"
          style={{ width: `${SCENES.length * 100}vw` }}
        >
          {children}
        </div>
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
