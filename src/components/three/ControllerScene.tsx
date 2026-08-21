'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, AdaptiveDpr } from '@react-three/drei'
import ControllerLoader from './ControllerLoader'
import Controller from './Controller'

interface ControllerSceneProps {
  activeScene: number
  scrollProgress: number
}

export default function ControllerScene({
  activeScene,
  scrollProgress,
}: ControllerSceneProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="fixed inset-0 z-[10] pointer-events-none w-full h-full select-none">
      {/* HTML Shimmer loader overlay — fades out once 3D model is active */}
      {!isLoaded && <ControllerLoader />}

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <AdaptiveDpr pixelated />

        {/* Ambient base lighting */}
        <ambientLight intensity={0.9} />

        {/* Key Light — crisp directional illumination */}
        <directionalLight position={[5, 6, 4]} intensity={2.2} color="#ffffff" />

        {/* Fill Light — warm fill */}
        <directionalLight position={[-4, 2, 3]} intensity={1.0} color="#ffd4aa" />

        {/* Environment reflections */}
        <Environment preset="night" environmentIntensity={0.6} />

        {/* 3D Controller with continuous scroll interpolation & interactive 3D physics */}
        <Suspense fallback={null}>
          <Controller
            activeScene={activeScene}
            scrollProgress={scrollProgress}
            onLoaded={() => setIsLoaded(true)}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

