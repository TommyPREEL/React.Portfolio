/**
 * @fileoverview Car component with physics and controls
 * Detailed 3D car model with rotation and smooth physics
 */

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG, ZONES } from "../../config";
import type { CarProps } from "../../types";

/**
 * Car - Main player vehicle with detailed 3D model
 * Features: Steering, acceleration, boost, teleport, and visual effects
 */
export function Car({ position, onMove, isDisabled, teleportTarget, onTeleportComplete }: CarProps) {
  const carRef = useRef<THREE.Group>(null);
  const speedRef = useRef(0);
  const rotationRef = useRef(Math.PI / 2);
  const teleportRef = useRef<THREE.Vector3 | null>(null);
  const [isBoosting, setIsBoosting] = useState(false);

  // Handle teleport target changes
  useEffect(() => {
    if (teleportTarget) {
      teleportRef.current = teleportTarget.clone();
      speedRef.current = 0; // stop the car during teleport
    }
  }, [teleportTarget]);

  useFrame(() => {
    if (!carRef.current) return;

    // Handle smooth teleport lerp
    if (teleportRef.current) {
      const tx = teleportRef.current.x;
      const tz = teleportRef.current.z;
      const dx = tx - carRef.current.position.x;
      const dz = tz - carRef.current.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.3) {
        // Arrived
        carRef.current.position.x = tx;
        carRef.current.position.z = tz;
        teleportRef.current = null;
        onTeleportComplete();
      } else {
        // Smooth lerp toward target
        const lerpSpeed = 0.08;
        carRef.current.position.x += dx * lerpSpeed;
        carRef.current.position.z += dz * lerpSpeed;
      }

      onMove(carRef.current.position.clone(), rotationRef.current);
      return; // Skip normal input during teleport
    }

    if (isDisabled) return;

    const keys = window.keys;
    const isBoost = !!keys.boost;
    const currentMaxSpeed = isBoost ? CONFIG.car.boostSpeed : CONFIG.car.maxSpeed;
    const currentAccel   = isBoost ? CONFIG.car.boostAcceleration : CONFIG.car.acceleration;

    // ── Joystick (mobile absolute world-space control) ──────────────
    const jx = typeof keys.joystickX === "number" ? (keys.joystickX as number) : 0;
    const jz = typeof keys.joystickZ === "number" ? (keys.joystickZ as number) : 0;
    const joystickMag = Math.sqrt(jx * jx + jz * jz);

    if (joystickMag > 0.05) {
      // Rotate car to face the absolute world direction of the joystick
      const targetRot = Math.atan2(jx, jz);
      let diff = targetRot - rotationRef.current;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      rotationRef.current += diff * 0.18;

      // Drive at speed proportional to deflection
      speedRef.current = Math.min(joystickMag, 1) * currentMaxSpeed;
    } else {
      // ── Keyboard control ──────────────────────────────────────────
      let inputAccel = 0;
      let inputSteering = 0;

      if (keys.forward)  inputAccel    =  currentAccel;
      if (keys.backward) inputAccel    = -currentAccel;
      if (keys.left)     inputSteering =  CONFIG.car.steeringSpeed;
      if (keys.right)    inputSteering = -CONFIG.car.steeringSpeed;

      speedRef.current += inputAccel;
      speedRef.current = Math.max(-currentMaxSpeed, Math.min(currentMaxSpeed, speedRef.current));

      if (inputAccel === 0) speedRef.current *= CONFIG.car.friction;

      if (Math.abs(speedRef.current) > 0.001) {
        const steeringDirection = speedRef.current > 0 ? 1 : -1;
        rotationRef.current += inputSteering * steeringDirection;
      }
    }

    // Calculate forward direction from current rotation
    const cosRot = Math.cos(rotationRef.current);
    const sinRot = Math.sin(rotationRef.current);

    // Apply velocity in car's forward direction
    const deltaX = speedRef.current * sinRot;
    const deltaZ = speedRef.current * cosRot;

    carRef.current.position.x += deltaX;
    carRef.current.position.z += deltaZ;

    // Check collision with billboard poles
    const carRadius = 0.8;
    
    for (const zone of ZONES) {
      // Pole positions relative to zone center
      const poleOffsets = [
        { x: -1.8, z: -0.3 },
        { x: 1.8, z: -0.3 }
      ];
      const poleRadius = 0.25;
      
      for (const offset of poleOffsets) {
        const poleX = zone.position[0] + offset.x;
        const poleZ = zone.position[2] + offset.z;
        
        const dx = carRef.current.position.x - poleX;
        const dz = carRef.current.position.z - poleZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < carRadius + poleRadius) {
          // Push car away from pole
          const pushDist = (carRadius + poleRadius) - dist;
          if (dist > 0.01) {
            carRef.current.position.x += (dx / dist) * pushDist;
            carRef.current.position.z += (dz / dist) * pushDist;
          }
          // Stop car on collision
          speedRef.current *= 0.1;
        }
      }
    }

    // Clamp to world bounds (horizontal world)
    const boundsX = CONFIG.world.width / 2 - 2;
    const boundsZ = CONFIG.world.depth / 2 - 2;
    carRef.current.position.x = Math.max(-boundsX, Math.min(boundsX, carRef.current.position.x));
    carRef.current.position.z = Math.max(-boundsZ, Math.min(boundsZ, carRef.current.position.z));

    // Update car rotation for display
    carRef.current.rotation.y = rotationRef.current;

    // Update boost visual state
    setIsBoosting(isBoost && Math.abs(speedRef.current) > 0.01);

    onMove(carRef.current.position.clone(), rotationRef.current);
  });

  // Wheel positions
  const wheelPositions: [number, number, number][] = [
    [-0.5, 0, 0.55],
    [0.5, 0, 0.55],
    [-0.5, 0, -0.55],
    [0.5, 0, -0.55],
  ];

  return (
    <group ref={carRef} position={position}>
      {/* === TESLA-STYLE CAR DESIGN === */}
      
      {/* Main body - sleek lower chassis */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.1, 0.25, 2.2]} />
        <meshStandardMaterial
          color="#dc2626"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Body sculpting - side curves (left) */}
      <mesh castShadow receiveShadow position={[-0.52, 0.22, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.12, 0.2, 2.1]} />
        <meshStandardMaterial color="#b91c1c" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Body sculpting - side curves (right) */}
      <mesh castShadow receiveShadow position={[0.52, 0.22, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.12, 0.2, 2.1]} />
        <meshStandardMaterial color="#b91c1c" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Hood - sloping front */}
      <mesh castShadow receiveShadow position={[0, 0.28, 0.65]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.0, 0.08, 0.9]} />
        <meshStandardMaterial color="#dc2626" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Trunk - sloping rear */}
      <mesh castShadow receiveShadow position={[0, 0.28, -0.75]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.0, 0.08, 0.7]} />
        <meshStandardMaterial color="#dc2626" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Cabin/Greenhouse - Tesla style curved roof */}
      <mesh castShadow receiveShadow position={[0, 0.48, -0.1]}>
        <boxGeometry args={[0.95, 0.35, 1.3]} />
        <meshStandardMaterial color="#dc2626" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Roof panel - glass roof effect */}
      <mesh position={[0, 0.67, -0.1]}>
        <boxGeometry args={[0.85, 0.02, 1.1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* === WINDOWS === */}
      
      {/* Windshield - large Tesla-style */}
      <mesh position={[0, 0.52, 0.45]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[0.88, 0.5, 0.05]} />
        <meshPhysicalMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.4} 
          metalness={0.1}
          roughness={0}
          clearcoat={1}
        />
      </mesh>

      {/* Rear window - sloped */}
      <mesh position={[0, 0.52, -0.65]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[0.85, 0.4, 0.05]} />
        <meshPhysicalMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.35} 
          metalness={0.1}
          roughness={0}
          clearcoat={1}
        />
      </mesh>

      {/* Side windows - left */}
      <mesh position={[-0.48, 0.5, -0.1]}>
        <boxGeometry args={[0.03, 0.28, 1.0]} />
        <meshPhysicalMaterial color="#87ceeb" transparent opacity={0.35} clearcoat={1} />
      </mesh>

      {/* Side windows - right */}
      <mesh position={[0.48, 0.5, -0.1]}>
        <boxGeometry args={[0.03, 0.28, 1.0]} />
        <meshPhysicalMaterial color="#87ceeb" transparent opacity={0.35} clearcoat={1} />
      </mesh>

      {/* === FRONT FASCIA === */}
      
      {/* Front bumper - smooth */}
      <mesh castShadow position={[0, 0.12, 1.12]}>
        <boxGeometry args={[1.05, 0.2, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Front air intake - lower */}
      <mesh position={[0, 0.06, 1.1]}>
        <boxGeometry args={[0.7, 0.06, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* === HEADLIGHTS - Tesla LED style === */}
      
      {/* Left headlight housing */}
      <mesh position={[-0.38, 0.22, 1.05]}>
        <boxGeometry args={[0.25, 0.08, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Left headlight LED strip */}
      <mesh position={[-0.38, 0.22, 1.1]}>
        <boxGeometry args={[0.22, 0.04, 0.02]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={2} 
        />
      </mesh>

      {/* Right headlight housing */}
      <mesh position={[0.38, 0.22, 1.05]}>
        <boxGeometry args={[0.25, 0.08, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Right headlight LED strip */}
      <mesh position={[0.38, 0.22, 1.1]}>
        <boxGeometry args={[0.22, 0.04, 0.02]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={2} 
        />
      </mesh>

      {/* === HEADLIGHT POINT LIGHTS === */}
      <pointLight position={[-0.38, 0.22, 1.3]} color="#ffffff" intensity={0.8} distance={8} decay={2} />
      <pointLight position={[0.38, 0.22, 1.3]} color="#ffffff" intensity={0.8} distance={8} decay={2} />

      {/* === REAR FASCIA === */}
      
      {/* Rear bumper */}
      <mesh castShadow position={[0, 0.1, -1.12]}>
        <boxGeometry args={[1.05, 0.18, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* === TAILLIGHTS - Tesla LED bar style === */}
      
      {/* Left taillight */}
      <mesh position={[-0.35, 0.28, -1.08]}>
        <boxGeometry args={[0.25, 0.06, 0.04]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={1.5} 
        />
      </mesh>

      {/* Right taillight */}
      <mesh position={[0.35, 0.28, -1.08]}>
        <boxGeometry args={[0.25, 0.06, 0.04]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={1.5} 
        />
      </mesh>

      {/* Center taillight bar - connecting strip */}
      <mesh position={[0, 0.28, -1.08]}>
        <boxGeometry args={[0.5, 0.03, 0.03]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={1} 
        />
      </mesh>

      {/* === TAILLIGHT POINT LIGHTS === */}
      <pointLight position={[-0.35, 0.28, -1.3]} color="#ff0000" intensity={0.5} distance={5} decay={2} />
      <pointLight position={[0.35, 0.28, -1.3]} color="#ff0000" intensity={0.5} distance={5} decay={2} />

      {/* === WHEELS - Modern alloy style === */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          {/* Tire */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.22, 24]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
          </mesh>
          {/* Wheel rim - Tesla aero style */}
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.24, 24]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Rim center cap */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshStandardMaterial color="#dc2626" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* === SIDE DETAILS === */}
      
      {/* Door handle left */}
      <mesh position={[-0.56, 0.38, 0.1]}>
        <boxGeometry args={[0.02, 0.04, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Door handle right */}
      <mesh position={[0.56, 0.38, 0.1]}>
        <boxGeometry args={[0.02, 0.04, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Side mirror left */}
      <mesh castShadow position={[-0.55, 0.45, 0.4]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Side mirror right */}
      <mesh castShadow position={[0.55, 0.45, 0.4]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* === BOOST EFFECT === */}
      {isBoosting && (
        <>
          <mesh position={[-0.25, 0.08, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.4, 8]} />
            <meshStandardMaterial 
              color="#ff4400" 
              emissive="#ff6600" 
              emissiveIntensity={3}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[0.25, 0.08, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.4, 8]} />
            <meshStandardMaterial 
              color="#ff4400" 
              emissive="#ff6600" 
              emissiveIntensity={3}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Boost lights */}
          <pointLight position={[0, 0.1, -1.4]} color="#ff4400" intensity={2} distance={4} decay={2} />
        </>
      )}
    </group>
  );
}
