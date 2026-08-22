'use client'

import * as THREE from 'three'
import React, { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

const MODEL_URL = process.env.NEXT_PUBLIC_MODEL_URL || '/models/controller.glb'

export interface ControllerModelProps extends React.ComponentPropsWithoutRef<'group'> {
  hoverFactor?: number
  leftFlash?: number
  rightFlash?: number
  onLoaded?: () => void
}

export function ControllerModel({
  hoverFactor = 0,
  leftFlash = 0,
  rightFlash = 0,
  onLoaded,
  ...props
}: ControllerModelProps) {
  // Load controller model with Drei's built-in Draco decoder (supports Cloudinary CDN or local)
  const { scene } = useGLTF(MODEL_URL, true)
  const emissiveMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([])
  const buttonMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([])

  // Compute bounding box and normalization factor once
  const { scaleFactor } = useMemo(() => {
    if (!scene) return { scaleFactor: 1 }

    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    // Center geometry at origin so rotations pivot naturally
    scene.position.set(-center.x, -center.y, -center.z)

    const maxDim = Math.max(size.x, size.y, size.z)
    return { scaleFactor: maxDim > 0 ? 2.4 / maxDim : 1 }
  }, [scene])

  // Setup materials once: ensure 100% opaque solid body and glowing neon orange lightbars & reactive buttons
  useEffect(() => {
    if (!scene) return

    const emissiveMats: THREE.MeshStandardMaterial[] = []
    const buttonMats: THREE.MeshStandardMaterial[] = []

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = false
        mesh.receiveShadow = false

        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial

          mat.transparent = false
          mat.opacity = 1.0
          mat.depthWrite = true

          const dynMat = mat as unknown as { transmission?: number; thickness?: number }
          if (dynMat.transmission !== undefined) {
            dynMat.transmission = 0
            dynMat.thickness = 0
          }

          // Apply rich dark charcoal finishes with specular gloss and glowing neon orange lightbars
          if (mat.name === '1011' || mesh.name.includes('11')) {
            mat.roughness = 0.25
            mat.metalness = 0.65
            mat.emissive = new THREE.Color('#ff6600')
            mat.emissiveIntensity = 1.3
            emissiveMats.push(mat)
          } else if (mat.name === '1001' || mesh.name.includes('14')) {
            mat.roughness = 0.45
            mat.metalness = 0.25
            mat.emissive = new THREE.Color('#ff6600')
            mat.emissiveIntensity = 0.0
            buttonMats.push(mat)
          } else {
            mat.roughness = 0.35
            mat.metalness = 0.45
          }

          mat.needsUpdate = true
        }
      }
    })

    emissiveMaterialsRef.current = emissiveMats
    buttonMaterialsRef.current = buttonMats
    onLoaded?.()
  }, [scene, onLoaded])

  // Real-time dynamic emissive glow pulse based on hover intensity & keyboard arrow triggers
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = Math.sin(t * 4) * 0.3 * hoverFactor
    const flashTotal = leftFlash + rightFlash
    const flashBoost = flashTotal * 4.5
    const targetIntensity = 1.2 + hoverFactor * 2.8 + pulse + flashBoost

    if (emissiveMaterialsRef.current.length > 0) {
      emissiveMaterialsRef.current.forEach((mat) => {
        mat.emissiveIntensity = targetIntensity
      })
    }

    if (buttonMaterialsRef.current.length > 0) {
      const buttonGlow = flashTotal * 5.0
      buttonMaterialsRef.current.forEach((mat) => {
        mat.emissiveIntensity = buttonGlow
      })
    }
  })

  if (!scene) return null

  return (
    <group {...props} scale={scaleFactor} dispose={null}>
      {/* dispose={null} prevents R3F from destroying geometry buffers during re-renders */}
      <primitive object={scene} dispose={null} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, true)





