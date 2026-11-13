/**
 * @fileoverview Application configuration constants
 * Centralized configuration for easy customization
 */

import { INTERACTABLES, WORLD_BOUNDS } from "./world";

export * from "./world";

/** Optional GLB assets; set a path once the file exists in /public/models. */
export const ASSETS = {
  car: "/models/car.glb" as string | null,
  arcade: "/models/arcade-cabinet.glb" as string | null,
  rack: "/models/server-rack.glb" as string | null,
  antenna: "/models/antenna.glb" as string | null,
  garage: "/models/garage.glb" as string | null,
  hangar: "/models/plane-hangar.glb" as string | null,
  islandModel: "/models/island-model.glb" as string | null,
};

export const CONFIG = {
  world: {
    width: WORLD_BOUNDS.width,
    depth: WORLD_BOUNDS.depth,
  },
  grass: {
    enabled: false,
    count: 0,
    size: { width: 0.12, height: 0.5 },
    spread: 45,
    windSpeed: 1.5,
    windStrength: 0.25,
  },
  // Units per second (dt based).
  car: {
    acceleration: 28,
    maxSpeed: 11,
    boostSpeed: 20,
    boostAcceleration: 40,
    friction: 0.965, // speed multiplier per 1/60 s without throttle
    steeringSpeed: 2.2, // rad/s
    radius: 0.9,
  },
  zone: {
    size: 4,
    halfWidth: 2.25,
    halfLength: 1.75,
    offsetZ: 2.5,
  },
  camera: {
    fov: 38,
    fovBoost: 4,
    offset: [0, 21, 17] as [number, number, number], // world-fixed 3/4 offset from the car
    chase: 4, // extra distance behind the heading
    lookAhead: 0.45, // seconds of travel
    smoothing: 3, // 1/s, exponential
    zoomOut: 7,
  },
  // Neon diorama palette (same names as the CSS tokens)
  colors: {
    night: "#07090C",
    matter900: "#0E1217",
    matter800: "#141920",
    matter700: "#1B2129",
    matter600: "#222A33",
    line: "#2E3843",
    cyan: "#4DE8FF",
    cyanDim: "#1A6C7A",
    orange: "#FF8A1F",
    text: "#E6EDF2",
  },
} as const;

// Section landmarks (minimap / teleport).
const pos = (id: string) => INTERACTABLES.find((i) => i.id === id)!.position as unknown as [number, number, number];
export const ZONES = [
  { id: "about", position: pos("garage"), label: "ABOUT" },
  { id: "projects", position: [0, 0, -8] as [number, number, number], label: "PROJECTS" },
  { id: "skills", position: pos("skills"), label: "SKILLS" },
  { id: "contact", position: pos("antenna"), label: "CONTACT" },
] as const;

export type ZoneId = typeof ZONES[number]["id"];
