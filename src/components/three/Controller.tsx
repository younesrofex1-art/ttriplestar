'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ControllerModel } from './ControllerModel'

interface ControllerProps {
  activeScene: number
  scrollProgress: number
  onLoaded?: () => void
}

interface SceneKeyframe {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

// 5 Keyframes for the continuous horizontal journey (0 to 4)
const SCENE_KEYFRAMES: SceneKeyframe[] = [
  // Scene 0: SYSTEM — Right side hero view
  { position: [1.38, 0, 0], rotation: [0.35, -0.45, 0.08], scale: 0.95 },
  // Scene 1: TOURNAMENT — Turned inwards showing triggers and lightbar
  { position: [1.55, -0.1, -0.2], rotation: [-0.15, -0.85, 0.18], scale: 0.85 },
  // Scene 2: LIVE — Elevated, facing match stats
  { position: [1.38, 0.15, 0.1], rotation: [0.35, 0.5, -0.12], scale: 0.92 },
  // Scene 3: BRACKET — Tucked back so bracket is legible
  { position: [1.75, -0.05, -0.6], rotation: [-0.2, -1.8, 0.25], scale: 0.65 },
  // Scene 4: RESULTS — Victorious upward tilt
  { position: [1.35, 0.18, 0.05], rotation: [0.22, 0.6, 0.1], scale: 0.98 },
]

// Pre-calculated scale factor
const MODEL_BASE_SCALE = 1.05

export default function Controller({
  activeScene,
  scrollProgress,
  onLoaded,
}: ControllerProps) {
  const rootGroup = useRef<THREE.Group>(null!)
  const motionGroup = useRef<THREE.Group>(null!)

  const prefersReducedMotion = useRef(false)
  const mouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })
  const currentPos = useRef(new THREE.Vector3(...SCENE_KEYFRAMES[0].position))
  const currentRot = useRef(new THREE.Euler(...SCENE_KEYFRAMES[0].rotation))
  const currentScale = useRef(SCENE_KEYFRAMES[0].scale * MODEL_BASE_SCALE)

  // Track global mouse with passive performance listener
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches

    const mqListener = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }
    mq.addEventListener('change', mqListener)

    const handleMouseMove = (e: MouseEvent) => {
      // Subdued normalized cursor tracking [-0.5 to 0.5]
      mouse.current.x = ((e.clientX / window.innerWidth) * 2 - 1) * 0.5
      mouse.current.y = (-(e.clientY / window.innerHeight) * 2 + 1) * 0.5
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      mq.removeEventListener('change', mqListener)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Continuous frame updates: smooth scroll interpolation + subtle organic physics
  useFrame((state, delta) => {
    if (!rootGroup.current || !motionGroup.current) return

    const t = state.clock.elapsedTime

    // ─── 1. Continuous Scroll Keyframe Interpolation ───────────────────
    const maxIdx = SCENE_KEYFRAMES.length - 1
    const p = Math.max(0, Math.min(scrollProgress * maxIdx, maxIdx))
    const i = Math.floor(p)
    const nextI = Math.min(i + 1, maxIdx)
    const factor = p - i
    const easeT = factor * factor * (3 - 2 * factor)

    const kfA = SCENE_KEYFRAMES[i]
    const kfB = SCENE_KEYFRAMES[nextI]

    const targetPosX = THREE.MathUtils.lerp(kfA.position[0], kfB.position[0], easeT)
    const targetPosY = THREE.MathUtils.lerp(kfA.position[1], kfB.position[1], easeT)
    const targetPosZ = THREE.MathUtils.lerp(kfA.position[2], kfB.position[2], easeT)

    const targetRotX = THREE.MathUtils.lerp(kfA.rotation[0], kfB.rotation[0], easeT)
    const targetRotY = THREE.MathUtils.lerp(kfA.rotation[1], kfB.rotation[1], easeT)
    const targetRotZ = THREE.MathUtils.lerp(kfA.rotation[2], kfB.rotation[2], easeT)

    const targetScaleVal = THREE.MathUtils.lerp(kfA.scale, kfB.scale, easeT) * MODEL_BASE_SCALE

    // Soft frame-rate independent easing
    const lerpSpeed = 1 - Math.exp(-8 * delta)
    currentPos.current.x += (targetPosX - currentPos.current.x) * lerpSpeed
    currentPos.current.y += (targetPosY - currentPos.current.y) * lerpSpeed
    currentPos.current.z += (targetPosZ - currentPos.current.z) * lerpSpeed

    currentRot.current.x += (targetRotX - currentRot.current.x) * lerpSpeed
    currentRot.current.y += (targetRotY - currentRot.current.y) * lerpSpeed
    currentRot.current.z += (targetRotZ - currentRot.current.z) * lerpSpeed

    currentScale.current += (targetScaleVal - currentScale.current) * lerpSpeed

    rootGroup.current.position.copy(currentPos.current)
    rootGroup.current.scale.setScalar(currentScale.current)

    if (prefersReducedMotion.current) {
      motionGroup.current.rotation.copy(currentRot.current)
      return
    }

    // ─── 2. Smooth Damped Mouse & Idle Physics (Zero Stutter) ───────────
    const mouseDampSpeed = 1 - Math.exp(-3.5 * delta)
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * mouseDampSpeed
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * mouseDampSpeed

    // Gentle floating wave (reduced amplitude to prevent disorienting motion)
    const floatY = Math.sin(t * 0.75) * 0.02
    const idleSpin = Math.sin(t * 0.25) * 0.04

    // Subtle 3D mouse tilt tracking (damped & gentle)
    const mousePitch = smoothMouse.current.y * 0.12
    const mouseYaw = smoothMouse.current.x * 0.12
    const mouseRoll = -smoothMouse.current.x * 0.05

    // Apply combined transformations
    motionGroup.current.position.y = floatY
    motionGroup.current.rotation.x = currentRot.current.x + mousePitch
    motionGroup.current.rotation.y = currentRot.current.y + idleSpin + mouseYaw
    motionGroup.current.rotation.z = currentRot.current.z + mouseRoll
  })

  return (
    <group ref={rootGroup}>
      <group ref={motionGroup}>
        <ControllerModel onLoaded={onLoaded} />
      </group>
    </group>
  )
}

