/**
 * @fileoverview Zone component with billboard and ground interaction area
 * Interactive zones with neon styling and visual feedback
 */

import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { ZoneProps } from "../../types";

/**
 * Zone - Interactive area with billboard panel and ground activation zone
 * Features: Neon frame, support poles, ground zone with hover effects
 */
export function Zone({ position, label, icon, onEnter, isActive, pressEnterText }: ZoneProps) {
  const neonColor = isActive ? "#fbbf24" : "#3b82f6";
  const neonIntensity = isActive ? 2 : 0.8;
  
  // Panel dimensions
  const panelHeight = 3.5;
  const panelWidth = 4;
  const panelCenterY = 3;
  const poleHeight = 2.5;
  
  return (
    <group position={position}>
      {/* Billboard support poles */}
      <mesh position={[-1.8, poleHeight / 2, -0.3]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, poleHeight, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[1.8, poleHeight / 2, -0.3]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, poleHeight, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Pole bases */}
      <mesh position={[-1.8, 0.05, -0.3]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.1, 8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.8, 0.05, -0.3]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.1, 8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Billboard back panel - dark metal */}
      <mesh position={[0, panelCenterY, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[panelWidth + 0.3, panelHeight + 0.3, 0.15]} />
        <meshStandardMaterial 
          color="#1f2937" 
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>
      
      {/* Billboard main screen */}
      <mesh position={[0, panelCenterY, 0]} castShadow receiveShadow>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshStandardMaterial 
          color="#0f172a" 
          metalness={0.2}
          roughness={0.8}
          emissive="#1e3a5f"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Neon frame - Top */}
      <mesh position={[0, panelCenterY + panelHeight/2, 0.05]}>
        <boxGeometry args={[panelWidth + 0.15, 0.1, 0.06]} />
        <meshStandardMaterial 
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={neonIntensity}
        />
      </mesh>
      
      {/* Neon frame - Bottom */}
      <mesh position={[0, panelCenterY - panelHeight/2, 0.05]}>
        <boxGeometry args={[panelWidth + 0.15, 0.1, 0.06]} />
        <meshStandardMaterial 
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={neonIntensity}
        />
      </mesh>
      
      {/* Neon frame - Left */}
      <mesh position={[-panelWidth/2 - 0.05, panelCenterY, 0.05]}>
        <boxGeometry args={[0.1, panelHeight + 0.1, 0.06]} />
        <meshStandardMaterial 
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={neonIntensity}
        />
      </mesh>
      
      {/* Neon frame - Right */}
      <mesh position={[panelWidth/2 + 0.05, panelCenterY, 0.05]}>
        <boxGeometry args={[0.1, panelHeight + 0.1, 0.06]} />
        <meshStandardMaterial 
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={neonIntensity}
        />
      </mesh>
      
      {/* Icon on billboard */}
      <Text
        position={[0, panelCenterY + 0.5, 0.15]}
        fontSize={1.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {icon}
      </Text>
      
      {/* Label on billboard with neon effect */}
      <Text
        position={[0, panelCenterY - 1, 0.15]}
        fontSize={0.5}
        color={neonColor}
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        {label}
      </Text>

      {/* Ground zone - parking spot style */}
      <group position={[0, 0.01, 2.5]}>
        {/* Main platform */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={onEnter}
        >
          <planeGeometry args={[4.5, 3.5]} />
          <meshStandardMaterial
            color={isActive ? "#1e3a5f" : "#0f172a"}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            emissive={isActive ? "#3b82f6" : "#1e293b"}
            emissiveIntensity={isActive ? 0.4 : 0.1}
          />
        </mesh>

        {/* Neon border - Top */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1.75]}>
          <boxGeometry args={[4.5, 0.08, 0.02]} />
          <meshStandardMaterial
            color={neonColor}
            emissive={neonColor}
            emissiveIntensity={neonIntensity}
          />
        </mesh>
        
        {/* Neon border - Bottom */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 1.75]}>
          <boxGeometry args={[4.5, 0.08, 0.02]} />
          <meshStandardMaterial
            color={neonColor}
            emissive={neonColor}
            emissiveIntensity={neonIntensity}
          />
        </mesh>
        
        {/* Neon border - Left */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.25, 0.02, 0]}>
          <boxGeometry args={[0.08, 3.5, 0.02]} />
          <meshStandardMaterial
            color={neonColor}
            emissive={neonColor}
            emissiveIntensity={neonIntensity}
          />
        </mesh>
        
        {/* Neon border - Right */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.25, 0.02, 0]}>
          <boxGeometry args={[0.08, 3.5, 0.02]} />
          <meshStandardMaterial
            color={neonColor}
            emissive={neonColor}
            emissiveIntensity={neonIntensity}
          />
        </mesh>

        {/* Press Enter text when active */}
        {isActive && (
          <Text
            position={[0, 0.05, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.35}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
          >
            {pressEnterText}
          </Text>
        )}
      </group>
    </group>
  );
}
