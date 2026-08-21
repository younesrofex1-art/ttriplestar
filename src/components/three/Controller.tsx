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

// 6 Keyframes for the continuous horizontal journey (0 to 5)
const SCENE_KEYFRAMES: SceneKeyframe[] = [
  // Scene 0: SYSTEM — Right side hero view
  { position: [1.38, 0, 0], rotation: [0.35, -0.45, 0.08], scale: 0.95 },
  // Scene 1: TOURNAMENT — Faded / hidden so full screen width is dedicated to all open tournaments
  { position: [2.6, -0.2, -0.8], rotation: [-0.15, -0.85, 0.18], scale: 0.0 },
  // Scene 2: LIVE — Elevated, facing match stats (smoothly expands back in)
  { position: [1.45, 0.12, 0.08], rotation: [0.35, 0.5, -0.12], scale: 0.92 },
  // Scene 3: BRACKET — Pushed right & scaled cleanly to leave bracket space open
  { position: [2.10, 0.08, -0.35], rotation: [0.22, -0.60, 0.10], scale: 0.72 },
  // Scene 4: RESULTS / ARCHIVE — Pushed further to the right side of podium
  { position: [1.88, 0.12, 0.0], rotation: [0.28, 0.45, -0.08], scale: 0.94 },
  // Scene 5: CONNECT / LOCATION — Cyber tilted pose on far right
  { position: [1.95, -0.05, 0.05], rotation: [0.30, -0.75, 0.15], scale: 0.88 },
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
  const isHovered = useRef(false)
  const hoverFactor = useRef(0)
  const currentPos = useRef(new THREE.Vector3(...SCENE_KEYFRAMES[0].position))
  const currentRot = useRef(new THREE.Euler(...SCENE_KEYFRAMES[0].rotation))
  const currentScale = useRef(SCENE_KEYFRAMES[0].scale * MODEL_BASE_SCALE)

  // Track global mouse & hover detection with passive performance listener
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

      // Detect if cursor is near the controller zone on the right side
      isHovered.current = nx > 0.05 && Math.abs(ny) < 0.85
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      mq.removeEventListener('change', mqListener)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Continuous frame updates: smooth scroll interpolation + responsive 3D hover physics
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

    // ─── 2. Smooth Damped Mouse & Interactive Hover Physics ─────────────
    const mouseDampSpeed = 1 - Math.exp(-4.5 * delta)
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * mouseDampSpeed
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * mouseDampSpeed

    // Smooth hover factor lerping
    const targetHover = isHovered.current ? 1 : 0
    hoverFactor.current += (targetHover - hoverFactor.current) * mouseDampSpeed

    // Gentle floating wave (organically amplifies on hover)
    const floatY = Math.sin(t * 1.1) * (0.035 + hoverFactor.current * 0.02)
    const idleSpin = Math.sin(t * 0.35) * 0.06

    // Interactive 3D mouse tilt tracking (responsive & silky smooth)
    const tiltStrength = 0.22 + hoverFactor.current * 0.15
    const mousePitch = smoothMouse.current.y * tiltStrength
    const mouseYaw = smoothMouse.current.x * tiltStrength
    const mouseRoll = -smoothMouse.current.x * (0.08 + hoverFactor.current * 0.06)

    // Subtle hover depth and scale lift (+5% scale and slight forward lift)
    const hoverScale = 1 + hoverFactor.current * 0.05
    motionGroup.current.scale.setScalar(hoverScale)

    // Apply combined transformations
    motionGroup.current.position.y = floatY
    motionGroup.current.position.z = hoverFactor.current * 0.12
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

