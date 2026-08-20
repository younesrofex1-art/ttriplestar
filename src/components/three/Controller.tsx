'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

interface ControllerProps {
  activeScene: number
}

const SCENE_CONFIGS: { position: [number, number, number]; scale: number; rotation: [number, number, number] }[] = [
  { position: [2, 0, 0] as const, scale: 1, rotation: [0, 0, 0] as const },
  { position: [3, -0.5, -1] as const, scale: 0.8, rotation: [-0.2, -0.5, 0] as const },
  { position: [2.5, 0, 0.5] as const, scale: 0.9, rotation: [0, -0.2, 0] as const },
  { position: [4, 0, -2] as const, scale: 0.6, rotation: [-0.4, -0.8, 0] as const },
  { position: [2, 0.5, 0] as const, scale: 1, rotation: [0.1, 0.2, 0] as const },
]

export default function Controller({ activeScene }: ControllerProps) {
  const group = useRef<THREE.Group>(null!)
  const innerRef = useRef<THREE.Group>(null!)
  const { scene } = useGLTF('/models/controller.glb')

  // Clone the scene so it can be reused safely
  const clonedScene = useMemo(() => scene.clone(), [scene])

  const prefersReducedMotion = useRef(false)
  const mouse = useRef({ x: 0, y: 0 })
  const baseRotation = useRef(new THREE.Euler())
  const initialPositionSet = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches

    const mqListener = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }
    mq.addEventListener('change', mqListener)

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      mq.removeEventListener('change', mqListener)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Set initial position immediately
  useEffect(() => {
    if (!group.current || initialPositionSet.current) return
    const config = SCENE_CONFIGS[0]
    group.current.position.set(...config.position)
    group.current.scale.setScalar(config.scale)
    initialPositionSet.current = true
  }, [])

  // Animate between scene positions
  useEffect(() => {
    if (!group.current) return
    const idx = Math.max(0, Math.min(activeScene, SCENE_CONFIGS.length - 1))
    const config = SCENE_CONFIGS[idx]

    baseRotation.current.set(config.rotation[0], config.rotation[1], config.rotation[2])

    if (prefersReducedMotion.current) {
      group.current.position.set(...config.position)
      group.current.scale.setScalar(config.scale)
    } else {
      gsap.to(group.current.position, {
        x: config.position[0],
        y: config.position[1],
        z: config.position[2],
        duration: 1.2,
        ease: 'power3.inOut',
      })
      gsap.to(group.current.scale, {
        x: config.scale,
        y: config.scale,
        z: config.scale,
        duration: 1.2,
        ease: 'power3.inOut',
      })
    }
  }, [activeScene])

  useFrame((state) => {
    if (!innerRef.current || prefersReducedMotion.current) return

    const t = state.clock.elapsedTime

    // Idle slow rotation on Y axis
    const idleRotY = t * 0.15

    // Subtle floating
    const floatY = Math.sin(t * ((Math.PI * 2) / 3)) * 0.05

    // Mouse follow
    const mRotX = mouse.current.y * 0.1
    const mRotY = mouse.current.x * 0.1

    innerRef.current.position.y = floatY
    innerRef.current.rotation.x = baseRotation.current.x + mRotX
    innerRef.current.rotation.y = baseRotation.current.y + idleRotY + mRotY
    innerRef.current.rotation.z = baseRotation.current.z
  })

  return (
    <group ref={group}>
      <group ref={innerRef}>
        <primitive object={clonedScene} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/controller.glb')
