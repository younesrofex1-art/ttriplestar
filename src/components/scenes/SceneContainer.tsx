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

  // Mobile: Vertical Top-to-Bottom Scrolling & Active Scene Intersection Tracking
  useEffect(() => {
    if (!isMobile) return

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.25,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sceneIndex = SCENES.findIndex((s) => s.id === entry.target.id)
          if (sceneIndex !== -1) {
            onSceneChangeRef.current?.(sceneIndex)
          }
        }
      })
    }, observerOptions)

    SCENES.forEach((scene) => {
      const el = document.getElementById(scene.id)
      if (el) observer.observe(el)
    })

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalHeight))
        onScrollProgressRef.current?.(progress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

  // Desktop & Tablet (>= 768px): Horizontal translation driven by CSS sticky + GSAP scrub + Section Snapping
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
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress
            onScrollProgressRef.current?.(progress)
            const sceneIndex = Math.min(
              Math.round(progress * (totalPanels - 1)),
              totalPanels - 1
            )
            onSceneChangeRef.current?.(sceneIndex)
          },
        },
      })
    }, scrollWrapper)

    ScrollTrigger.refresh()

    // Smooth section transition helper
    let isAnimating = false
    let accumulatedDelta = 0
    let resetDeltaTimer: NodeJS.Timeout | null = null

    const scrollToScene = (targetIndex: number) => {
      const trigger = ScrollTrigger.getById('horizontal-scroll')
      if (!trigger) return

      const boundedIndex = Math.max(0, Math.min(targetIndex, totalPanels - 1))
      const targetY =
        trigger.start +
        (trigger.end - trigger.start) * (boundedIndex / (totalPanels - 1))

      isAnimating = true
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, opts: { duration: number; onComplete?: () => void }) => void } }).__lenis

      if (lenis) {
        lenis.scrollTo(targetY, {
          duration: 0.9,
          onComplete: () => {
            setTimeout(() => {
              isAnimating = false
              accumulatedDelta = 0
            }, 100)
          },
        })
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' })
        setTimeout(() => {
          isAnimating = false
          accumulatedDelta = 0
        }, 700)
      }
    }

    // Wheel listener for snappy, one-section-per-scroll feel
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null
      if (target) {
        const dialog = target.closest('[role="dialog"]')
        if (dialog) return

        const scrollable = target.closest(
          '.overflow-y-auto, .overflow-x-auto'
        ) as HTMLElement | null
        if (scrollable) {
          const isScrollableY =
            scrollable.scrollHeight > scrollable.clientHeight + 2
          const isScrollableX =
            scrollable.scrollWidth > scrollable.clientWidth + 2
          if (isScrollableY && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            const atTop = scrollable.scrollTop <= 0 && e.deltaY < 0
            const atBottom =
              scrollable.scrollTop + scrollable.clientHeight >=
                scrollable.scrollHeight - 2 && e.deltaY > 0
            if (!atTop && !atBottom) return
          }
          if (isScrollableX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            const atLeft = scrollable.scrollLeft <= 0 && e.deltaX < 0
            const atRight =
              scrollable.scrollLeft + scrollable.clientWidth >=
                scrollable.scrollWidth - 2 && e.deltaX > 0
            if (!atLeft && !atRight) return
          }
        }
      }

      e.preventDefault()

      if (isAnimating) return

      accumulatedDelta += e.deltaY

      if (resetDeltaTimer) clearTimeout(resetDeltaTimer)
      resetDeltaTimer = setTimeout(() => {
        accumulatedDelta = 0
      }, 200)

      if (Math.abs(accumulatedDelta) < 35) return

      const trigger = ScrollTrigger.getById('horizontal-scroll')
      if (!trigger) return

      const direction = accumulatedDelta > 0 ? 1 : -1
      accumulatedDelta = 0

      const currentProgress = trigger.progress
      const currentIndex = Math.round(currentProgress * (totalPanels - 1))
      const nextIndex = Math.max(
        0,
        Math.min(currentIndex + direction, totalPanels - 1)
      )

      if (nextIndex !== currentIndex) {
        scrollToScene(nextIndex)
      }
    }

    // Touch swipe gestures on tablet horizontal
    let touchStartY = 0
    let touchStartX = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      touchStartX = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating) return
      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const diffY = touchStartY - touchEndY
      const diffX = touchStartX - touchEndX

      const diff = Math.abs(diffY) > Math.abs(diffX) ? diffY : diffX
      if (Math.abs(diff) < 40) return

      const trigger = ScrollTrigger.getById('horizontal-scroll')
      if (!trigger) return

      const direction = diff > 0 ? 1 : -1
      const currentProgress = trigger.progress
      const currentIndex = Math.round(currentProgress * (totalPanels - 1))
      const nextIndex = Math.max(
        0,
        Math.min(currentIndex + direction, totalPanels - 1)
      )

      if (nextIndex !== currentIndex) {
        scrollToScene(nextIndex)
      }
    }

    // Keyboard arrow navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      const trigger = ScrollTrigger.getById('horizontal-scroll')
      if (!trigger) return

      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        const currentProgress = trigger.progress
        const currentIndex = Math.round(currentProgress * (totalPanels - 1))
        const nextIndex = Math.min(currentIndex + 1, totalPanels - 1)
        scrollToScene(nextIndex)
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        const currentProgress = trigger.progress
        const currentIndex = Math.round(currentProgress * (totalPanels - 1))
        const prevIndex = Math.max(currentIndex - 1, 0)
        scrollToScene(prevIndex)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      if (resetDeltaTimer) clearTimeout(resetDeltaTimer)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
      ctx.revert()
    }
  }, [isMobile])

  // Mobile: vertical layout with top-and-bottom scroll snapping
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex flex-col snap-y snap-mandatory w-full">{children}</div>
      </div>
    )
  }

  // Desktop & Tablets: CSS Sticky container with horizontal translation track
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
      className={`relative w-full md:w-screen min-h-[100dvh] md:h-screen md:flex-shrink-0 snap-start overflow-x-hidden md:overflow-hidden ${className}`}
      aria-label={`${id} scene`}
    >
      {children}
    </div>
  )
}
