/**
 * @fileoverview World component - Main 3D environment
 * Contains ground, paths, zones, car, and camera logic
 */

import { useFrame } from "@react-three/fiber";
import { CONFIG, ZONES } from "../../config";
import { Car } from "./Car";
import { Zone } from "./Zone";
import { PhysicsObjects } from "./PhysicsObjects";
import { ThreeDUI } from "./ThreeDUI";
import type { WorldProps } from "../../types";

/**
 * World - 3D environment with all game elements
 * Features: Ground, grass, paths, zones, car, camera following
 */
export function World({ 
  onZoneEnter, 
  carPosition, 
  onCarMove, 
  activeZone, 
  setActiveZone, 
  language, 
  onLanguageToggle, 
  activeSection, 
  onCloseSection 
}: WorldProps) {
  
  // Check which zone the car is in (using AABB collision)
  useFrame(() => {
    let nearestZone: string | null = null;
    
    // Car dimensions (approximate half-sizes)
    const carHalfWidth = 0.6;
    const carHalfLength = 1.0;
    
    // Zone dimensions
    const { halfWidth: zoneHalfWidth, halfLength: zoneHalfLength, offsetZ: zoneOffsetZ } = CONFIG.zone;

    for (const zone of ZONES) {
      const zoneX = zone.position[0];
      const zoneZ = zone.position[2] + zoneOffsetZ;
      
      // Check if any part of the car overlaps with the zone (AABB collision)
      const carLeft = carPosition.x - carHalfWidth;
      const carRight = carPosition.x + carHalfWidth;
      const carFront = carPosition.z - carHalfLength;
      const carBack = carPosition.z + carHalfLength;
      
      const zoneLeft = zoneX - zoneHalfWidth;
      const zoneRight = zoneX + zoneHalfWidth;
      const zoneFront = zoneZ - zoneHalfLength;
      const zoneBack = zoneZ + zoneHalfLength;
      
      // AABB overlap check
      const overlapsX = carLeft < zoneRight && carRight > zoneLeft;
      const overlapsZ = carFront < zoneBack && carBack > zoneFront;
      
      if (overlapsX && overlapsZ) {
        nearestZone = zone.id;
        break;
      }
    }

    setActiveZone(nearestZone);
  });

  // Camera follows car position
  useFrame(({ camera }) => {
    const targetX = carPosition.x;
    const targetZ = carPosition.z + 8;
    const targetY = CONFIG.camera.height;

    camera.position.x += (targetX - camera.position.x) * CONFIG.camera.smoothing;
    camera.position.z += (targetZ - camera.position.z) * CONFIG.camera.smoothing;
    camera.position.y += (targetY - camera.position.y) * CONFIG.camera.smoothing;
    
    camera.lookAt(carPosition.x, 0, carPosition.z);
  });

  return (
    <>
      {/* Background ground - lighter blue (non-playable area) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[CONFIG.world.width + 40, CONFIG.world.depth + 40]} />
        <meshStandardMaterial
          color="#1e3a5f"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Playable area - sky blue solid color */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[CONFIG.world.width, CONFIG.world.depth]} />
        <meshStandardMaterial 
          color="#3b82f6"
          roughness={0.6}
        />
      </mesh>

      {/* Neon border around playable area - top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -CONFIG.world.depth / 2]}>
        <planeGeometry args={[CONFIG.world.width + 0.3, 0.15]} />
        <meshStandardMaterial 
          color={CONFIG.colors.neonCyan}
          emissive={CONFIG.colors.neonCyan}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Neon border - bottom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, CONFIG.world.depth / 2]}>
        <planeGeometry args={[CONFIG.world.width + 0.3, 0.15]} />
        <meshStandardMaterial 
          color={CONFIG.colors.neonCyan}
          emissive={CONFIG.colors.neonCyan}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Neon border - left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-CONFIG.world.width / 2, 0.01, 0]}>
        <planeGeometry args={[0.15, CONFIG.world.depth]} />
        <meshStandardMaterial 
          color={CONFIG.colors.neonCyan}
          emissive={CONFIG.colors.neonCyan}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Neon border - right */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CONFIG.world.width / 2, 0.01, 0]}>
        <planeGeometry args={[0.15, CONFIG.world.depth]} />
        <meshStandardMaterial 
          color={CONFIG.colors.neonCyan}
          emissive={CONFIG.colors.neonCyan}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Zones */}
      {ZONES.map((zone) => (
        <Zone
          key={zone.id}
          position={zone.position}
          label={zone.label}
          icon={zone.icon}
          onEnter={() => onZoneEnter(zone.id)}
          isActive={activeZone === zone.id}
        />
      ))}

      {/* Car */}
      <Car 
        position={carPosition} 
        onMove={onCarMove} 
        isDisabled={!!activeSection} 
      />

      {/* Physics Objects - pushable 3D objects */}
      <PhysicsObjects carPosition={carPosition} />

      {/* 3D UI Components */}
      <ThreeDUI
        language={language}
        onLanguageToggle={onLanguageToggle}
        activeSection={activeSection}
        onClose={onCloseSection}
        carPosition={carPosition}
      />
    </>
  );
}
