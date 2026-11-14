import type { Point } from "./geometry";

export interface RibbonData {
  positions: Float32Array;
  indices: Uint32Array;
}

/**
 * Builds a flat strip (constant y) of constant width following points (xz).
 * Two vertices per point (left, right); closed joins the last point to the first.
 */
export function buildRibbon(
  points: readonly Point[],
  halfWidth: number,
  y: number,
  closed: boolean,
  /** Segments for which this returns true get no triangles (worn / broken light lines). */
  skip?: (segment: number) => boolean,
): RibbonData {
  const n = points.length;
  const positions = new Float32Array(n * 6);
  for (let i = 0; i < n; i++) {
    const prev = points[closed ? (i + n - 1) % n : Math.max(0, i - 1)]!;
    const next = points[closed ? (i + 1) % n : Math.min(n - 1, i + 1)]!;
    let tx = next[0] - prev[0];
    let tz = next[1] - prev[1];
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    const [px, pz] = points[i]!;
    // normal = (-tz, tx) in xz
    positions.set([px - tz * halfWidth, y, pz + tx * halfWidth, px + tz * halfWidth, y, pz - tx * halfWidth], i * 6);
  }
  const segs = closed ? n : n - 1;
  const idx: number[] = [];
  for (let i = 0; i < segs; i++) {
    if (skip?.(i)) continue;
    const a = i * 2;
    const b = ((i + 1) % n) * 2;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  return { positions, indices: Uint32Array.from(idx) };
}

/**
 * Vertical wall (two vertices per point, bottom then top) along a polyline, used for the
 * road skirt. Winding is not guaranteed: render with DoubleSide.
 */
export function buildWall(points: readonly Point[], y0: number, y1: number, closed: boolean): RibbonData {
  const n = points.length;
  const positions = new Float32Array(n * 6);
  for (let i = 0; i < n; i++) {
    const [x, z] = points[i]!;
    positions.set([x, y0, z, x, y1, z], i * 6);
  }
  const segs = closed ? n : n - 1;
  const indices = new Uint32Array(Math.max(0, segs) * 6);
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    const b = ((i + 1) % n) * 2;
    indices.set([a, a + 1, b, a + 1, b + 1, b], i * 6);
  }
  return { positions, indices };
}
