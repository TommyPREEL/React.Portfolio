/**
 * @fileoverview Game store (zustand). `pose` is a mutable object written every frame
 * by the car without notifying React; read it with `useGameStore.getState().pose` in
 * useFrame, or through useThrottledCarPosition for UI. Everything else changes rarely.
 */
import { create } from "zustand";
import { SPAWN } from "../config/world";

export interface CarPose {
  x: number;
  z: number;
  rotation: number;
  speed: number;
  boosting: boolean;
}

export type QualityTier = "high" | "low";
export type QualityMode = "auto" | QualityTier;

interface GameState {
  /** Mutated in place every frame. Never replace it, never subscribe to it. */
  pose: CarPose;
  activeTriggerId: string | null;
  teleportTarget: { x: number; z: number } | null;
  /** True while a content panel is open: the car stops answering to input. */
  inputLocked: boolean;
  quality: QualityTier;
  qualityMode: QualityMode;
  reducedMotion: boolean;
  setActiveTrigger: (id: string | null) => void;
  requestTeleport: (x: number, z: number) => void;
  clearTeleport: () => void;
  setInputLocked: (locked: boolean) => void;
  /** Called by the PerformanceMonitor; ignored unless mode is auto. */
  setAutoQuality: (q: QualityTier) => void;
  setQualityMode: (m: QualityMode) => void;
}

const isBrowser = typeof window !== "undefined" && typeof window.matchMedia === "function";
const coarse = isBrowser && window.matchMedia("(pointer: coarse)").matches;

export const useGameStore = create<GameState>((set, get) => ({
  pose: { x: SPAWN.x, z: SPAWN.z, rotation: SPAWN.rotation, speed: 0, boosting: false },
  activeTriggerId: null,
  teleportTarget: null,
  inputLocked: false,
  quality: coarse ? "low" : "high",
  qualityMode: "auto",
  reducedMotion: isBrowser && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  setActiveTrigger: (id) => {
    if (get().activeTriggerId !== id) set({ activeTriggerId: id });
  },
  requestTeleport: (x, z) => set({ teleportTarget: { x, z } }),
  clearTeleport: () => set({ teleportTarget: null }),
  setInputLocked: (locked) => {
    if (get().inputLocked !== locked) set({ inputLocked: locked });
  },
  setAutoQuality: (q) => {
    if (get().qualityMode === "auto" && get().quality !== q) set({ quality: q });
  },
  setQualityMode: (m) => set({ qualityMode: m, ...(m === "auto" ? {} : { quality: m }) }),
}));

if (isBrowser) {
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
    useGameStore.setState({ reducedMotion: e.matches });
  });
}
