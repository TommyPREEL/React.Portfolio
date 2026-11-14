/**
 * @fileoverview World layout for the neon diorama: island outline, circuit,
 * spawn point, interactables and colliders. Pure data + tiny pure helpers
 * (no React / three imports) so it can be unit tested.
 */
import { getContent } from "../i18n";

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

export type InteractableKind =
  | "garage"
  | "arcade"
  | "plane-hangar"
  | "server-rack"
  | "island-model"
  | "skills"
  | "antenna";

export type SectionId = "about" | "projects" | "skills" | "contact";

export interface Interactable {
  id: string;
  kind: InteractableKind;
  section: SectionId;
  /** Project id (matches i18n projects[].id) opened in the projects section. */
  projectId?: string;
  position: Vec3;
  /** Yaw in radians; local +z is the landmark's front. */
  rotationY: number;
  triggerRadius: number;
}

export interface Collider {
  x: number;
  z: number;
  r: number;
}

/** Total playable bounds (world is centred on the origin). */
export const WORLD_BOUNDS = { width: 130, depth: 90 } as const;

const round = (n: number) => Math.round(n * 100) / 100;

/** Organic island outline: distorted ellipse, counter-clockwise in the xz plane. */
export const ISLAND_OUTLINE: Vec2[] = Array.from({ length: 40 }, (_, i) => {
  const t = (i / 40) * Math.PI * 2;
  const k = 1 + 0.08 * Math.sin(3 * t + 1) + 0.05 * Math.sin(5 * t + 2);
  return [round(58 * k * Math.cos(t)), round(38 * k * Math.sin(t))] as const;
});

/** Outline the car must stay inside (island shrunk towards the centre). */
export const CAR_BOUNDS: Vec2[] = ISLAND_OUTLINE.map(([x, z]) => [round(x * 0.95), round(z * 0.95)] as const);

/** Closed control points of the loop circuit. */
export const CIRCUIT_POINTS: Vec2[] = Array.from({ length: 12 }, (_, i) => {
  const t = (i / 12) * Math.PI * 2 + Math.PI; // start at the west vertex
  const k = 1 + 0.08 * Math.sin(2 * t + 0.5);
  return [round(30 * k * Math.cos(t)), round(19 * k * Math.sin(t))] as const;
});
export const CIRCUIT_WIDTH = 6;

/** Spawn in front of the garage door, facing east (+x). */
export const SPAWN = { x: -31, z: 0, rotation: Math.PI / 2 } as const;

const ARCADE_IDS = ["manga-sensei", "minigames", "pvpedia", "blitzquiz", "blindtest", "scrum-poker", "reflex-game"] as const;

const arcades: Interactable[] = ARCADE_IDS.map((projectId, i) => ({
  id: `arcade-${projectId}`,
  kind: "arcade",
  section: "projects",
  projectId,
  position: [(i - 3) * 6, 0, -8],
  rotationY: 0,
  triggerRadius: 3,
}));

export const INTERACTABLES: Interactable[] = [
  { id: "garage", kind: "garage", section: "about", position: [-38, 0, 0], rotationY: Math.PI / 2, triggerRadius: 6 },
  ...arcades,
  { id: "plane-hangar", kind: "plane-hangar", section: "projects", projectId: "airbus", position: [-18, 0, 10], rotationY: 0, triggerRadius: 5 },
  { id: "server-rack", kind: "server-rack", section: "projects", projectId: "self-hosted-server", position: [20, 0, 10], rotationY: 0, triggerRadius: 3.5 },
  { id: "island-model", kind: "island-model", section: "projects", projectId: "portfolio", position: [0, 0, 10], rotationY: 0, triggerRadius: 4 },
  { id: "skills", kind: "skills", section: "skills", position: [41, 0, 0], rotationY: 0, triggerRadius: 9 },
  { id: "antenna", kind: "antenna", section: "contact", position: [0, 0, -32], rotationY: 0, triggerRadius: 6 },
];

export function getInteractable(id: string): Interactable | undefined {
  return INTERACTABLES.find((i) => i.id === id);
}

/** Point in front of an interactable, inside its trigger (used by minimap teleport). */
export function approachPoint(it: Interactable): { x: number; z: number } {
  const d = it.triggerRadius * 0.7;
  return { x: it.position[0] + Math.sin(it.rotationY) * d, z: it.position[2] + Math.cos(it.rotationY) * d };
}

/** Local (landmark space) to world xz. */
export function localToWorld(it: { position: Vec3; rotationY: number }, lx: number, lz: number): Vec2 {
  const c = Math.cos(it.rotationY);
  const s = Math.sin(it.rotationY);
  return [it.position[0] + lx * c + lz * s, it.position[2] - lx * s + lz * c];
}

// ---------------------------------------------------------------- skills
export const SKILL_PAD_SIZE = 7;
export const SKILL_PAD_OFFSETS: Vec2[] = [[-4.2, -4.2], [4.2, -4.2], [-4.2, 4.2], [4.2, 4.2]];
export const SKILL_BLOCK_SIZE = 1.2;

export interface SkillBlockSpawn {
  id: string;
  categoryIndex: number;
  itemIndex: number;
  x: number;
  z: number;
}

const skillsHub = INTERACTABLES.find((i) => i.id === "skills")!;
export const SKILL_BLOCKS: SkillBlockSpawn[] = getContent("en").skills.categories.flatMap((cat, ci) =>
  cat.items.map((_, ii) => {
    const [px, pz] = SKILL_PAD_OFFSETS[ci % 4]!;
    const row = Math.floor(ii / 3);
    const col = ii % 3;
    return {
      id: `skill-${ci}-${ii}`,
      categoryIndex: ci,
      itemIndex: ii,
      x: round(skillsHub.position[0] + px + (col - 1) * 2.1),
      z: round(skillsHub.position[2] + pz + (row - 0.5) * 2.1),
    };
  }),
);

// ------------------------------------------------------------ colliders
function wall(it: Interactable, x0: number, z0: number, x1: number, z1: number, r: number): Collider[] {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / r));
  return Array.from({ length: n + 1 }, (_, i) => {
    const [x, z] = localToWorld(it, x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n);
    return { x, z, r };
  });
}
const by = (id: string) => getInteractable(id)!;

export const COLLIDERS: Collider[] = [
  ...arcades.map((a) => ({ x: a.position[0], z: a.position[2] + 0.1, r: 1 })),
  // garage: back wall + side walls (local +z = front, GLB building spans z in [-8.5, 0.5], 11.2 wide)
  ...wall(by("garage"), -5, -7.8, 5, -7.8, 1.3),
  ...wall(by("garage"), -5, -7.8, -5, -0.8, 1.3),
  ...wall(by("garage"), 5, -7.8, 5, -0.8, 1.3),
  // plane hangar
  ...wall(by("plane-hangar"), -4.2, -7.8, 4.2, -7.8, 1.3),
  ...wall(by("plane-hangar"), -4.2, -7.8, -4.2, -0.8, 1.3),
  ...wall(by("plane-hangar"), 4.2, -7.8, 4.2, -0.8, 1.3),
  // server rack GLB: 2.5 x 2.0, local centre (0, -0.4)
  { x: 20, z: 9.6, r: 1.3 },
  { x: 0, z: 10, r: 1.7 },
  // antenna GLB footprint 5.7 x 4.2 (x -1.64..4.07, z -1.64..2.54): mast platform + terminal side
  { x: 0, z: -32, r: 1.7 },
  ...[[2.9, 1.2, 1.1]].map(([lx, lz, r]) => {
    const [x, z] = localToWorld(by("antenna"), lx!, lz!);
    return { x, z, r: r! };
  }),
];
