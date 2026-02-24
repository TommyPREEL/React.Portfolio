/**
 * @fileoverview Application configuration constants
 * Centralized configuration for easy customization
 */

export const CONFIG = {
  world: {
    width: 80,  // Smaller horizontal world
    depth: 30,  // Narrower depth
  },
  grass: {
    enabled: false,
    count: 0,
    size: { width: 0.12, height: 0.5 },
    spread: 45,
    windSpeed: 1.5,
    windStrength: 0.25,
  },
  car: {
    acceleration: 0.008,
    maxSpeed: 0.04,
    boostSpeed: 0.08,
    boostAcceleration: 0.015,
    friction: 0.94,
    steeringSpeed: 0.015,
  },
  zone: {
    size: 4,
    hoverColor: "#fbbf24",
    defaultColor: "#60a5fa",
    halfWidth: 2.25,
    halfLength: 1.75,
    offsetZ: 2.5,
  },
  camera: {
    initialPosition: [0, 15, 20] as [number, number, number],
    followDistance: 12,
    height: 12,
    smoothing: 0.08,
  },
  colors: {
    neonBlue: "#3b82f6",
    neonYellow: "#fbbf24",
    neonCyan: "#06b6d4",
    darkBlue: "#0f172a",
    darkMetal: "#1f2937",
    // Blue theme colors
    groundMain: "#1e3a5f",
    pathColor: "#2563eb",       // Darker blue path
    pathGlow: "#3b82f6",        // Path glow
    borderDark: "#0a1525",      // Very dark blue border
  },
} as const;

// Zone positions - HORIZONTAL LINE (closer together)
export const ZONES = [
  { id: "about", position: [-24, 0, 0] as [number, number, number], label: "ABOUT", icon: "👤" },
  { id: "projects", position: [-8, 0, 0] as [number, number, number], label: "PROJECTS", icon: "💼" },
  { id: "skills", position: [8, 0, 0] as [number, number, number], label: "SKILLS", icon: "⚙️" },
  { id: "contact", position: [24, 0, 0] as [number, number, number], label: "CONTACT", icon: "✉️" },
] as const;

export type ZoneId = typeof ZONES[number]["id"];
