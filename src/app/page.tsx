'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import SceneContainer, { ScenePanel } from '@/components/scenes/SceneContainer'
import SceneNav from '@/components/navigation/SceneNav'
import SceneIndicator from '@/components/navigation/SceneIndicator'
import { SystemScene } from '@/components/scenes/SystemScene'
import { TournamentScene } from '@/components/scenes/TournamentScene'
import { LiveScene } from '@/components/scenes/LiveScene'
import { BracketScene } from '@/components/scenes/BracketScene'
import { ResultsScene } from '@/components/scenes/ResultsScene'
import RegistrationPanel from '@/components/registration/RegistrationPanel'
import { useTournament, useMatches, useStreams } from '@/hooks/use-tournament-data'

// Lazy-load the 3D controller scene
const ControllerScene = dynamic(
  () => import('@/components/three/ControllerScene'),
  { ssr: false }
)

export default function HomePage() {
  const [activeScene, setActiveScene] = useState(0)
  const [registrationOpen, setRegistrationOpen] = useState(false)

  // Data hooks
  const { tournament, publicState, registrationCount, isLoading } = useTournament()
  const { matches, rounds, liveMatch } = useMatches(tournament?.id)
  const { liveStream } = useStreams(tournament?.id)

  const handleSceneChange = useCallback((index: number) => {
    setActiveScene(index)
  }, [])

  const handleOpenRegistration = useCallback(() => {
    setRegistrationOpen(true)
  }, [])

  const handleCloseRegistration = useCallback(() => {
    setRegistrationOpen(false)
  }, [])

  const hasLive = publicState === 'LIVE'

  return (
    <SmoothScrollProvider>
      {/* Navigation */}
      <SceneNav activeScene={activeScene} hasLive={hasLive} />

      {/* 3D Controller (lazy-loaded, overlays everything) */}
      <ControllerScene activeScene={activeScene} />

      {/* Horizontal Scene Container */}
      <SceneContainer onSceneChange={handleSceneChange}>
        {/* Scene 01 — System */}
        <ScenePanel id="system">
          <SystemScene />
        </ScenePanel>

        {/* Scene 02 — Tournament */}
        <ScenePanel id="tournament">
          <TournamentScene
            tournament={tournament}
            publicState={publicState}
            registrationCount={registrationCount}
            onRegister={handleOpenRegistration}
          />
        </ScenePanel>

        {/* Scene 03 — Live */}
        <ScenePanel id="live">
          <LiveScene
            tournament={publicState === 'LIVE' ? tournament : null}
            liveMatch={liveMatch}
            liveStream={liveStream}
          />
        </ScenePanel>

        {/* Scene 04 — Bracket */}
        <ScenePanel id="bracket">
          <BracketScene
            tournament={tournament}
            matches={matches}
            rounds={rounds}
          />
        </ScenePanel>

        {/* Scene 05 — Results */}
        <ScenePanel id="results">
          <ResultsScene
            tournament={tournament}
            matches={matches}
          />
        </ScenePanel>
      </SceneContainer>

      {/* Scene Indicator */}
      <SceneIndicator activeScene={activeScene} />

      {/* Registration Panel */}
      {tournament && (
        <RegistrationPanel
          tournament={tournament}
          isOpen={registrationOpen}
          onClose={handleCloseRegistration}
        />
      )}
    </SmoothScrollProvider>
  )
}
