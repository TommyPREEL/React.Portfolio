/**
 * @fileoverview High 3/4 chase camera with lag, look-ahead and speed zoom.
 * Reduced motion: no look-ahead, no zoom, no fov kick.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../config";
import { useGameStore } from "../../store/gameStore";

export function CameraRig() {
  const s = useMemo(() => ({ desired: new THREE.Vector3(), look: new THREE.Vector3(), aim: new THREE.Vector3() }), []);
  const snapped = useRef(false);

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const { pose, reducedMotion } = useGameStore.getState();
    const cfg = CONFIG.camera;
    const fx = Math.sin(pose.rotation);
    const fz = Math.cos(pose.rotation);
    const speedRatio = Math.min(1, Math.abs(pose.speed) / CONFIG.car.boostSpeed);
    const ahead = reducedMotion ? 0 : pose.speed * cfg.lookAhead;
    const chase = reducedMotion ? 0 : cfg.chase;
    const zoom = reducedMotion ? 0 : cfg.zoomOut * speedRatio;

    const tx = pose.x + fx * ahead;
    const tz = pose.z + fz * ahead;
    s.aim.set(tx, 0, tz);
    s.desired.set(tx + cfg.offset[0] - fx * chase, cfg.offset[1] + zoom, tz + cfg.offset[2] - fz * chase + zoom * 0.8);

    if (!snapped.current) {
      camera.position.copy(s.desired);
      s.look.copy(s.aim);
      snapped.current = true;
    } else {
      const lambda = reducedMotion ? cfg.smoothing * 2 : cfg.smoothing;
      camera.position.lerp(s.desired, 1 - Math.exp(-lambda * dt));
      s.look.lerp(s.aim, 1 - Math.exp(-lambda * 1.6 * dt));
    }
    camera.lookAt(s.look);

    const cam = camera as THREE.PerspectiveCamera;
    const fov = cfg.fov + (reducedMotion || !pose.boosting ? 0 : cfg.fovBoost);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov += (fov - cam.fov) * (1 - Math.exp(-4 * dt));
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
