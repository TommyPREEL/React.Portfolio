/**
 * @fileoverview Cyan light-trail ribbon behind the car (~1.5 s), brighter when boosting.
 * Buffer logic in lib/trail; colours are HDR so only the boosted trail blooms.
 */
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../config";
import { advanceTrail, collapseTrail, createTrail, setTrailHead, trailFade, type Trail } from "../../lib/trail";
import { useGameStore, type CarPose } from "../../store/gameStore";

const SAMPLES = 40;
const INTERVAL = 0.04;
const HALF_WIDTH = 0.22;
const Y = 0.12; // above the raised road

interface Rig {
  trail: Trail;
  geometry: THREE.BufferGeometry;
  material: THREE.MeshBasicMaterial;
  colors: Float32Array;
  cyan: THREE.Color;
  since: number;
  lastX: number;
  lastZ: number;
  init: boolean;
}

function createRig(): Rig {
  const trail = createTrail(SAMPLES);
  const geometry = new THREE.BufferGeometry();
  const pos = new THREE.BufferAttribute(trail.positions, 3);
  pos.setUsage(THREE.DynamicDrawUsage);
  const colors = new Float32Array(SAMPLES * 6);
  const colAttr = new THREE.BufferAttribute(colors, 3);
  colAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", pos);
  geometry.setAttribute("color", colAttr);
  const idx: number[] = [];
  for (let i = 0; i < SAMPLES - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  geometry.setIndex(idx);
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  return { trail, geometry, material, colors, cyan: new THREE.Color(CONFIG.colors.cyan), since: 0, lastX: 0, lastZ: 0, init: false };
}

function updateRig(rig: Rig, pose: CarPose, dt: number): void {
  const { trail, colors, cyan } = rig;
  const sin = Math.sin(pose.rotation);
  const cos = Math.cos(pose.rotation);
  const hx = pose.x - sin * 0.95;
  const hz = pose.z - cos * 0.95;

  setTrailHead(trail, hx, hz, Y, cos, -sin, HALF_WIDTH);
  if (!rig.init || Math.hypot(hx - rig.lastX, hz - rig.lastZ) > 3) {
    collapseTrail(trail);
    rig.init = true;
  }
  rig.lastX = hx;
  rig.lastZ = hz;
  rig.since += dt;
  if (rig.since >= INTERVAL) {
    rig.since = 0;
    advanceTrail(trail);
  }

  const gain = Math.min(1, Math.abs(pose.speed) / 3) * (pose.boosting ? 2.6 : 0.9);
  for (let i = 0; i < SAMPLES; i++) {
    const k = trailFade(i, SAMPLES) * gain;
    const o = i * 6;
    colors[o] = colors[o + 3] = cyan.r * k;
    colors[o + 1] = colors[o + 4] = cyan.g * k;
    colors[o + 2] = colors[o + 5] = cyan.b * k;
  }
  rig.geometry.attributes.position!.needsUpdate = true;
  rig.geometry.attributes.color!.needsUpdate = true;
}

export function LightTrail() {
  const rig = useMemo(() => createRig(), []);
  useEffect(
    () => () => {
      rig.geometry.dispose();
      rig.material.dispose();
    },
    [rig],
  );
  useFrame((_, delta) => updateRig(rig, useGameStore.getState().pose, Math.min(delta, 1 / 20)));
  return <mesh geometry={rig.geometry} material={rig.material} frustumCulled={false} renderOrder={2} />;
}
