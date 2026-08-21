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
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => 1 - Math.pow(1 - t, 3), // Smooth cubic ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    })

    lenisRef.current = lenis
    ;(window as any).__lenis = lenis

    // Sync Lenis scroll with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Run Lenis on GSAP ticker
    const ticker = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(500, 33)

    return () => {
      gsap.ticker.remove(ticker)
      lenis.destroy()
      delete (window as any).__lenis
    }
  }, [])

  return <>{children}</>
}
