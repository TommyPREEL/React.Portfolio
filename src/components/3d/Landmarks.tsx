/**
 * @fileoverview Procedural low-poly landmarks (placeholders until Blender GLBs exist).
 * Each landmark = 1 baked matte mesh + up to 2 emissive meshes (trim = cyan-dim,
 * accent = cyan, turning orange while the car is inside the trigger).
 */
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { ASSETS, CONFIG, INTERACTABLES, SKILL_PAD_OFFSETS, SKILL_PAD_SIZE, ISLAND_OUTLINE, getInteractable, type Interactable } from "../../config";
import { getContent, type Language } from "../../i18n";
import { useGameStore } from "../../store/gameStore";
import { bakedMat, emitCyan, emitCyanDim, emitOrange, getBlobMaterial, palette } from "./materials";
import { box, cone, cyl, mergeParts, type Part } from "./kit";
import { AntennaGLB, ArcadeRowGLB, FONT_URL, GarageGLB, IslandModelGLB, PlaneHangarGLB, PulseRings, ServerRackGLB } from "./LandmarkModels";

export { FONT_URL };

interface LandmarkProps {
  it: Interactable;
  onActivate: (it: Interactable) => void;
  matte: Part[];
  trim: Part[];
  accent: Part[];
  children?: ReactNode;
}

function useActive(id: string): boolean {
  return useGameStore((s) => s.activeTriggerId === id);
}

function Landmark({ it, onActivate, matte, trim, accent, children }: LandmarkProps) {
  const active = useActive(it.id);
  const geo = useMemo(
    () => ({
      matte: matte.length ? mergeParts(matte) : null,
      trim: trim.length ? mergeParts(trim) : null,
      accent: accent.length ? mergeParts(accent) : null,
    }),
    [matte, trim, accent],
  );
  useEffect(
    () => () => {
      geo.matte?.dispose();
      geo.trim?.dispose();
      geo.accent?.dispose();
    },
    [geo],
  );
  return (
    <group
      position={[it.position[0], 0, it.position[2]]}
      rotation-y={it.rotationY}
      onClick={(e) => {
        e.stopPropagation();
        onActivate(it);
      }}
    >
      {geo.matte && <mesh geometry={geo.matte} material={bakedMat} />}
      {geo.trim && <mesh geometry={geo.trim} material={active ? emitOrange : emitCyanDim} />}
      {geo.accent && <mesh geometry={geo.accent} material={active ? emitOrange : emitCyan} />}
      {children}
    </group>
  );
}

const { m900, m700, m600 } = palette;
const steel = palette.line;
/** Stable empty list: a fresh [] per render would re-merge the landmark geometry. */
const NONE: Part[] = [];
const M800 = CONFIG.colors.matter800;

// ---------------------------------------------------------------- garage
const GARAGE_MATTE: Part[] = [
  box(11, 0.15, 9, 0, 0.07, -4, M800),
  box(10, 4, 0.5, 0, 2, -7.75, m700),
  box(0.5, 4, 8, -4.75, 2, -4, m700),
  box(0.5, 4, 8, 4.75, 2, -4, m700),
  box(11, 0.4, 2, 0, 4.25, -0.9, m600), // awning only: keeps the interior visible from the chase camera
  box(10, 1.2, 0.5, 0, 3.6, -0.25, m700),
  cyl(0.25, 0.25, 8.6, 0, 3.15, -0.7, steel, [0, 0, Math.PI / 2]),
  box(3, 0.9, 1, -2.5, 0.6, -6.9, m600),
  box(2.4, 0.15, 0.5, -2.5, 1.7, -7.4, m600),
  box(0.9, 0.7, 0.9, 2.6, 0.5, -6.6, steel),
  box(6.4, 0.9, 0.3, 0, 5.1, 0.2, m900),
];
const GARAGE_TRIM: Part[] = [
  box(11, 0.08, 0.08, 0, 4.52, 0.45),
  box(0.1, 3.2, 0.1, -4.5, 1.6, 0.0),
  box(0.1, 3.2, 0.1, 4.5, 1.6, 0.0),
  box(9, 0.05, 0.1, 0, 0.17, -0.3),
];
const GARAGE_ACCENT: Part[] = [box(5.8, 0.1, 0.1, 0, 4.58, 0.4), box(0.1, 0.9, 0.1, -3.1, 5.1, 0.4), box(0.1, 0.9, 0.1, 3.1, 5.1, 0.4)];

function GarageProcedural({ it, onActivate }: { it: Interactable; onActivate: (it: Interactable) => void }) {
  return (
    <Landmark it={it} onActivate={onActivate} matte={GARAGE_MATTE} trim={GARAGE_TRIM} accent={GARAGE_ACCENT}>
      <Text font={FONT_URL} position={[0, 5.1, 0.4]} fontSize={0.5} letterSpacing={0.08} color={CONFIG.colors.cyan} anchorX="center" anchorY="middle">
        TOMMY PREEL
      </Text>
    </Landmark>
  );
}

// ---------------------------------------------------------------- plane hangar
const HANGAR_MATTE: Part[] = [
  box(9.2, 0.15, 9, 0, 0.07, -4, M800),
  box(8.4, 3.6, 0.4, 0, 1.8, -7.8, m700),
  box(0.4, 3.6, 8, -4.2, 1.8, -4, m700),
  box(0.4, 3.6, 8, 4.2, 1.8, -4, m700),
  box(9.2, 0.35, 2, 0, 3.8, -0.9, m600),
  box(8.4, 0.6, 0.4, 0, 3.4, -0.3, m700),
  // plane
  cyl(0.6, 0.6, 4.6, 0, 1.2, -3.9, steel, [Math.PI / 2, 0, 0], 12),
  cone(0.6, 1.3, 0, 1.2, -1.0, steel, [Math.PI / 2, 0, 0], 12),
  box(6.2, 0.1, 1.3, 0, 1.15, -3.6, m600),
  box(0.12, 1.2, 0.9, 0, 2.0, -6.0, m600),
  box(2.2, 0.08, 0.7, 0, 1.45, -6.0, m600),
  cyl(0.12, 0.12, 0.6, -1.2, 0.5, -3.2, m900),
  cyl(0.12, 0.12, 0.6, 1.2, 0.5, -3.2, m900),
  cyl(0.1, 0.1, 0.6, 0, 0.5, -1.6, m900),
];
const HANGAR_TRIM: Part[] = [
  box(9.2, 0.08, 0.08, 0, 3.55, 0.05),
  box(0.1, 3, 0.1, -4.0, 1.5, 0.0),
  box(0.1, 3, 0.1, 4.0, 1.5, 0.0),
  box(6.2, 0.04, 0.05, 0, 1.2, -2.95),
];
const HANGAR_ACCENT: Part[] = [-1, -0.6, -0.2, 0.2, 0.6].flatMap((z): Part[] => [
  box(0.03, 0.16, 0.22, 0.61, 1.4, -3.3 + z * 1.6),
  box(0.03, 0.16, 0.22, -0.61, 1.4, -3.3 + z * 1.6),
]);

function PlaneHangarProcedural({ it, onActivate }: { it: Interactable; onActivate: (it: Interactable) => void }) {
  return <Landmark it={it} onActivate={onActivate} matte={HANGAR_MATTE} trim={HANGAR_TRIM} accent={HANGAR_ACCENT} />;
}

// ---------------------------------------------------------------- server rack
const RACK_MATTE: Part[] = [
  box(2.2, 0.12, 1.8, 0, 0.06, -0.4, m900),
  box(1.4, 2.7, 1.0, 0, 1.45, -0.4, m700),
  ...Array.from({ length: 8 }, (_, i): Part => box(1.2, 0.22, 0.08, 0, 0.55 + i * 0.3, 0.14, m600)),
];
const RACK_TRIM: Part[] = [box(0.06, 2.7, 0.06, -0.72, 1.45, 0.12), box(0.06, 2.7, 0.06, 0.72, 1.45, 0.12), box(1.5, 0.06, 0.06, 0, 2.82, 0.12)];
const RACK_LEDS_A: Part[] = Array.from({ length: 8 }, (_, i): Part => box(0.08, 0.06, 0.04, -0.45, 0.55 + i * 0.3, 0.2));
const RACK_LEDS_B: Part[] = Array.from({ length: 8 }, (_, i): Part => box(0.08, 0.06, 0.04, -0.3, 0.55 + i * 0.3, 0.2));

function ServerRackProcedural({ it, onActivate }: { it: Interactable; onActivate: (it: Interactable) => void }) {
  const ledA = useMemo(() => mergeParts(RACK_LEDS_A), []);
  const ledB = useMemo(() => mergeParts(RACK_LEDS_B), []);
  const blinkMat = useMemo(() => emitCyan.clone(), []);
  const baseColor = useMemo(() => emitCyan.color.clone(), []);
  useEffect(
    () => () => {
      ledA.dispose();
      ledB.dispose();
      blinkMat.dispose();
    },
    [ledA, ledB, blinkMat],
  );
  useFrame(({ clock }) => {
    const on = Math.sin(clock.elapsedTime * 7) + Math.sin(clock.elapsedTime * 3.1) > 0.2;
    blinkMat.color.copy(baseColor).multiplyScalar(on ? 1 : 0.15);
  });
  return (
    <Landmark it={it} onActivate={onActivate} matte={RACK_MATTE} trim={RACK_TRIM} accent={NONE}>
      <mesh geometry={ledA} material={emitCyan} />
      <mesh geometry={ledB} material={blinkMat} />
    </Landmark>
  );
}

// ---------------------------------------------------------------- island miniature
const MODEL_MATTE: Part[] = [cyl(1.5, 1.7, 0.7, 0, 0.35, 0, m700, undefined, 24)];
const MODEL_TRIM: Part[] = [box(3, 0.05, 0.05, 0, 0.72, 1.55)];

function IslandModelProcedural({ it, onActivate }: { it: Interactable; onActivate: (it: Interactable) => void }) {
  const ring = useRef<THREE.Mesh>(null);
  const miniature = useMemo(() => {
    const shape = new THREE.Shape(ISLAND_OUTLINE.map(([x, z]) => new THREE.Vector2(x * 0.022, -z * 0.022)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: CONFIG.colors.matter600 }), []);
  useEffect(
    () => () => {
      miniature.dispose();
      mat.dispose();
    },
    [miniature, mat],
  );
  useFrame((_, dt) => {
    if (ring.current && !useGameStore.getState().reducedMotion) ring.current.rotation.y += dt * 0.6;
  });
  return (
    <Landmark it={it} onActivate={onActivate} matte={MODEL_MATTE} trim={MODEL_TRIM} accent={NONE}>
      <mesh geometry={miniature} material={mat} position={[0, 0.7, 0]} />
      <mesh ref={ring} position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]} material={emitCyan}>
        <torusGeometry args={[1.45, 0.025, 6, 48]} />
      </mesh>
    </Landmark>
  );
}

// ---------------------------------------------------------------- antenna
const ANTENNA_MATTE: Part[] = [
  box(3.2, 0.4, 3.2, 0, 0.2, 0, m700),
  cyl(0.18, 0.28, 3.2, 0, 2.0, 0, m600),
  // terminal
  box(1.3, 0.9, 0.9, 3, 0.45, 1.6, m700, [0, -0.4, 0]),
  box(1.2, 0.08, 0.7, 3, 1.0, 1.55, m600, [0.35, -0.4, 0]),
];
const ANTENNA_TRIM: Part[] = [box(3.3, 0.05, 0.05, 0, 0.42, 1.62), box(0.05, 0.05, 3.3, 1.62, 0.42, 0)];
const ANTENNA_ACCENT: Part[] = [box(0.7, 0.28, 0.04, 2.97, 1.08, 1.5, undefined, [0.35, -0.4, 0])];
const DISH_PARTS: Part[] = [cyl(1.4, 0.25, 0.4, 0, 0, 0.5, m600, [-Math.PI / 2.6, 0, 0], 16), cyl(0.05, 0.05, 1.3, 0, 0.1, 1.0, steel, [Math.PI / 2.6, 0, 0], 6)];
function AntennaProcedural({ it, onActivate }: { it: Interactable; onActivate: (it: Interactable) => void }) {
  const dish = useRef<THREE.Group>(null);
  const dishGeo = useMemo(() => mergeParts(DISH_PARTS), []);
  useEffect(() => () => dishGeo.dispose(), [dishGeo]);
  useFrame((_, dt) => {
    if (dish.current && !useGameStore.getState().reducedMotion) dish.current.rotation.y += dt * 0.7;
  });
  return (
    <Landmark it={it} onActivate={onActivate} matte={ANTENNA_MATTE} trim={ANTENNA_TRIM} accent={ANTENNA_ACCENT}>
      <group ref={dish} position={[0, 3.7, 0]}>
        <mesh geometry={dishGeo} material={bakedMat} />
      </group>
      <mesh position={[0, 3.75, 0]} material={emitOrange}>
        <sphereGeometry args={[0.12, 8, 6]} />
      </mesh>
      <PulseRings />
    </Landmark>
  );
}

type LandmarkComponentProps = { it: Interactable; onActivate: (it: Interactable) => void };

export function Garage(props: LandmarkComponentProps) {
  if (!ASSETS.garage) return <GarageProcedural {...props} />;
  return (
    <Suspense fallback={<GarageProcedural {...props} />}>
      <GarageGLB {...props} />
    </Suspense>
  );
}

export function PlaneHangar(props: LandmarkComponentProps) {
  if (!ASSETS.hangar) return <PlaneHangarProcedural {...props} />;
  return (
    <Suspense fallback={<PlaneHangarProcedural {...props} />}>
      <PlaneHangarGLB {...props} />
    </Suspense>
  );
}

export function IslandModel(props: LandmarkComponentProps) {
  if (!ASSETS.islandModel) return <IslandModelProcedural {...props} />;
  return (
    <Suspense fallback={<IslandModelProcedural {...props} />}>
      <IslandModelGLB {...props} />
    </Suspense>
  );
}

export function Antenna(props: LandmarkComponentProps) {
  if (!ASSETS.antenna) return <AntennaProcedural {...props} />;
  return (
    <Suspense fallback={<AntennaProcedural {...props} />}>
      <AntennaGLB {...props} />
    </Suspense>
  );
}

export function ServerRack(props: LandmarkComponentProps) {
  if (!ASSETS.rack) return <ServerRackProcedural {...props} />;
  return (
    <Suspense fallback={<ServerRackProcedural {...props} />}>
      <ServerRackGLB {...props} />
    </Suspense>
  );
}

export function ArcadeRow({ onActivate }: { onActivate: (it: Interactable) => void }) {
  if (!ASSETS.arcade) return <ArcadeRowProcedural onActivate={onActivate} />;
  return (
    <Suspense fallback={<ArcadeRowProcedural onActivate={onActivate} />}>
      <ArcadeRowGLB onActivate={onActivate} />
    </Suspense>
  );
}

// ---------------------------------------------------------------- skills platforms
const pad = SKILL_PAD_SIZE;
const PLATFORM_MATTE: Part[] = SKILL_PAD_OFFSETS.map(([x, z]) => box(pad, 0.25, pad, x, 0.125, z, m700));
const PLATFORM_TRIM: Part[] = SKILL_PAD_OFFSETS.flatMap(([x, z]): Part[] => [
  box(pad, 0.06, 0.08, x, 0.27, z + pad / 2),
  box(pad, 0.06, 0.08, x, 0.27, z - pad / 2),
  box(0.08, 0.06, pad, x + pad / 2, 0.27, z),
  box(0.08, 0.06, pad, x - pad / 2, 0.27, z),
]);

export function SkillPlatforms({ it, onActivate, language }: { it: Interactable; onActivate: (it: Interactable) => void; language: Language }) {
  const categories = getContent(language).skills.categories;
  return (
    <Landmark it={it} onActivate={onActivate} matte={PLATFORM_MATTE} trim={PLATFORM_TRIM} accent={NONE}>
      {SKILL_PAD_OFFSETS.map(([x, z], i) => (
        <Text
          key={i}
          font={FONT_URL}
          position={[x, 0.3, z + pad / 2 - 0.45]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.34}
          letterSpacing={0.08}
          color={CONFIG.colors.cyan}
          anchorX="center"
          anchorY="middle"
        >
          {(categories[i]?.name ?? "").toUpperCase()}
        </Text>
      ))}
    </Landmark>
  );
}

// ---------------------------------------------------------------- arcade row
const CAB_W = 1.6;
const ARCADE_ITEMS = INTERACTABLES.filter((i) => i.kind === "arcade");

function cabinetParts(): { matte: Part[]; trim: Part[] } {
  const matte: Part[] = [
    box(CAB_W, 1.0, 1.4, 0, 0.5, 0, m700),
    box(CAB_W, 1.6, 0.9, 0, 1.8, -0.25, m700),
    box(CAB_W, 0.45, 1.1, 0, 2.85, -0.1, m900),
    // marquee band on top
    box(CAB_W + 0.12, 0.4, 1.0, 0, 3.3, -0.15, m600),
    box(CAB_W + 0.2, 0.06, 1.1, 0, 3.53, -0.15, m900),
    // control panel + bevelled front lip, joystick and buttons
    box(1.4, 0.12, 0.6, 0, 1.05, 0.65, m600, [0.3, 0, 0]),
    box(1.46, 0.14, 0.1, 0, 0.95, 0.97, m700, [0.3, 0, 0]),
    cyl(0.04, 0.04, 0.2, -0.35, 1.2, 0.62, m900, undefined, 6),
    box(0.1, 0.06, 0.1, 0.2, 1.13, 0.7, m900, [0.3, 0, 0]),
    box(0.1, 0.06, 0.1, 0.45, 1.13, 0.62, m900, [0.3, 0, 0]),
    box(CAB_W + 0.1, 0.1, 1.5, 0, 0.05, 0, m900),
  ];
  const trim: Part[] = [
    box(0.06, 2.9, 0.06, -CAB_W / 2, 1.5, 0.5),
    box(0.06, 2.9, 0.06, CAB_W / 2, 1.5, 0.5),
    box(CAB_W, 0.06, 0.06, 0, 3.1, 0.47),
    // marquee light bar
    box(CAB_W - 0.24, 0.1, 0.04, 0, 3.3, 0.37),
  ];
  return { matte, trim };
}

const SCREEN_DIM = new THREE.Color(0.9, 0.9, 0.9);
const SCREEN_LIT = new THREE.Color(1, 1, 1);

/** Real project screenshot on the screen quad; an unlit-looking basic material so it reads as lit. */
function ArcadeScreen({ it }: { it: Interactable }) {
  const active = useActive(it.id);
  const map = useTexture(`/projects/${it.projectId}-640.jpg`);
  return (
    <mesh position={[it.position[0], 1.95, it.position[2] + 0.22]} rotation={[-0.18, 0, 0]}>
      <planeGeometry args={[1.2, 0.95]} />
      <meshBasicMaterial map={map} color={active ? SCREEN_LIT : SCREEN_DIM} />
    </mesh>
  );
}

const TRIM_DIM = new THREE.Color(CONFIG.colors.cyanDim);
const TRIM_HOT = emitOrange.color;

function paintTrim(geo: THREE.BufferGeometry, perCabinet: number, activeIndex: number): void {
  const attr = geo.getAttribute("color") as THREE.BufferAttribute;
  for (let c = 0; c < ARCADE_ITEMS.length; c++) {
    const col = c === activeIndex ? TRIM_HOT : TRIM_DIM;
    for (let v = c * perCabinet; v < (c + 1) * perCabinet; v++) attr.setXYZ(v, col.r, col.g, col.b);
  }
  attr.needsUpdate = true;
}

function ArcadeRowProcedural({ onActivate }: { onActivate: (it: Interactable) => void }) {
  const rig = useMemo(() => {
    const { matte, trim } = cabinetParts();
    const place = (parts: Part[]) =>
      ARCADE_ITEMS.map((it) => mergeParts(parts, { x: it.position[0], z: it.position[2], rotY: it.rotationY }));
    const trimGeos = place(trim);
    const perCabinet = trimGeos[0]!.getAttribute("position").count;
    return {
      matte: mergeMany(place(matte)),
      trim: mergeMany(trimGeos),
      perCabinet,
      trimMat: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    };
  }, []);
  useEffect(() => {
    // Only the ACTIVE cabinet's trim turns orange: recolour its vertex range (still one draw call).
    const apply = (id: string | null) => paintTrim(rig.trim, rig.perCabinet, ARCADE_ITEMS.findIndex((it) => it.id === id));
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
      rig.matte.dispose();
      rig.trim.dispose();
      rig.trimMat.dispose();
    },
    [rig],
  );
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        // nearest cabinet to the click point
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
      <mesh geometry={rig.matte} material={bakedMat} />
      <mesh geometry={rig.trim} material={rig.trimMat} />
      {ARCADE_ITEMS.map((it) => (
        <ArcadeScreen key={it.id} it={it} />
      ))}
    </group>
  );
}

function mergeMany(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(geos, false);
  geos.forEach((x) => x.dispose());
  if (!g) throw new Error("mergeMany: incompatible geometries");
  return g;
}

// ---------------------------------------------------------------- contact shadows
/** Local footprint per kind: [width, depth, centreX, centreZ]. */
const FOOTPRINTS: Partial<Record<Interactable["kind"], readonly [number, number, number, number]>> = {
  garage: [14, 12, 0, -4],
  arcade: [2.8, 2.6, 0, -0.1],
  "plane-hangar": [12, 12, 0, -4],
  "server-rack": [3.4, 2.9, 0, -0.4],
  "island-model": [4.8, 4.8, 0, 0],
  antenna: [7.4, 5.8, 1.2, 0.45],
};

/** One merged mesh of soft blob decals under every landmark (single draw call). */
function ShadowDecals() {
  const geo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const it of INTERACTABLES) {
      const f = FOOTPRINTS[it.kind];
      if (!f) continue;
      const g = new THREE.PlaneGeometry(f[0], f[1]).rotateX(-Math.PI / 2).translate(f[2], 0, f[3]);
      g.rotateY(it.rotationY).translate(it.position[0], 0.05, it.position[2]);
      parts.push(g);
    }
    return mergeMany(parts);
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={getBlobMaterial()} renderOrder={1} />;
}

// ---------------------------------------------------------------- composite
export function Landmarks({ onActivate, language }: { onActivate: (it: Interactable) => void; language: Language }) {
  const g = (id: string) => getInteractable(id)!;
  return (
    <>
      <ShadowDecals />
      <Garage it={g("garage")} onActivate={onActivate} />
      <ArcadeRow onActivate={onActivate} />
      <PlaneHangar it={g("plane-hangar")} onActivate={onActivate} />
      <ServerRack it={g("server-rack")} onActivate={onActivate} />
      <IslandModel it={g("island-model")} onActivate={onActivate} />
      <SkillPlatforms it={g("skills")} onActivate={onActivate} language={language} />
      <Antenna it={g("antenna")} onActivate={onActivate} />
    </>
  );
}
