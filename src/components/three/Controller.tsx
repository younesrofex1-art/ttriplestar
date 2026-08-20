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
  // Scene 0: SYSTEM — Heroic 3/4 angle, dynamic tilt on right side
  { position: [1.35, -0.05, 0], rotation: [0.35, -0.45, 0.08], scale: 1.05 },
  // Scene 1: TOURNAMENT — Turned inwards showing top triggers and touchpad
  { position: [1.75, -0.2, -0.3], rotation: [-0.15, -1.05, 0.22], scale: 0.88 },
  // Scene 2: LIVE — Elevated, facing left towards match stats with dramatic angle
  { position: [1.35, 0.2, 0.25], rotation: [0.38, 0.55, -0.15], scale: 0.98 },
  // Scene 3: BRACKET — Pushed deep into 3D background so bracket data is legible
  { position: [2.2, -0.05, -1.1], rotation: [-0.25, -2.1, 0.35], scale: 0.68 },
  // Scene 4: RESULTS — Victorious upward tilt with celebratory pose
  { position: [1.3, 0.22, 0.1], rotation: [0.25, 0.7, 0.12], scale: 1.1 },
]

// Pre-calculated scale factor to match 3.3 world units prominently
const MODEL_BASE_SCALE = 1.65

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

  // Track global mouse & hover detection
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

      // Hover zone: when cursor is on the right half of the screen
      isHovered.current = nx > 0.05 && Math.abs(ny) < 0.85
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      mq.removeEventListener('change', mqListener)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Continuous frame updates: scroll interpolation + 3D physics + mouse interaction
  useFrame((state, delta) => {
    if (!rootGroup.current || !motionGroup.current) return

    const t = state.clock.elapsedTime

    // ─── 1. Continuous Scroll Keyframe Interpolation ───────────────────
    const maxIdx = SCENE_KEYFRAMES.length - 1
    // p is 0.0 to 4.0 based on scroll
    const p = Math.max(0, Math.min(scrollProgress * maxIdx, maxIdx))
    const i = Math.floor(p)
    const nextI = Math.min(i + 1, maxIdx)
    const factor = p - i
    // Smooth cubic ease between scene keyframes
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

    // Smoothly lerp root position, rotation, and scale with frame-rate independent easing
    const lerpSpeed = 1 - Math.exp(-10 * delta)
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

    // ─── 2. Mouse Interpolation & Hover Physics ───────────────────────
    const mouseLerpSpeed = 1 - Math.exp(-7 * delta)
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * mouseLerpSpeed
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * mouseLerpSpeed

    const targetHover = isHovered.current ? 1 : 0
    hoverFactor.current += (targetHover - hoverFactor.current) * mouseLerpSpeed

    // Idle floating wave
    const floatSpeed = 1.4 + hoverFactor.current * 0.8
    const floatAmp = 0.07 + hoverFactor.current * 0.04
    const floatY = Math.sin(t * floatSpeed) * floatAmp

    // Continuous slow yaw spin so it never looks static
    const idleSpin = Math.sin(t * 0.4) * 0.15

    // Dynamic 3D mouse tilt tracking (tilts towards cursor with depth)
    const tiltStrength = 0.4 + hoverFactor.current * 0.35
    const mousePitch = smoothMouse.current.y * tiltStrength
    const mouseYaw = smoothMouse.current.x * tiltStrength
    const mouseRoll = -smoothMouse.current.x * 0.2

    // Hover scale pulse (+12% scale when hovering over the model)
    const hoverScaleBoost = 1 + hoverFactor.current * 0.12
    motionGroup.current.scale.setScalar(hoverScaleBoost)

    // Apply combined transformations to motion group
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

