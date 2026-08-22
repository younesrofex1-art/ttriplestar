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
  const leftFlash = useRef(0)
  const rightFlash = useRef(0)
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

  // Track global mouse position, keyboard arrows & drag events
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches

    const mqListener = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }
    mq.addEventListener('change', mqListener)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in inputs or textareas
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return

      if (['ArrowLeft', 'ArrowUp', 'a', 'A'].includes(e.key)) {
        leftFlash.current = 1.0
      } else if (['ArrowRight', 'ArrowDown', 'd', 'D'].includes(e.key)) {
        rightFlash.current = 1.0
      }
    }

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

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.body.style.cursor = ''
      mq.removeEventListener('change', mqListener)
      window.removeEventListener('keydown', handleKeyDown)
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

    // Aspect ratio correction for accurate screen-space circular hit test
    const aspect = state.viewport.aspect
    const dx = (mouse.current.x - worldPos.x) * aspect
    const dy = mouse.current.y - worldPos.y
    const distToController = Math.hypot(dx, dy)

    // Dynamic hit radius strictly proportional to the current model scale
    const hitRadius = Math.max(0.14, 0.42 * currentScale.current)
    const isOverModel = distToController < hitRadius

    if (isOverModel !== isHoveredRef.current) {
      isHoveredRef.current = isOverModel
      onHoverChangeRef.current?.(isOverModel)
      if (!isDragging.current) {
        document.body.style.cursor = isOverModel ? 'grab' : ''
      }
    }

    const targetHover = isOverModel
      ? Math.min(1, Math.max(0, 1.0 - (distToController / hitRadius) * 0.8))
      : 0
    const hoverDampSpeed = 1 - Math.exp(-8 * delta)
    hoverFactor.current += (targetHover - hoverFactor.current) * hoverDampSpeed

    // Decay keyboard arrow flashes exponentially (~250ms decay)
    const flashDecay = Math.exp(-9.0 * delta)
    leftFlash.current *= flashDecay
    rightFlash.current *= flashDecay

    // ─── 3. Drag Rotation Dampening ─────────────────────────────────────
    if (!isDragging.current) {
      const dragDecay = Math.exp(-3.5 * delta)
      dragRotation.current.x *= dragDecay
      dragRotation.current.y *= dragDecay
    }

    // ─── 4. Smooth Damped Mouse & Interactive Hover Physics ─────────────
    // Mouse offset relative to the center of the model (only calculated when hovering)
    const localMouseX = isHoveredRef.current ? (mouse.current.x - worldPos.x) * 2.2 : 0
    const localMouseY = isHoveredRef.current ? (mouse.current.y - worldPos.y) * 2.2 : 0

    const mouseDampSpeed = 1 - Math.exp(-6.5 * delta)
    smoothMouse.current.x += (localMouseX - smoothMouse.current.x) * mouseDampSpeed
    smoothMouse.current.y += (localMouseY - smoothMouse.current.y) * mouseDampSpeed

    // Floating wave (organically amplifies only on hover)
    const floatY = Math.sin(t * 1.3) * (0.035 + hoverFactor.current * 0.025)
    const idleSpin = Math.sin(t * 0.4) * 0.04

    // Dynamic keyboard arrow haptic nudge
    const keyNudgeRoll = (rightFlash.current - leftFlash.current) * 0.09
    const keyNudgePitch = -(leftFlash.current + rightFlash.current) * 0.06

    // Interactive 3D mouse tilt: ONLY active when hovering directly on top of the model
    const tiltStrength = hoverFactor.current * 0.60
    const mousePitch = smoothMouse.current.y * tiltStrength + keyNudgePitch
    const mouseYaw = smoothMouse.current.x * tiltStrength
    const mouseRoll = -smoothMouse.current.x * (hoverFactor.current * 0.15) + keyNudgeRoll

    // Smooth hover depth and scale lift (+18% scale and forward lift)
    const hoverScale = 1 + hoverFactor.current * 0.18 + (leftFlash.current + rightFlash.current) * 0.05
    motionGroup.current.scale.setScalar(hoverScale)

    // Dynamic reactive lights: surge on hover and flash intensely on arrow keys
    if (rimLightRef.current) {
      const leftSurge = leftFlash.current * 28.0
      rimLightRef.current.intensity = 5.5 + hoverFactor.current * 7.5 + leftSurge
      rimLightRef.current.color.set(leftFlash.current > 0.05 ? '#ff4400' : '#ff6600')
    }
    if (fillLightRef.current) {
      const rightSurge = rightFlash.current * 28.0
      fillLightRef.current.intensity = 4.0 + hoverFactor.current * 5.0 + rightSurge
      fillLightRef.current.color.set(rightFlash.current > 0.05 ? '#ff4400' : '#ff9900')
    }

    // Apply combined transformations
    motionGroup.current.position.y = floatY
    motionGroup.current.position.z = hoverFactor.current * 0.30 + (leftFlash.current + rightFlash.current) * 0.1
    motionGroup.current.rotation.x = currentRot.current.x + mousePitch + dragRotation.current.x
    motionGroup.current.rotation.y = currentRot.current.y + idleSpin + mouseYaw + dragRotation.current.y
    motionGroup.current.rotation.z = currentRot.current.z + mouseRoll
  })

  return (
    <group ref={rootGroup}>
      {/* Dynamic reactive lights tied to hover & keyboard flashes */}
      <pointLight ref={rimLightRef} position={[-3, -2, -1]} intensity={5.5} color="#ff6600" distance={12} />
      <pointLight ref={fillLightRef} position={[3, 3, -1]} intensity={4.0} color="#ff9900" distance={12} />

      <group ref={motionGroup}>
        <ControllerModel
          hoverFactor={hoverFactor.current}
          leftFlash={leftFlash.current}
          rightFlash={rightFlash.current}
          onLoaded={onLoaded}
        />
      </group>
    </group>
  )
}

