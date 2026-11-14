/** Light-trail ribbon buffer: index 0 is the live head, higher indices are older samples. */

export interface Trail {
  /** 2 vertices (left, right) per sample, xyz each. */
  positions: Float32Array;
  samples: number;
}

export function createTrail(samples: number): Trail {
  return { positions: new Float32Array(samples * 6), samples };
}

/** Writes the head pair (sample 0) from a centre point, a unit perpendicular and a half width. */
export function setTrailHead(t: Trail, cx: number, cz: number, y: number, perpX: number, perpZ: number, halfWidth: number): void {
  const p = t.positions;
  p[0] = cx - perpX * halfWidth;
  p[1] = y;
  p[2] = cz - perpZ * halfWidth;
  p[3] = cx + perpX * halfWidth;
  p[4] = y;
  p[5] = cz + perpZ * halfWidth;
}

/** Freezes the current head as a sample: shifts everything one step older. */
export function advanceTrail(t: Trail): void {
  t.positions.copyWithin(6, 0, (t.samples - 1) * 6);
}

/** Collapses the whole trail onto the head (after a teleport). */
export function collapseTrail(t: Trail): void {
  for (let i = 1; i < t.samples; i++) t.positions.copyWithin(i * 6, 0, 6);
}

/** Brightness of sample i: 1 at the head, 0 at the oldest. */
export function trailFade(i: number, samples: number): number {
  const f = 1 - i / (samples - 1);
  return f * f;
}
