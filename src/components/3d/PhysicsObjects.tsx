/**
 * @fileoverview Physics objects that the car can push around
 * Simple 3D objects with basic physics simulation
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PhysicsObjectsProps {
  carPosition: THREE.Vector3;
}

/**
 * PhysicsObjects - Collection of pushable objects
 */
export function PhysicsObjects({ carPosition }: PhysicsObjectsProps) {
  // Generate random objects between zones
  const objects = useMemo(() => {
    const items: { position: [number, number, number]; type: 'box' | 'sphere' | 'cone'; color: string; size: number }[] = [];
    
    // Objects between zones
    const positions = [
      [-16, 0.3, 3], [-16, 0.3, -3],
      [0, 0.3, 4], [0, 0.3, -4],
      [16, 0.3, 3], [16, 0.3, -3],
      [-20, 0.3, 5], [20, 0.3, -5],
      [-4, 0.3, 6], [4, 0.3, -6],
    ];
    
    const colors = ['#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa'];
    const types: ('box' | 'sphere' | 'cone')[] = ['box', 'sphere', 'cone'];
    
    positions.forEach((pos, i) => {
      items.push({
        position: pos as [number, number, number],
        type: types[i % types.length],
        color: colors[i % colors.length],
        size: 0.4 + Math.random() * 0.3,
      });
    });
    
    return items;
  }, []);

  // Track object positions and apply physics
  const objectRefs = useRef<THREE.Mesh[]>([]);
  const velocities = useRef<THREE.Vector3[]>(objects.map(() => new THREE.Vector3()));

  useFrame(() => {
    const carRadius = 1.2;
    const friction = 0.95;
    const pushForce = 0.15;

    objectRefs.current.forEach((mesh, i) => {
      if (!mesh) return;

      const vel = velocities.current[i];
      
      // Check collision with car
      const dx = mesh.position.x - carPosition.x;
      const dz = mesh.position.z - carPosition.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < carRadius && dist > 0.1) {
        // Push away from car
        const pushX = (dx / dist) * pushForce;
        const pushZ = (dz / dist) * pushForce;
        vel.x += pushX;
        vel.z += pushZ;
      }

      // Apply velocity
      mesh.position.x += vel.x;
      mesh.position.z += vel.z;
      
      // Apply friction
      vel.x *= friction;
      vel.z *= friction;

      // Keep within bounds
      const boundsX = 35;
      const boundsZ = 12;
      mesh.position.x = Math.max(-boundsX, Math.min(boundsX, mesh.position.x));
      mesh.position.z = Math.max(-boundsZ, Math.min(boundsZ, mesh.position.z));

      // Rotate based on velocity
      mesh.rotation.x += vel.z * 2;
      mesh.rotation.z -= vel.x * 2;
    });
  });

  return (
    <group>
      {objects.map((obj, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) objectRefs.current[i] = el; }}
          position={obj.position}
          castShadow
          receiveShadow
        >
          {obj.type === 'box' && <boxGeometry args={[obj.size, obj.size, obj.size]} />}
          {obj.type === 'sphere' && <sphereGeometry args={[obj.size / 2, 16, 16]} />}
          {obj.type === 'cone' && <coneGeometry args={[obj.size / 2, obj.size, 8]} />}
          <meshStandardMaterial 
            color={obj.color} 
            metalness={0.4} 
            roughness={0.5}
            emissive={obj.color}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
