'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import SceneContainer, { ScenePanel } from '@/components/scenes/SceneContainer'
import SceneNav from '@/components/navigation/SceneNav'
import SceneIndicator from '@/components/navigation/SceneIndicator'
import NextSceneButton from '@/components/navigation/NextSceneButton'
import { SystemScene } from '@/components/scenes/SystemScene'
import { TournamentScene } from '@/components/scenes/TournamentScene'
import { LiveScene } from '@/components/scenes/LiveScene'
import { BracketScene } from '@/components/scenes/BracketScene'
import { ResultsScene } from '@/components/scenes/ResultsScene'
import { ContactScene } from '@/components/scenes/ContactScene'
import RegistrationPanel from '@/components/registration/RegistrationPanel'
import BackgroundVideo from '@/components/background/BackgroundVideo'
import { useTournament, useMatches, useStreams } from '@/hooks/use-tournament-data'
import { SCENES, type Tournament } from '@/lib/types'

// Lazy-load the 3D controller scene without SSR
const ControllerScene = dynamic(
  () => import('@/components/three/ControllerScene'),
  { ssr: false }
)

export default function HomePage() {
  const [activeScene, setActiveScene] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [registeringTournament, setRegisteringTournament] = useState<Tournament | null>(null)

  // Live Supabase data hooks
  const {
    tournament,
    allTournaments,
    publicState,
    registrationCount,
    selectTournament,
  } = useTournament()
  const { matches, rounds, liveMatch } = useMatches(tournament?.id)
  const { liveStream } = useStreams(tournament?.id, tournament?.stream_url)

  const handleSceneChange = useCallback((index: number) => {
    setActiveScene(index)
  }, [])

  const handleScrollProgress = useCallback((progress: number) => {
    setScrollProgress(progress)
  }, [])

  // Programmatic smooth scroll to any horizontal scene
  const navigateToScene = useCallback((index: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    if (isMobile) {
      const targetId = SCENES[index]?.id
      if (targetId) {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
      }
      return
    }

    const triggers = ScrollTrigger.getAll()
    const trigger = triggers.find((t) => t.vars.id === 'horizontal-scroll') || triggers[0]
    if (trigger) {
      const boundedIndex = Math.max(0, Math.min(index, SCENES.length - 1))
      const progress = boundedIndex / (SCENES.length - 1)
      const targetY = trigger.start + (trigger.end - trigger.start) * progress
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, opts: { duration: number }) => void } }).__lenis
      if (lenis) {
        lenis.scrollTo(targetY, { duration: 0.9 })
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' })
      }
    }
  }, [])

  const handleOpenRegistration = useCallback(
    (tourney?: Tournament) => {
      if (tourney) {
        setRegisteringTournament(tourney)
        selectTournament(tourney)
      } else {
        setRegisteringTournament(tournament)
      }
      setRegistrationOpen(true)
    },
    [tournament, selectTournament]
  )

  const handleCloseRegistration = useCallback(() => {
    setRegistrationOpen(false)
    setRegisteringTournament(null)
  }, [])

  const hasLive = publicState === 'LIVE'

  return (
    <SmoothScrollProvider>
      {/* Dark Ambient Video Background */}
      <BackgroundVideo />

      {/* Top Navigation Bar */}
      <SceneNav
        activeScene={activeScene}
        hasLive={hasLive}
        onNavigate={navigateToScene}
      />

      {/* 3D Controller Layer (renders in fixed overlay, continuously reactive to scroll & mouse) */}
      <ControllerScene activeScene={activeScene} scrollProgress={scrollProgress} />

      {/* Horizontal GSAP Scene Container */}
      <SceneContainer
        onSceneChange={handleSceneChange}
        onScrollProgress={handleScrollProgress}
      >
        {/* Scene 01 — System */}
        <ScenePanel id="system">
          <SystemScene onEnterSystem={() => navigateToScene(1)} />
        </ScenePanel>

        {/* Scene 02 — Tournament */}
        <ScenePanel id="tournament">
          <TournamentScene
            tournament={tournament}
            allTournaments={allTournaments}
            publicState={publicState}
            registrationCount={registrationCount}
            onRegister={handleOpenRegistration}
            onSelectTournament={selectTournament}
            onNavigate={navigateToScene}
          />
        </ScenePanel>

        {/* Scene 03 — Live */}
        <ScenePanel id="live">
          <LiveScene
            tournament={publicState === 'LIVE' ? tournament : null}
            liveMatch={liveMatch}
            liveStream={liveStream}
            onNavigate={navigateToScene}
          />
        </ScenePanel>

        {/* Scene 04 — Bracket */}
        <ScenePanel id="bracket">
          <BracketScene
            tournament={tournament}
            matches={matches}
            rounds={rounds}
            onNavigate={navigateToScene}
          />
        </ScenePanel>

        {/* Scene 05 — Results */}
        <ScenePanel id="results">
          <ResultsScene
            tournament={tournament}
            matches={matches}
            onNavigate={navigateToScene}
          />
        </ScenePanel>

        {/* Scene 06 — Connect, Location & Support */}
        <ScenePanel id="contact">
          <ContactScene onNavigate={navigateToScene} />
        </ScenePanel>
      </SceneContainer>

      {/* Next Scene Quick Navigation Button */}
      <NextSceneButton activeScene={activeScene} onNavigate={navigateToScene} />

      {/* Bottom Scene Indicators */}
      <SceneIndicator activeScene={activeScene} onNavigate={navigateToScene} />

      {/* Registration Slide-in Panel */}
      {(registeringTournament || tournament) && (
        <RegistrationPanel
          tournament={registeringTournament || tournament!}
          isOpen={registrationOpen}
          onClose={handleCloseRegistration}
        />
      )}
    </SmoothScrollProvider>
  )
}
