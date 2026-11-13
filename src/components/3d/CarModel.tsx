/**
 * @fileoverview Visual car. Uses public/models/car.glb (nodes body, wheel-fl/fr/rl/rr,
 * materials emit-cyan / emit-orange) when ASSETS.car is set, else a procedural placeholder.
 * Both read speed from the store pose; nothing here touches React state per frame.
 */
import { Suspense, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ASSETS } from "../../config";
import { useGameStore } from "../../store/gameStore";
import { box, cyl, mergeParts, type Part } from "./kit";
import { emitCyan, emitOrange, litMat, palette } from "./materials";

if (ASSETS.car) useGLTF.preload(ASSETS.car);

const { m900, m700, m600 } = palette;

const BODY: Part[] = [
  box(1.3, 0.34, 2.4, 0, 0.42, 0, m700),
  box(1.05, 0.34, 1.1, 0, 0.77, -0.2, m600),
  box(1.1, 0.16, 0.8, 0, 0.58, 0.85, m700, [-0.18, 0, 0]),
  box(1.34, 0.1, 0.3, 0, 0.3, 1.05, m900),
  box(1.34, 0.1, 0.3, 0, 0.3, -1.05, m900),
  ...([-1, 1] as const).flatMap((sx): Part[] =>
    ([-1, 1] as const).map((sz) => cyl(0.33, 0.33, 0.3, sx * 0.72, 0.33, sz * 0.82, m900, [0, 0, Math.PI / 2], 12)),
  ),
];
const CYAN: Part[] = [
  box(0.3, 0.09, 0.05, -0.4, 0.5, 1.21),
  box(0.3, 0.09, 0.05, 0.4, 0.5, 1.21),
  box(0.04, 0.04, 2.0, -0.68, 0.2, 0),
  box(0.04, 0.04, 2.0, 0.68, 0.2, 0),
  box(0.7, 0.03, 0.03, 0, 0.96, 0.3),
];
const ORANGE: Part[] = [box(1.0, 0.08, 0.05, 0, 0.55, -1.21)];

function CarProcedural() {
  const geo = useMemo(() => ({ body: mergeParts(BODY), cyan: mergeParts(CYAN), orange: mergeParts(ORANGE) }), []);
  const tail = useMemo(() => emitOrange.clone(), []);
  const base = useMemo(() => emitOrange.color.clone(), []);
  useEffect(
    () => () => {
      geo.body.dispose();
      geo.cyan.dispose();
      geo.orange.dispose();
      tail.dispose();
    },
    [geo, tail],
  );
  useFrame(() => {
    const p = useGameStore.getState().pose;
    tail.color.copy(base).multiplyScalar(p.boosting ? 1.7 : 1);
  });
  return (
    <group>
      <mesh geometry={geo.body} material={litMat} />
      <mesh geometry={geo.cyan} material={emitCyan} />
      <mesh geometry={geo.orange} material={tail} />
    </group>
  );
}

const WHEEL_NAMES = ["wheel-fl", "wheel-fr", "wheel-rl", "wheel-rr"] as const;

function spinWheels(wheels: THREE.Object3D[], angle: number): void {
  for (const w of wheels) w.rotation.x += angle;
}

/** GLB is 1.6 m long with 0.22 wheels; the scene car is ~2.4 m with 0.33 wheels. */
const GLB_SCALE = 1.5;
const WHEEL_RADIUS = 0.22 * GLB_SCALE;

function CarGLB({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { model, wheels } = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      // Shared emissives so bloom/threshold match every other trim in the scene.
      if (mat.name === "emit-cyan") mesh.material = emitCyan;
      else if (mat.name === "emit-orange") mesh.material = emitOrange;
      else if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
    });
    const found = WHEEL_NAMES.map((n) => root.getObjectByName(n)).filter((o): o is THREE.Object3D => !!o);
    return { model: root, wheels: found };
  }, [scene]);
  useFrame((_, delta) => {
    const speed = useGameStore.getState().pose.speed;
    spinWheels(wheels, (speed * Math.min(delta, 0.05)) / WHEEL_RADIUS);
  });
  return (
    <group scale={GLB_SCALE}>
      <primitive object={model} />
    </group>
  );
}

export function CarModel() {
  if (!ASSETS.car) return <CarProcedural />;
  return (
    <Suspense fallback={<CarProcedural />}>
      <CarGLB url={ASSETS.car} />
    </Suspense>
  );
}
