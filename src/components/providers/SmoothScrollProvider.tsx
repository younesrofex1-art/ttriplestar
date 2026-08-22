'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // On mobile devices, use native smooth touch scrolling without Lenis touch hijacking
    const lenis = new Lenis({
      duration: isMobile ? 0.5 : 0.75,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 0.95,
      touchMultiplier: 0, // Disable touch hijacking for 100% native mobile inertia
      syncTouch: false,
      infinite: false,
    })

    lenisRef.current = lenis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__lenis = lenis

    // Sync Lenis scroll with ScrollTrigger on desktop/tablet
    if (!isMobile) {
      lenis.on('scroll', ScrollTrigger.update)
      const ticker = (time: number) => {
        lenis.raf(time * 1000)
      }
      gsap.ticker.add(ticker)
      gsap.ticker.lagSmoothing(500, 33)

      return () => {
        gsap.ticker.remove(ticker)
        lenis.destroy()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__lenis
      }
    }

    return () => {
      lenis.destroy()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__lenis
    }
  }, [])

  return <>{children}</>
}
