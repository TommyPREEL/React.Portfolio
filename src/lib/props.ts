/** Deterministic scatter of decorative props around the island rim (pure, testable). */
import type { Point } from "./geometry";

export interface Prop {
  x: number;
  z: number;
  rotY: number;
  scale: number;
  /** 0..1 random value for colour / shape variation. */
  tint: number;
}

/** mulberry32: tiny seeded PRNG so the layout never changes between runs. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Places `count` props just inside the outline (radial factor within [minK, maxK] of each
 * outline vertex), skipping spots closer than `clearance` to any of the `avoid` points.
 */
export function scatterAlongOutline(
  outline: readonly Point[],
  count: number,
  seed: number,
  avoid: readonly Point[],
  clearance: number,
  minK = 0.97,
  maxK = 1.0,
): Prop[] {
  const rnd = seeded(seed);
  const out: Prop[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const [ox, oz] = outline[Math.floor(rnd() * outline.length)]!;
    const k = minK + rnd() * (maxK - minK);
    const x = ox * k;
    const z = oz * k;
    if (avoid.some(([ax, az]) => Math.hypot(ax - x, az - z) < clearance)) continue;
    out.push({ x, z, rotY: rnd() * Math.PI * 2, scale: 0.6 + rnd() * 1.1, tint: rnd() });
  }
  return out;
}
