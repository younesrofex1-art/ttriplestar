'use client'

import React, { Suspense, lazy, useEffect, useState } from 'react'
import ControllerLoader from './ControllerLoader'

// Only dynamically import the Canvas - everything inside it uses regular imports
const LazyCanvas = lazy(() =>
  import('@react-three/fiber').then((mod) => ({ default: mod.Canvas }))
)

// The inner scene component that lives inside the Canvas
// Must be a separate component so R3F hooks work
function CanvasContent({ activeScene }: { activeScene: number }) {
  // Import these inside the component to avoid SSR issues
  const [SceneContent, setSceneContent] = useState<React.ComponentType<{ activeScene: number }> | null>(null)

  useEffect(() => {
    // Dynamically load the scene content after mount
    Promise.all([
      import('@react-three/drei'),
      import('./Controller'),
    ]).then(([drei, controllerMod]) => {
      const { Environment } = drei
      const Controller = controllerMod.default

      // Create a wrapper component
      const Content = ({ activeScene }: { activeScene: number }) => (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
          <directionalLight position={[-5, -2, -5]} intensity={0.4} color="#00ff88" />
          <Environment preset="night" />
          <Controller activeScene={activeScene} />
        </>
      )
      setSceneContent(() => Content)
    })
  }, [])

  if (!SceneContent) return null
  return <SceneContent activeScene={activeScene} />
}

interface ControllerSceneProps {
  activeScene: number
}

export default function ControllerScene({ activeScene }: ControllerSceneProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <ControllerLoader />

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none w-full h-full">
      <Suspense fallback={<ControllerLoader />}>
        <LazyCanvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <Suspense fallback={null}>
            <CanvasContent activeScene={activeScene} />
          </Suspense>
        </LazyCanvas>
      </Suspense>
    </div>
  )
}
