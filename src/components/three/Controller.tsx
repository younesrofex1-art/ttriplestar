'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

interface ControllerProps {
  activeScene: number
}

const SCENE_CONFIGS = [
  { position: [2, 0, 0], scale: 1, rotation: [0, 0, 0] },          // Scene 0: System
  { position: [3, -0.5, -1], scale: 0.8, rotation: [-0.2, -0.5, 0] }, // Scene 1: Tournament
  { position: [2.5, 0, 0.5], scale: 0.9, rotation: [0, -0.2, 0] }, // Scene 2: Live
  { position: [4, 0, -2], scale: 0.6, rotation: [-0.4, -0.8, 0] }, // Scene 3: Bracket
  { position: [2, 0.5, 0], scale: 1, rotation: [0.1, 0.2, 0] },    // Scene 4: Results
]

export default function Controller({ activeScene }: ControllerProps) {
  const group = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/controller.glb')
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const mouse = useRef({ x: 0, y: 0 })
  const baseRotation = useRef(new THREE.Vector3())

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    
    if (!mediaQuery.matches) {
      window.addEventListener('mousemove', handleMouseMove)
    }
    
    return () => {
      mediaQuery.removeEventListener('change', listener)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useEffect(() => {
    if (!group.current) return
    const config = SCENE_CONFIGS[Math.max(0, Math.min(activeScene, SCENE_CONFIGS.length - 1))]
    
    baseRotation.current.set(config.rotation[0], config.rotation[1], config.rotation[2])
    
    if (prefersReducedMotion) {
      group.current.position.set(config.position[0], config.position[1], config.position[2])
      group.current.scale.setScalar(config.scale)
      if (innerRef.current) {
        innerRef.current.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2])
      }
    } else {
      gsap.to(group.current.position, {
        x: config.position[0],
        y: config.position[1],
        z: config.position[2],
        duration: 1.2,
        ease: 'power3.inOut'
      })
      gsap.to(group.current.scale, {
        x: config.scale,
        y: config.scale,
        z: config.scale,
        duration: 1.2,
        ease: 'power3.inOut'
      })
    }
  }, [activeScene, prefersReducedMotion])

  useFrame((state) => {
    if (!innerRef.current || prefersReducedMotion) return

    // Idle slow rotation on Y axis (0.15 rad/s)
    const idleRotationY = state.clock.elapsedTime * 0.15
    
    // Subtle floating (sin wave on Y position, amplitude 0.05, period 3s)
    // 3s period means 2PI / 3 roughly
    const floatY = Math.sin(state.clock.elapsedTime * (Math.PI * 2 / 3)) * 0.05
    
    // Mouse rotation (max ±0.1 rad on X and Y)
    const mouseRotX = mouse.current.y * 0.1
    const mouseRotY = mouse.current.x * 0.1

    innerRef.current.position.y = floatY
    innerRef.current.rotation.x = baseRotation.current.x + mouseRotX
    innerRef.current.rotation.y = baseRotation.current.y + idleRotationY + mouseRotY
    innerRef.current.rotation.z = baseRotation.current.z
  })

  return (
    <group ref={group}>
      <group ref={innerRef}>
         <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/controller.glb')
