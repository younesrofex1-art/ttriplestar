'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ControllerModel } from './ControllerModel'

interface ControllerProps {
  activeScene?: number
  scrollProgress: number
  onLoaded?: () => void
  onHoverChange?: (hovered: boolean) => void
}

interface SceneKeyframe {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

// 6 Keyframes for the continuous horizontal journey (0 to 5)
const SCENE_KEYFRAMES: SceneKeyframe[] = [
  // Scene 0: SYSTEM — Right side hero angle
  { position: [1.25, -0.05, 0], rotation: [0.35, -0.45, 0.08], scale: 0.95 },
  // Scene 1: TOURNAMENT — Pushed to the far bottom-right corner (compact scale)
  { position: [3.45, -1.65, 0.0], rotation: [-0.08, -0.60, 0.15], scale: 0.30 },
  // Scene 2: LIVE — Positioned on the LEFT side, pushed far left so it does not hide text on the right
  { position: [-1.55, -0.05, 0.0], rotation: [0.28, 0.45, -0.08], scale: 0.88 },
  // Scene 3: BRACKET — Framed on the right side of the bracket tree
  { position: [2.25, -0.45, 0.0], rotation: [0.15, -0.50, 0.10], scale: 0.78 },
  // Scene 4: RESULTS — Victorious upward tilt beside the podium
  { position: [1.35, 0.08, 0.05], rotation: [0.25, -0.45, -0.05], scale: 0.88 },
  // Scene 5: CONNECT / CONTACT — Pushed to the exact same bottom-right corner as tournament scene
  { position: [3.45, -1.65, 0.0], rotation: [-0.08, -0.60, 0.15], scale: 0.30 },
]

// Pre-calculated scale factor
const MODEL_BASE_SCALE = 1.05

export default function Controller({
  scrollProgress,
  onLoaded,
  onHoverChange,
}: ControllerProps) {
  const rootGroup = useRef<THREE.Group>(null!)
  const motionGroup = useRef<THREE.Group>(null!)
  const rimLightRef = useRef<THREE.PointLight>(null!)
  const fillLightRef = useRef<THREE.PointLight>(null!)

  const prefersReducedMotion = useRef(false)
  const mouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })
  const isHoveredRef = useRef(false)
  const hoverFactor = useRef(0)
  const onHoverChangeRef = useRef(onHoverChange)

  // Interactive Drag-to-Rotate support
  const isDragging = useRef(false)
  const lastPointerPos = useRef({ x: 0, y: 0 })
  const dragRotation = useRef({ x: 0, y: 0 })

  const currentPos = useRef(new THREE.Vector3(...SCENE_KEYFRAMES[0].position))
  const currentRot = useRef(new THREE.Euler(...SCENE_KEYFRAMES[0].rotation))
  const currentScale = useRef(SCENE_KEYFRAMES[0].scale * MODEL_BASE_SCALE)

  useEffect(() => {
    onHoverChangeRef.current = onHoverChange
  }, [onHoverChange])

  // Track global mouse position & drag events
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

      if (isDragging.current) {
        const deltaX = e.clientX - lastPointerPos.current.x
        const deltaY = e.clientY - lastPointerPos.current.y
        lastPointerPos.current.x = e.clientX
        lastPointerPos.current.y = e.clientY

        dragRotation.current.y += (deltaX / window.innerWidth) * Math.PI * 2.5
        dragRotation.current.x += (deltaY / window.innerHeight) * Math.PI * 2.5
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (isHoveredRef.current) {
        isDragging.current = true
        lastPointerPos.current = { x: e.clientX, y: e.clientY }
        document.body.style.cursor = 'grabbing'
      }
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = isHoveredRef.current ? 'grab' : ''
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.body.style.cursor = ''
      mq.removeEventListener('change', mqListener)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
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

    // ─── 2. Accurate 3D Screen Proximity & Hover Detection ──────────────
    const worldPos = new THREE.Vector3()
    rootGroup.current.getWorldPosition(worldPos)
    worldPos.project(state.camera)

    const dx = mouse.current.x - worldPos.x
    const dy = mouse.current.y - worldPos.y
    const distToController = Math.hypot(dx, dy)

    // Check if cursor is over or near the controller (works on left, center, or right)
    const isNear =
      distToController < 0.6 ||
      (Math.abs(mouse.current.x - worldPos.x) < 0.45 && Math.abs(mouse.current.y - worldPos.y) < 0.5)

    if (isNear !== isHoveredRef.current) {
      isHoveredRef.current = isNear
      onHoverChangeRef.current?.(isNear)
      if (!isDragging.current) {
        document.body.style.cursor = isNear ? 'grab' : ''
      }
    }

    const targetHover = isNear ? Math.min(1, Math.max(0, 1.1 - distToController / 0.55)) : 0
    const hoverDampSpeed = 1 - Math.exp(-7 * delta)
    hoverFactor.current += (targetHover - hoverFactor.current) * hoverDampSpeed

    // ─── 3. Drag Rotation Dampening ─────────────────────────────────────
    if (!isDragging.current) {
      const dragDecay = Math.exp(-3.5 * delta)
      dragRotation.current.x *= dragDecay
      dragRotation.current.y *= dragDecay
    }

    // ─── 4. Smooth Damped Mouse & Interactive Hover Physics ─────────────
    const mouseDampSpeed = 1 - Math.exp(-5.5 * delta)
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * mouseDampSpeed
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * mouseDampSpeed

    // Floating wave (organically amplifies on hover)
    const floatY = Math.sin(t * 1.3) * (0.04 + hoverFactor.current * 0.03)
    const idleSpin = Math.sin(t * 0.4) * 0.05

    // Interactive 3D mouse tilt tracking (snappy & reactive)
    const tiltStrength = 0.35 + hoverFactor.current * 0.35
    const mousePitch = smoothMouse.current.y * tiltStrength
    const mouseYaw = smoothMouse.current.x * tiltStrength
    const mouseRoll = -smoothMouse.current.x * (0.12 + hoverFactor.current * 0.12)

    // Smooth hover depth and scale lift (+22% scale and forward lift)
    const hoverScale = 1 + hoverFactor.current * 0.22
    motionGroup.current.scale.setScalar(hoverScale)

    // Dynamic light surges
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 5.5 + hoverFactor.current * 7.5
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 4.0 + hoverFactor.current * 5.0
    }

    // Apply combined transformations
    motionGroup.current.position.y = floatY
    motionGroup.current.position.z = hoverFactor.current * 0.35
    motionGroup.current.rotation.x = currentRot.current.x + mousePitch + dragRotation.current.x
    motionGroup.current.rotation.y = currentRot.current.y + idleSpin + mouseYaw + dragRotation.current.y
    motionGroup.current.rotation.z = currentRot.current.z + mouseRoll
  })

  return (
    <group ref={rootGroup}>
      {/* Dynamic reactive lights tied to hover */}
      <pointLight ref={rimLightRef} position={[-3, -2, -1]} intensity={5.5} color="#ff6600" distance={12} />
      <pointLight ref={fillLightRef} position={[3, 3, -1]} intensity={4.0} color="#ff9900" distance={12} />

      <group ref={motionGroup}>
        <ControllerModel hoverFactor={hoverFactor.current} onLoaded={onLoaded} />
      </group>
    </group>
  )
}

