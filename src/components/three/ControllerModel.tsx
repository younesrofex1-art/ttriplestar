'use client'

import * as THREE from 'three'
import React, { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

const MODEL_URL =
  process.env.NEXT_PUBLIC_MODEL_URL ||
  'https://res.cloudinary.com/d6tvoend/raw/upload/v1787358459/controller.glb'

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

  const customUniforms = useRef({
    uLeftFlash: { value: 0 },
    uRightFlash: { value: 0 },
  })

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
            mat.emissive = new THREE.Color('#000000')
            mat.emissiveIntensity = 1.0

            // Shader extension to illuminate ONLY the left D-pad or right buttons based on which key is pressed
            mat.onBeforeCompile = (shader) => {
              shader.uniforms.uLeftFlash = customUniforms.current.uLeftFlash
              shader.uniforms.uRightFlash = customUniforms.current.uRightFlash

              shader.vertexShader = `
                varying vec3 vButtonLocalPos;
                ${shader.vertexShader}
              `.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                vButtonLocalPos = position;
                `
              )

              shader.fragmentShader = `
                uniform float uLeftFlash;
                uniform float uRightFlash;
                varying vec3 vButtonLocalPos;
                ${shader.fragmentShader}
              `.replace(
                '#include <emissivemap_fragment>',
                `
                #include <emissivemap_fragment>
                
                // Left D-Pad Arrow (strictly left side: x < -0.15)
                if (vButtonLocalPos.x < -0.15 && vButtonLocalPos.y > -0.15) {
                  float w = smoothstep(-0.15, -0.35, vButtonLocalPos.x);
                  totalEmissiveRadiance += vec3(1.0, 0.40, 0.0) * uLeftFlash * 7.5 * w;
                }
                
                // Right Action Arrow / Buttons (strictly right side: x > 0.15)
                if (vButtonLocalPos.x > 0.15 && vButtonLocalPos.y > -0.15) {
                  float w = smoothstep(0.15, 0.35, vButtonLocalPos.x);
                  totalEmissiveRadiance += vec3(1.0, 0.40, 0.0) * uRightFlash * 7.5 * w;
                }
                `
              )
            }

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
    const targetIntensity = 1.2 + hoverFactor * 2.8 + pulse

    // Pass real-time flash values to custom button shader
    customUniforms.current.uLeftFlash.value = leftFlash
    customUniforms.current.uRightFlash.value = rightFlash

    if (emissiveMaterialsRef.current.length > 0) {
      emissiveMaterialsRef.current.forEach((mat) => {
        mat.emissiveIntensity = targetIntensity
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





