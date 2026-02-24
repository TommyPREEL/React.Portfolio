/**
 * @fileoverview 3D UI component for in-world interface elements
 * Language switcher and close button that follow the camera
 */

import { Text } from "@react-three/drei";
import type { ThreeDUIProps } from "../../types";

/**
 * ThreeDUI - In-world UI elements
 * Features: Language toggle button, close button (when section is open)
 */
export function ThreeDUI({ 
  language, 
  onLanguageToggle, 
  activeSection, 
  onClose, 
  carPosition 
}: ThreeDUIProps) {
  return (
    <group>
      {/* Language Button - top right of view */}
      <group position={[carPosition.x + 8, 8, carPosition.z - 5]}>
        <mesh
          onClick={onLanguageToggle}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <planeGeometry args={[1.5, 0.6]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.7}
            emissive="#3b82f6"
            emissiveIntensity={0.2}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.35}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          {language.toUpperCase()}
        </Text>
      </group>

      {/* Close Button - only visible when section is open */}
      {activeSection && (
        <group position={[carPosition.x + 8, 6, carPosition.z - 5]}>
          <mesh
            onClick={onClose}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <planeGeometry args={[1.5, 0.6]} />
            <meshStandardMaterial
              color="#ef4444"
              transparent
              opacity={0.7}
              emissive="#ef4444"
              emissiveIntensity={0.2}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.35}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
          >
            ✕ CLOSE
          </Text>
        </group>
      )}
    </group>
  );
}
