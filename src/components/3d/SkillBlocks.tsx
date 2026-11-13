/**
 * @fileoverview Pushable skill blocks: one per skill item. Bodies, light frames and
 * blob shadows are InstancedMeshes (3 draw calls); labels are drei Text, shown only
 * when the car is near. Physics runs in lib/blocks (pure).
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { CONFIG, SKILL_BLOCKS, SKILL_BLOCK_SIZE, WORLD_BOUNDS } from "../../config";
import { getContent, type Language } from "../../i18n";
import { stepBlocks, type BlockBody, type PusherState } from "../../lib/blocks";
import { useGameStore } from "../../store/gameStore";
import { FONT_URL } from "./Landmarks";
import { blockMat, emitCyanDim, getBlobMaterial } from "./materials";

const S = SKILL_BLOCK_SIZE;
const LABEL_DISTANCE = 26;
const PARAMS = { radius: 0.75, damping: 2.6, limitX: WORLD_BOUNDS.width / 2 - 3, limitZ: WORLD_BOUNDS.depth / 2 - 3 };

function frameGeometry(): THREE.BufferGeometry {
  const t = 0.07;
  const parts = [
    new THREE.BoxGeometry(S * 0.86, 0.02, t).translate(0, 0, S * 0.43),
    new THREE.BoxGeometry(S * 0.86, 0.02, t).translate(0, 0, -S * 0.43),
    new THREE.BoxGeometry(t, 0.02, S * 0.86).translate(S * 0.43, 0, 0),
    new THREE.BoxGeometry(t, 0.02, S * 0.86).translate(-S * 0.43, 0, 0),
  ];
  const merged = BufferGeometryMerge(parts);
  return merged.translate(0, S / 2 + 0.011, 0);
}

function BufferGeometryMerge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  if (!g) throw new Error("frameGeometry: merge failed");
  return g;
}

export function SkillBlocks({ language }: { language: Language }) {
  const n = SKILL_BLOCKS.length;
  const bodies = useRef<THREE.InstancedMesh>(null);
  const frames = useRef<THREE.InstancedMesh>(null);
  const shadows = useRef<THREE.InstancedMesh>(null);
  const labelRefs = useRef<(THREE.Group | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const state = useMemo<BlockBody[]>(() => SKILL_BLOCKS.map((b) => ({ x: b.x, z: b.z, vx: 0, vz: 0, yaw: 0, spin: 0 })), []);
  const pusher = useMemo<PusherState>(() => ({ x: 0, z: 0, vx: 0, vz: 0, r: CONFIG.car.radius }), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(S, S, S), []);
  const frameGeo = useMemo(frameGeometry, []);
  const blobGeo = useMemo(() => new THREE.PlaneGeometry(S * 2.1, S * 2.1).rotateX(-Math.PI / 2), []);
  useEffect(
    () => () => {
      boxGeo.dispose();
      frameGeo.dispose();
      blobGeo.dispose();
    },
    [boxGeo, frameGeo, blobGeo],
  );
  const labels = useMemo(() => {
    const cats = getContent(language).skills.categories;
    return SKILL_BLOCKS.map((b) => cats[b.categoryIndex]?.items[b.itemIndex] ?? "");
  }, [language]);

  const writeMatrices = () => {
    for (let i = 0; i < n; i++) {
      const b = state[i]!;
      dummy.position.set(b.x, S / 2, b.z);
      dummy.rotation.set(0, b.yaw, 0);
      dummy.updateMatrix();
      bodies.current?.setMatrixAt(i, dummy.matrix);
      frames.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(b.x, 0.03, b.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      shadows.current?.setMatrixAt(i, dummy.matrix);
    }
    for (const r of [bodies, frames, shadows]) if (r.current) r.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    writeMatrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const pose = useGameStore.getState().pose;
    pusher.x = pose.x;
    pusher.z = pose.z;
    pusher.vx = Math.sin(pose.rotation) * pose.speed;
    pusher.vz = Math.cos(pose.rotation) * pose.speed;
    // Skip the matrix rebuild + GPU upload while every block is at rest.
    const moved = stepBlocks(state, pusher, PARAMS, dt);
    if (moved) writeMatrices();
    for (let i = 0; i < n; i++) {
      const g = labelRefs.current[i];
      if (!g) continue;
      const b = state[i]!;
      const dx = b.x - pose.x;
      const dz = b.z - pose.z;
      g.visible = dx * dx + dz * dz < LABEL_DISTANCE * LABEL_DISTANCE;
      if (moved) {
        g.position.set(b.x, 0, b.z);
        g.rotation.y = b.yaw;
      }
    }
  });

  return (
    <group>
      <instancedMesh ref={bodies} args={[boxGeo, blockMat, n]} frustumCulled={false} />
      <instancedMesh ref={frames} args={[frameGeo, emitCyanDim, n]} frustumCulled={false} />
      <instancedMesh ref={shadows} args={[blobGeo, getBlobMaterial(), n]} frustumCulled={false} />
      {SKILL_BLOCKS.map((b, i) => (
        <group
          key={b.id}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          position={[b.x, 0, b.z]}
        >
          <Text
            font={FONT_URL}
            position={[0, S + 0.04, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.2}
            maxWidth={S * 0.8}
            textAlign="center"
            lineHeight={1}
            color={CONFIG.colors.text}
            anchorX="center"
            anchorY="middle"
          >
            {labels[i]}
          </Text>
        </group>
      ))}
    </group>
  );
}
