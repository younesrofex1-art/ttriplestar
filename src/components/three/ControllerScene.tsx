'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { Environment } from '@react-three/drei'
import dynamic from 'next/dynamic'
import ControllerLoader from './ControllerLoader'

const Canvas = dynamic(() => import('@react-three/fiber').then((mod) => mod.Canvas), { ssr: false })
const Controller = dynamic(() => import('./Controller'), { ssr: false })

interface ControllerSceneProps {
  activeScene: number
}

export default function ControllerScene({ activeScene }: ControllerSceneProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none w-full h-full">
      <Suspense fallback={<ControllerLoader />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <ambientLight intensity={0.3} />
          {/* Directional light from upper-right */}
          <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
          {/* Rim light from behind-left with accent color */}
          <directionalLight position={[-5, -2, -5]} intensity={0.4} color="#00ff88" />
          
          {/* subtle Environment matching dark theme */}
          <Environment preset="night" />
          
          <Controller activeScene={activeScene} />
        </Canvas>
      </Suspense>
    </div>
  )
}
