/**
 * @fileoverview Animated grass component with wind effect
 * Uses InstancedMesh for performance-optimized grass rendering
 */

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../config";

/**
 * AnimatedGrass - Procedural grass with wind animation using instances
 * Optimized with frame skipping and object pooling
 */
export function AnimatedGrass() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);
  const frameSkip = useRef(0);
  const dummyRef = useRef(new THREE.Object3D());
  
  // Create grass blade geometry and material
  const { geometry, positions, scales, rotationsY } = useMemo(() => {
    // Grass blade shape (triangle)
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -CONFIG.grass.size.width / 2, 0, 0,
      CONFIG.grass.size.width / 2, 0, 0,
      0, CONFIG.grass.size.height, 0,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    
    // Generate random positions for each grass blade
    const pos: THREE.Vector3[] = [];
    const scl: number[] = [];
    const rotY: number[] = [];
    const spread = CONFIG.grass.spread;
    const pathWidth = 4;
    
    for (let i = 0; i < CONFIG.grass.count; i++) {
      const x = (Math.random() - 0.5) * spread * 2;
      const z = (Math.random() - 0.5) * spread * 2;
      
      const onHorizontalPath = Math.abs(z) < pathWidth / 2;
      const onVerticalPath = Math.abs(x) < pathWidth / 2;
      
      // Avoid placing grass near zones
      const nearZone = 
        (Math.abs(x - 12) < 5 && Math.abs(z + 12) < 5) ||
        (Math.abs(x + 12) < 5 && Math.abs(z + 12) < 5) ||
        (Math.abs(x - 12) < 5 && Math.abs(z - 12) < 5) ||
        (Math.abs(x + 12) < 5 && Math.abs(z - 12) < 5);
      
      if (!onHorizontalPath && !onVerticalPath && !nearZone) {
        pos.push(new THREE.Vector3(x, -0.5, z));
        scl.push(0.8 + Math.random() * 0.4);
        rotY.push(Math.random() * Math.PI);
      }
    }
    
    return { geometry: geo, positions: pos, scales: scl, rotationsY: rotY };
  }, []);
  
  // Initialize instance matrices
  useEffect(() => {
    if (!meshRef.current) return;
    
    const dummy = dummyRef.current;
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.rotation.set(0, rotationsY[i], 0);
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, scales, rotationsY]);
  
  // Animate grass with wind - optimized with frame skipping
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Skip every other frame for performance
    frameSkip.current++;
    if (frameSkip.current % 2 !== 0) return;
    
    timeRef.current += delta * 2 * CONFIG.grass.windSpeed;
    const dummy = dummyRef.current;
    const globalWindTime = timeRef.current;
    
    const len = positions.length;
    for (let i = 0; i < len; i++) {
      const pos = positions[i];
      
      // Coherent wind wave based on position
      const wavePhase = pos.x * 0.15 + pos.z * 0.1;
      const windWave = Math.sin(globalWindTime * 2 + wavePhase);
      const bendAmount = (windWave * 0.5 + 0.5) * CONFIG.grass.windStrength;
      
      dummy.position.copy(pos);
      dummy.rotation.set(0, rotationsY[i], -bendAmount);
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  // Grass material
  const grassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#3d7a1e',
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.0,
    });
  }, []);
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, grassMaterial, positions.length]}
      castShadow
      receiveShadow
    />
  );
}
