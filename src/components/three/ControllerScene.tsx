'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import ControllerLoader from './ControllerLoader'
import Controller from './Controller'

interface ControllerSceneProps {
  activeScene: number
}

export default function ControllerScene({ activeScene }: ControllerSceneProps) {
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
      {/* HTML Shimmer loader overlay — smoothly fades out once 3D model is active */}
      {!isLoaded && <ControllerLoader />}

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* Ambient lighting for soft base illumination */}
        <ambientLight intensity={0.7} />

        {/* Main Key Light — crisp white from top-right */}
        <directionalLight position={[5, 6, 4]} intensity={2.2} color="#ffffff" />

        {/* Fill Light — cool soft blue from left */}
        <directionalLight position={[-4, 2, 3]} intensity={0.9} color="#a0c8ff" />

        {/* Esports Accent Rim Light — vibrant Triple Stars green from behind-left */}
        <directionalLight position={[-6, -2, -3]} intensity={3.5} color="#00ff88" />

        {/* Cyberpunk Secondary Rim Light — electric cyan from top-behind */}
        <directionalLight position={[3, 5, -3]} intensity={2.0} color="#00e5ff" />

        {/* Environment map for realistic metallic/glossy reflections */}
        <Environment preset="city" environmentIntensity={0.6} />

        {/* Suspense lives INSIDE Canvas to prevent React DOM tree mutation conflicts */}
        <Suspense fallback={null}>
          <Controller
            activeScene={activeScene}
            onLoaded={() => setIsLoaded(true)}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
