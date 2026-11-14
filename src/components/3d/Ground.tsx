/**
 * @fileoverview Diorama island: two-tier slab with a dark visible edge, a subtle grid that
 * only brightens around the car, a slightly raised road loop with worn cyan-dim edge lines,
 * and a few instanced low-poly rocks on the rim.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { CIRCUIT_POINTS, CIRCUIT_WIDTH, CONFIG, INTERACTABLES, ISLAND_OUTLINE } from "../../config";
import { scatterAlongOutline } from "../../lib/props";
import { buildRibbon, buildWall, type RibbonData } from "../../lib/ribbon";
import { useGameStore } from "../../store/gameStore";
import { emitCyanDim } from "./materials";

/** Upper tier (grid top, dark side) and a narrower, darker lower tier below it. */
const SLAB_DEPTH = 4;
const LOWER_DEPTH = 8;
const LOWER_SCALE = 0.86;
/** The road is a hair above the ground; the car's blob shadow and trail sit on top of it. */
export const ROAD_Y = 0.08;

const vertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

// Faint wide grid everywhere (fading with distance), clearly lit only within ~8 units of the car.
const fragmentShader = /* glsl */ `
  uniform vec2 uCar;
  uniform vec3 uBase;
  uniform vec3 uLine;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  float gridLine(vec2 p, float cell) {
    vec2 c = p / cell;
    vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    float d = distance(vWorld.xz, uCar);
    float near = smoothstep(8.0, 1.0, d);
    float far = 1.0 - smoothstep(25.0, 85.0, d);
    float l = max(gridLine(vWorld.xz, 4.0) * 0.6, gridLine(vWorld.xz, 16.0));
    float k = 0.05 * far + 1.3 * near;
    vec3 col = uBase + uLine * l * k;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

function toGeo(d: RibbonData): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(d.positions, 3));
  g.setIndex(new THREE.BufferAttribute(d.indices, 1));
  return g;
}

function slabGeometry(scale: number, depth: number): THREE.BufferGeometry {
  // rotated -90deg about x later: shape y maps to -z
  const shape = new THREE.Shape(ISLAND_OUTLINE.map(([x, z]) => new THREE.Vector2(x * scale, -z * scale)));
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
}

/** Cheap deterministic hash so the same edge segments stay "worn" on every load. */
const worn = (salt: number) => (i: number) => (Math.imul(i + salt, 2654435761) >>> 0) % 100 < 24;

const ROCK_COUNT = 26;
const SLAB_PROP_COUNT = 10;
const rockAvoid = INTERACTABLES.map((it) => [it.position[0], it.position[2]] as const);

function Props() {
  const rocks = useRef<THREE.InstancedMesh>(null);
  const slabs = useRef<THREE.InstancedMesh>(null);
  const rockGeo = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []); // 36 tris
  const slabGeo = useMemo(() => new THREE.CylinderGeometry(0.55, 0.8, 1.6, 6), []); // 24 tris
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: CONFIG.colors.matter700, flatShading: true, roughness: 1, metalness: 0 }), []);
  const layout = useMemo(
    () => ({
      rocks: scatterAlongOutline(ISLAND_OUTLINE, ROCK_COUNT, 11, rockAvoid, 12),
      slabs: scatterAlongOutline(ISLAND_OUTLINE, SLAB_PROP_COUNT, 29, rockAvoid, 12, 0.975, 0.995),
    }),
    [],
  );
  useEffect(() => {
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const m700 = new THREE.Color(CONFIG.colors.matter700);
    const m600 = new THREE.Color(CONFIG.colors.matter600);
    layout.rocks.forEach((r, i) => {
      o.position.set(r.x, 0.3 * r.scale, r.z);
      o.rotation.set(r.tint * 3, r.rotY, 0);
      o.scale.set(r.scale * 1.3, r.scale * 0.8, r.scale * 1.1);
      o.updateMatrix();
      rocks.current?.setMatrixAt(i, o.matrix);
      rocks.current?.setColorAt(i, c.copy(m700).lerp(m600, r.tint));
    });
    layout.slabs.forEach((r, i) => {
      o.position.set(r.x, 0.8 * r.scale, r.z);
      o.rotation.set(0, r.rotY, (r.tint - 0.5) * 0.25);
      o.scale.setScalar(r.scale);
      o.updateMatrix();
      slabs.current?.setMatrixAt(i, o.matrix);
      slabs.current?.setColorAt(i, c.copy(m600).lerp(m700, r.tint));
    });
    for (const r of [rocks, slabs]) {
      if (!r.current) continue;
      r.current.instanceMatrix.needsUpdate = true;
      if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
    }
  }, [layout]);
  useEffect(
    () => () => {
      rockGeo.dispose();
      slabGeo.dispose();
      mat.dispose();
    },
    [rockGeo, slabGeo, mat],
  );
  return (
    <>
      <instancedMesh ref={rocks} args={[rockGeo, mat, layout.rocks.length]} />
      <instancedMesh ref={slabs} args={[slabGeo, mat, layout.slabs.length]} />
    </>
  );
}

export function Ground() {
  const gridMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uCar: { value: new THREE.Vector2() },
            uBase: { value: new THREE.Color(CONFIG.colors.matter800) },
            uLine: { value: new THREE.Color(CONFIG.colors.cyanDim) },
          },
        ]),
      }),
    [],
  );
  const sideMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CONFIG.colors.matter900 }), []);
  const lowerMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CONFIG.colors.night }), []);
  const roadMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CONFIG.colors.matter700, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 }), []);
  const skirtMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CONFIG.colors.matter900, side: THREE.DoubleSide }), []);

  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(CIRCUIT_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, "centripetal");
    const pts = curve.getPoints(160).slice(0, -1).map((p) => [p.x, p.z] as const);
    const r = buildRibbon(pts, CIRCUIT_WIDTH / 2, ROAD_Y, true);
    const edge = (side: 0 | 1) =>
      Array.from({ length: pts.length }, (_, i) => [r.positions[i * 6 + side * 3]!, r.positions[i * 6 + side * 3 + 2]!] as const);
    const e0 = edge(0);
    const e1 = edge(1);
    const tmp = [
      toGeo(buildRibbon(e0, 0.1, ROAD_Y + 0.02, true, worn(3))),
      toGeo(buildRibbon(e1, 0.1, ROAD_Y + 0.02, true, worn(17))),
    ];
    const roadLines = mergeGeometries(tmp)!;
    tmp.forEach((g) => g.dispose());
    const walls = [toGeo(buildWall(e0, 0, ROAD_Y, true)), toGeo(buildWall(e1, 0, ROAD_Y, true))];
    const skirt = mergeGeometries(walls)!;
    walls.forEach((g) => g.dispose());
    return {
      slab: slabGeometry(1, SLAB_DEPTH),
      lower: slabGeometry(LOWER_SCALE, LOWER_DEPTH),
      road: toGeo(r),
      skirt,
      roadLines,
      islandEdge: toGeo(buildRibbon(ISLAND_OUTLINE, 0.14, 0.05, true)),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      [gridMat, sideMat, lowerMat, roadMat, skirtMat].forEach((m) => m.dispose());
    },
    [geo, gridMat, sideMat, lowerMat, roadMat, skirtMat],
  );

  useFrame(() => {
    const p = useGameStore.getState().pose;
    (gridMat.uniforms.uCar!.value as THREE.Vector2).set(p.x, p.z);
  });

  return (
    <group>
      <mesh geometry={geo.slab} material={[gridMat, sideMat]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -SLAB_DEPTH, 0]} />
      <mesh geometry={geo.lower} material={lowerMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -SLAB_DEPTH - LOWER_DEPTH, 0]} />
      <mesh geometry={geo.road} material={roadMat} />
      <mesh geometry={geo.skirt} material={skirtMat} />
      <mesh geometry={geo.roadLines} material={emitCyanDim} />
      <mesh geometry={geo.islandEdge} material={emitCyanDim} />
      <Props />
    </group>
  );
}
