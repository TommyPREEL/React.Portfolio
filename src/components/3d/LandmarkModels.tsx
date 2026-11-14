/**
 * @fileoverview Blender GLB versions of the arcade row, server rack and radar antenna.
 * Assets are 1:1 scale, front = +Z, origin at ground centre (same local frame as the procedural
 * placeholders in Landmarks.tsx). Meshopt rewrote the node transforms, so they are never
 * overwritten: placement lives on parent groups / instance matrices that are multiplied with them.
 * Static `baked-*` materials are exported unlit (MeshBasicMaterial + sRGB atlas) and kept as is.
 */
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ASSETS, CONFIG, INTERACTABLES, type Interactable } from "../../config";
import { useGameStore } from "../../store/gameStore";
import { emitCyan, emitOrange } from "./materials";

export const FONT_URL = "/fonts/chakra-petch-latin-600-normal.woff";

const ARCADE_ITEMS = INTERACTABLES.filter((i) => i.kind === "arcade");
const screenUrl = (it: Interactable) => `/projects/${it.projectId}-640.jpg`;

if (ASSETS.arcade) useGLTF.preload(ASSETS.arcade);
if (ASSETS.rack) useGLTF.preload(ASSETS.rack);
if (ASSETS.antenna) useGLTF.preload(ASSETS.antenna);
if (ASSETS.garage) useGLTF.preload(ASSETS.garage);
if (ASSETS.hangar) useGLTF.preload(ASSETS.hangar);
if (ASSETS.islandModel) useGLTF.preload(ASSETS.islandModel);
// Same textures as the procedural fallback screens, so a fallback never suspends the outer boundary.
useTexture.preload(ARCADE_ITEMS.map(screenUrl));

type Activate = (it: Interactable) => void;

function useActiveRef(id: string): { current: boolean } {
  const ref = useRef(useGameStore.getState().activeTriggerId === id);
  useEffect(() => {
    ref.current = useGameStore.getState().activeTriggerId === id;
    return useGameStore.subscribe((s) => {
      ref.current = s.activeTriggerId === id;
    });
  }, [id]);
  return ref;
}

/** Atlas colour space must be sRGB; the loader already does this, this guards against asset changes. */
function fixBaked(root: THREE.Object3D): void {
  root.traverse((o) => {
    const mat = (o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).material as THREE.MeshBasicMaterial) : null;
    if (mat?.map) mat.map.colorSpace = THREE.SRGBColorSpace;
  });
}

function Shell({ it, onActivate, children }: { it: Interactable; onActivate: Activate; children: ReactNode }) {
  return (
    <group
      position={[it.position[0], 0, it.position[2]]}
      rotation-y={it.rotationY}
      onClick={(e) => {
        e.stopPropagation();
        onActivate(it);
      }}
    >
      {children}
    </group>
  );
}

// ---------------------------------------------------------------- arcade row
const CYAN = emitCyan.color;
const ORANGE = emitOrange.color;
const SCREEN_DIM = new THREE.Color(0.9, 0.9, 0.9);
const SCREEN_LIT = new THREE.Color(1, 1, 1);

interface ScreenBase {
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
}

function ArcadeScreen({ it, base }: { it: Interactable; base: ScreenBase }) {
  const loaded = useTexture(screenUrl(it));
  // glTF UVs have a top-left origin: needs flipY=false. The clone shares the image with the
  // (flipY=true) texture used by the procedural fallback.
  const map = useMemo(() => {
    const t = loaded.clone();
    t.flipY = false;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [loaded]);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const active = useActiveRef(it.id);
  useFrame(() => {
    mat.current?.color.copy(active.current ? SCREEN_LIT : SCREEN_DIM);
  });
  useEffect(() => () => map.dispose(), [map]);
  return (
    <group position={[it.position[0], 0, it.position[2]]} rotation-y={it.rotationY}>
      <mesh geometry={base.geometry} position={base.position} quaternion={base.quaternion} scale={base.scale}>
        <meshBasicMaterial ref={mat} map={map} color="#ffffff" />
      </mesh>
    </group>
  );
}

/** Only the active cabinet's trim turns orange (still one draw call). */
function paintTrim(trim: THREE.InstancedMesh, activeId: string | null): void {
  ARCADE_ITEMS.forEach((it, i) => trim.setColorAt(i, it.id === activeId ? ORANGE : CYAN));
  if (trim.instanceColor) trim.instanceColor.needsUpdate = true;
}

export function ArcadeRowGLB({ onActivate }: { onActivate: Activate }) {
  const { scene } = useGLTF(ASSETS.arcade!);
  const rig = useMemo(() => {
    scene.updateMatrixWorld(true);
    const mesh = (n: string) => scene.getObjectByName(n) as THREE.Mesh;
    const cab = mesh("cabinet");
    const trimSrc = mesh("trim");
    const screen = mesh("screen");
    fixBaked(cab);
    const place = new THREE.Matrix4();
    const m = new THREE.Matrix4();
    const count = ARCADE_ITEMS.length;
    // One draw call for the 7 bodies and one for the 7 trims (per-instance colour: cyan, orange when active).
    const body = new THREE.InstancedMesh(cab.geometry, cab.material, count);
    const trimMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const trim = new THREE.InstancedMesh(trimSrc.geometry, trimMat, count);
    ARCADE_ITEMS.forEach((it, i) => {
      place.makeRotationY(it.rotationY).setPosition(it.position[0], 0, it.position[2]);
      body.setMatrixAt(i, m.multiplyMatrices(place, cab.matrixWorld));
      trim.setMatrixAt(i, m.multiplyMatrices(place, trimSrc.matrixWorld));
      trim.setColorAt(i, CYAN);
    });
    const sBase: ScreenBase = { geometry: screen.geometry, position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3() };
    screen.matrixWorld.decompose(sBase.position, sBase.quaternion, sBase.scale);
    return { body, trim, trimMat, sBase };
  }, [scene]);
  useEffect(() => {
    const apply = (id: string | null) => paintTrim(rig.trim, id);
    let last = useGameStore.getState().activeTriggerId;
    apply(last);
    return useGameStore.subscribe((s) => {
      if (s.activeTriggerId === last) return;
      last = s.activeTriggerId;
      apply(last);
    });
  }, [rig]);
  useEffect(
    () => () => {
      rig.body.dispose();
      rig.trim.dispose();
      rig.trimMat.dispose();
    },
    [rig],
  );
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        let best = ARCADE_ITEMS[0]!;
        let bd = Infinity;
        for (const it of ARCADE_ITEMS) {
          const d = Math.abs(e.point.x - it.position[0]);
          if (d < bd) {
            bd = d;
            best = it;
          }
        }
        onActivate(best);
      }}
    >
      <primitive object={rig.body} />
      <primitive object={rig.trim} />
      {ARCADE_ITEMS.map((it) => (
        <ArcadeScreen key={it.id} it={it} base={rig.sBase} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- server rack
export function ServerRackGLB({ it, onActivate }: { it: Interactable; onActivate: Activate }) {
  const { scene } = useGLTF(ASSETS.rack!);
  const ledMat = useMemo(() => emitCyan.clone(), []);
  const root = useMemo(() => {
    const r = scene.clone(true); // geometries and the baked material stay shared with the cache
    fixBaked(r);
    (r.getObjectByName("leds") as THREE.Mesh).material = ledMat;
    return r;
  }, [scene, ledMat]);
  const active = useActiveRef(it.id);
  useEffect(() => () => ledMat.dispose(), [ledMat]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const on = Math.sin(t * 7) + Math.sin(t * 3.1) > 0.2;
    ledMat.color.copy(active.current ? ORANGE : CYAN).multiplyScalar(on ? 1 : 0.15);
  });
  return (
    <Shell it={it} onActivate={onActivate}>
      <primitive object={root} />
    </Shell>
  );
}

// ---------------------------------------------------------------- antenna
const RING_COUNT = 3;

/** Expanding ground rings emitted by the antenna (shared by the GLB and procedural versions). */
export function PulseRings() {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const mats = useMemo(
    () => Array.from({ length: RING_COUNT }, () => new THREE.MeshBasicMaterial({ color: emitCyan.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })),
    [],
  );
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);
  useFrame(({ clock }) => {
    const still = useGameStore.getState().reducedMotion;
    for (let i = 0; i < RING_COUNT; i++) {
      const mesh = rings.current[i];
      if (!mesh) continue;
      const t = still ? 0.5 : (clock.elapsedTime * 0.35 + i / RING_COUNT) % 1;
      mesh.scale.setScalar(0.5 + t * 8);
      (mesh.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.5;
    }
  });
  return (
    <>
      {mats.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
          material={m}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.08, 0]}
        >
          <ringGeometry args={[0.96, 1, 48]} />
        </mesh>
      ))}
    </>
  );
}

export function AntennaGLB({ it, onActivate }: { it: Interactable; onActivate: Activate }) {
  const { scene } = useGLTF(ASSETS.antenna!);
  const beaconMat = useMemo(() => emitOrange.clone(), []);
  const parts = useMemo(() => {
    const r = scene.clone(true);
    fixBaked(r);
    const mesh = (n: string) => r.getObjectByName(n) as THREE.Mesh;
    mesh("beacon").material = beaconMat;
    mesh("trim").material = emitCyan;
    return r;
  }, [scene, beaconMat]);
  const dishRef = useRef<THREE.Object3D | null>(null);
  const trimRef = useRef<THREE.Mesh | null>(null);
  useEffect(() => {
    dishRef.current = parts.getObjectByName("dish") ?? null;
    trimRef.current = (parts.getObjectByName("trim") as THREE.Mesh | undefined) ?? null;
  }, [parts]);
  const active = useActiveRef(it.id);
  useEffect(() => () => beaconMat.dispose(), [beaconMat]);
  useFrame(({ clock }, dt) => {
    const still = useGameStore.getState().reducedMotion;
    // The dish node only carries translation + scale, its axis is at local x=0,z=0: spin its own Y rotation.
    if (!still && dishRef.current) dishRef.current.rotation.y += dt * 0.7;
    const want = active.current ? emitOrange : emitCyan;
    const trim = trimRef.current;
    if (trim && trim.material !== want) trim.material = want;
    beaconMat.color.copy(ORANGE).multiplyScalar(still ? 1 : 0.55 + 0.45 * Math.sin(clock.elapsedTime * 3.2));
  });
  return (
    <Shell it={it} onActivate={onActivate}>
      <primitive object={parts} />
      <PulseRings />
    </Shell>
  );
}

// ---------------------------------------------------------------- batch B: garage, hangar, island model
/** Clone the cached scene (geometries/baked material stay shared) and swap the trim for the shared emissives. */
function useBakedClone(scene: THREE.Object3D) {
  return useMemo(() => {
    const r = scene.clone(true);
    fixBaked(r);
    const trim = r.getObjectByName("trim") as THREE.Mesh;
    trim.material = emitCyan;
    return { root: r, trim };
  }, [scene]);
}

/** Active landmark trim turns orange; material swap only when the state changes. */
function useTrimSwap(trim: THREE.Mesh, id: string): void {
  const active = useActiveRef(id);
  const trimRef = useRef<THREE.Mesh | null>(null);
  useEffect(() => {
    trimRef.current = trim;
  }, [trim]);
  useFrame(() => {
    const t = trimRef.current;
    const want = active.current ? emitOrange : emitCyan;
    if (t && t.material !== want) t.material = want;
  });
}

const SIGN_BG = new THREE.MeshBasicMaterial({ color: CONFIG.colors.matter900 });

export function GarageGLB({ it, onActivate }: { it: Interactable; onActivate: Activate }) {
  const { scene } = useGLTF(ASSETS.garage!);
  const { root, trim } = useBakedClone(scene);
  // Sign quad: placeholder map replaced by a dark matte face; the name is SDF text just in front (centre 0, 5.1, 0.262).
  useMemo(() => {
    (root.getObjectByName("sign") as THREE.Mesh).material = SIGN_BG;
  }, [root]);
  useTrimSwap(trim, it.id);
  return (
    <Shell it={it} onActivate={onActivate}>
      <primitive object={root} />
      <Text font={FONT_URL} position={[0, 5.1, 0.285]} fontSize={0.42} letterSpacing={0.08} color={CONFIG.colors.cyan} anchorX="center" anchorY="middle">
        TOMMY PREEL
      </Text>
    </Shell>
  );
}

export function PlaneHangarGLB({ it, onActivate }: { it: Interactable; onActivate: Activate }) {
  const { scene } = useGLTF(ASSETS.hangar!);
  const { root, trim } = useBakedClone(scene);
  useTrimSwap(trim, it.id);
  return (
    <Shell it={it} onActivate={onActivate}>
      <primitive object={root} />
    </Shell>
  );
}

export function IslandModelGLB({ it, onActivate }: { it: Interactable; onActivate: Activate }) {
  const { scene } = useGLTF(ASSETS.islandModel!);
  const { root, trim } = useBakedClone(scene);
  const spin = useRef<THREE.Object3D | null>(null);
  useEffect(() => {
    spin.current = root.getObjectByName("miniature") ?? null;
  }, [root]);
  useTrimSwap(trim, it.id);
  useFrame((_, dt) => {
    // Node origin is the miniature's bbox centre, on the vertical axis: rotation.y spins it in place.
    if (spin.current && !useGameStore.getState().reducedMotion) spin.current.rotation.y += dt * 0.5;
  });
  return (
    <Shell it={it} onActivate={onActivate}>
      <primitive object={root} />
    </Shell>
  );
}
