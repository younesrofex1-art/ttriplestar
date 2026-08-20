'use client'

import * as THREE from 'three'
import React, { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Object_11: THREE.Mesh
    Object_14: THREE.Mesh
    Object_17: THREE.Mesh
  }
  materials: {
    ['1011']: THREE.MeshPhysicalMaterial
    ['1001']: THREE.MeshPhysicalMaterial
    ['1002']: THREE.MeshStandardMaterial
  }
}

export interface ControllerModelProps extends React.ComponentPropsWithoutRef<'group'> {
  onLoaded?: () => void
}

export function ControllerModel({ onLoaded, ...props }: ControllerModelProps) {
  const { nodes, materials } = useGLTF('/models/controller.glb', '/draco/') as unknown as GLTFResult

  // Enhance materials for realistic 3D sheen, specular highlights, and high-performance rendering
  useMemo(() => {
    if (materials['1011']) {
      materials['1011'].roughness = 0.2
      materials['1011'].metalness = 0.75
      materials['1011'].envMapIntensity = 1.2
      materials['1011'].needsUpdate = true
    }
    if (materials['1001']) {
      materials['1001'].roughness = 0.25
      materials['1001'].metalness = 0.6
      materials['1001'].envMapIntensity = 1.2
      materials['1001'].needsUpdate = true
    }
    if (materials['1002']) {
      materials['1002'].roughness = 0.35
      materials['1002'].metalness = 0.15
      materials['1002'].envMapIntensity = 1.0
      materials['1002'].needsUpdate = true
    }
  }, [materials])

  useEffect(() => {
    if (nodes && onLoaded) {
      onLoaded()
    }
  }, [nodes, onLoaded])

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_11.geometry}
        material={materials['1011']}
        rotation={[0, -0.007, 0.001]}
        scale={0.196}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_14.geometry}
        material={materials['1001']}
        rotation={[0, -0.007, 0.001]}
        scale={0.196}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_17.geometry}
        material={materials['1002']}
        rotation={[0, -0.007, 0.001]}
        scale={0.196}
      />
    </group>
  )
}

useGLTF.preload('/models/controller.glb', '/draco/')

