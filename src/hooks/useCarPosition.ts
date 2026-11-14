/**
 * @fileoverview Throttled car position for 2D UI (minimap, escape menu).
 * The 3D loop never touches React; this polls the store pose at a low rate.
 */
import { useEffect, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";

export function useThrottledCarPosition(hz = 8): THREE.Vector3 {
  const [position, setPosition] = useState(() => {
    const { x, z } = useGameStore.getState().pose;
    return new THREE.Vector3(x, 0, z);
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      const { x, z } = useGameStore.getState().pose;
      setPosition((prev) => (Math.abs(prev.x - x) < 0.05 && Math.abs(prev.z - z) < 0.05 ? prev : new THREE.Vector3(x, 0, z)));
    }, 1000 / hz);
    return () => window.clearInterval(id);
  }, [hz]);

  return position;
}
