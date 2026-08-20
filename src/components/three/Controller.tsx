'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

interface ControllerProps {
  activeScene: number
}

// Scene layout configurations in 3D world units
const SCENE_CONFIGS: {
  position: [number, number, number]
  scale: number
  rotation: [number, number, number]
}[] = [
  // Scene 0: SYSTEM — Large, bold hero on right side
  { position: [1.3, -0.1, 0], scale: 1.0, rotation: [0.2, -0.35, 0] },
  // Scene 1: TOURNAMENT — Angled slightly back to the right
  { position: [1.8, -0.3, -0.4], scale: 0.85, rotation: [-0.1, -0.65, 0.05] },
  // Scene 2: LIVE — Elevated and angled towards match info
  { position: [1.5, 0.1, 0.2], scale: 0.9, rotation: [0.15, -0.25, 0] },
  // Scene 3: BRACKET — Pushed into depth so bracket stays legible
  { position: [2.2, 0, -1.0], scale: 0.65, rotation: [-0.25, -0.85, 0] },
  // Scene 4: RESULTS — Heroic celebratory pose
  { position: [1.3, 0.2, 0], scale: 1.05, rotation: [0.2, 0.35, 0.08] },
]

export default function Controller({ activeScene }: ControllerProps) {
  const rootGroup = useRef<THREE.Group>(null!)
  const motionGroup = useRef<THREE.Group>(null!)
  const { scene } = useGLTF('/models/controller.glb')

  // Center and normalize geometry scale so the controller is always perfectly sized
  const { normalizedScene, normalizedScale } = useMemo(() => {
    const cloned = scene.clone(true)

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(cloned)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // Center geometry at origin
    cloned.position.set(-center.x, -center.y, -center.z)

    // Target max dimension ~3.2 units (fills ~60% of viewport height at distance 5)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scaleFactor = maxDim > 0 ? 3.2 / maxDim : 1

    return { normalizedScene: cloned, normalizedScale: scaleFactor }
  }, [scene])

  const prefersReducedMotion = useRef(false)
  const mouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })
  const isHovered = useRef(false)
  const hoverFactor = useRef(0)
  const baseRotation = useRef(new THREE.Euler())
  const initialPoseDone = useRef(false)

  // Track global mouse movement & hover proximity
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches

    const mqListener = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }
    mq.addEventListener('change', mqListener)

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      mouse.current.x = nx
      mouse.current.y = ny

      // Hover zone: when mouse is on the right half of the screen (near the 3D model)
      // or within proximity of the model's screen coords
      isHovered.current = nx > 0.1 && Math.abs(ny) < 0.8
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      mq.removeEventListener('change', mqListener)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Set initial pose
  useEffect(() => {
    if (!rootGroup.current || initialPoseDone.current) return
    const initialConfig = SCENE_CONFIGS[0]
    rootGroup.current.position.set(...initialConfig.position)
    rootGroup.current.scale.setScalar(initialConfig.scale * normalizedScale)
    baseRotation.current.set(...initialConfig.rotation)
    initialPoseDone.current = true
  }, [normalizedScale])

  // Animate between horizontal scenes
  useEffect(() => {
    if (!rootGroup.current) return
    const idx = Math.max(0, Math.min(activeScene, SCENE_CONFIGS.length - 1))
    const config = SCENE_CONFIGS[idx]

    baseRotation.current.set(...config.rotation)
    const targetScale = config.scale * normalizedScale

    if (prefersReducedMotion.current) {
      rootGroup.current.position.set(...config.position)
      rootGroup.current.scale.setScalar(targetScale)
    } else {
      gsap.to(rootGroup.current.position, {
        x: config.position[0],
        y: config.position[1],
        z: config.position[2],
        duration: 1.2,
        ease: 'power3.inOut',
      })
      gsap.to(rootGroup.current.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 1.2,
        ease: 'power3.inOut',
      })
    }
  }, [activeScene, normalizedScale])

  // Per-frame physics, floating, smooth mouse follow & hover tilt
  useFrame((state, delta) => {
    if (!motionGroup.current || prefersReducedMotion.current) return

    const t = state.clock.elapsedTime

    // Smooth mouse interpolation (springy lerp)
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.08
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.08

    // Smooth hover factor transition (0 to 1)
    const targetHover = isHovered.current ? 1 : 0
    hoverFactor.current += (targetHover - hoverFactor.current) * 0.1

    // Idle floating wave
    const floatSpeed = 1.6 + hoverFactor.current * 0.8
    const floatHeight = 0.07 + hoverFactor.current * 0.04
    const floatY = Math.sin(t * floatSpeed) * floatHeight

    // Idle slow yaw rotation
    const idleYaw = t * 0.12

    // Interactive mouse tilt (more intense on hover)
    const tiltMultiplier = 0.35 + hoverFactor.current * 0.25
    const mousePitch = smoothMouse.current.y * tiltMultiplier
    const mouseYaw = smoothMouse.current.x * tiltMultiplier
    const mouseRoll = -smoothMouse.current.x * 0.15

    // Hover scale boost (+10% scale when cursor is nearby)
    const hoverScaleBoost = 1 + hoverFactor.current * 0.1
    motionGroup.current.scale.setScalar(hoverScaleBoost)

    // Apply combined transformations
    motionGroup.current.position.y = floatY
    motionGroup.current.rotation.x = baseRotation.current.x + mousePitch
    motionGroup.current.rotation.y = baseRotation.current.y + idleYaw + mouseYaw
    motionGroup.current.rotation.z = baseRotation.current.z + mouseRoll
  })

  return (
    <group ref={rootGroup}>
      <group ref={motionGroup}>
        <primitive object={normalizedScene} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/controller.glb')
