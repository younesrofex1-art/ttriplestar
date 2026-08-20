'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
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
  const [mounted, setMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <ControllerLoader />
  }

  return (
    <div className="fixed inset-0 z-[10] pointer-events-none w-full h-full">
      {/* HTML Shimmer loader overlay — fades out once 3D model is active */}
      {!isLoaded && <ControllerLoader />}

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
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
        {/* Ambient base lighting */}
        <ambientLight intensity={0.8} />

        {/* Key Light — crisp directional illumination for 3D depth and specular highlights */}
        <directionalLight position={[6, 8, 5]} intensity={2.8} color="#ffffff" />

        {/* Fill Light — soft cool blue from front-left */}
        <directionalLight position={[-5, 2, 4]} intensity={1.2} color="#a0c8ff" />

        {/* Primary Esports Rim Light — vibrant Triple Stars green */}
        <pointLight position={[-5, -2, -3]} intensity={6.0} color="#00ff88" distance={16} />

        {/* Secondary Lightbar Glow — electric cyan from top-rear */}
        <pointLight position={[3, 5, -3]} intensity={4.5} color="#00e5ff" distance={14} />

        {/* Under-glow Bounce Light */}
        <pointLight position={[1, -4, 2]} intensity={2.0} color="#ffffff" distance={10} />

        {/* Environment reflections for realistic glossy and metallic surfaces */}
        <Environment preset="night" environmentIntensity={0.8} />

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
