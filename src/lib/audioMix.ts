/**
 * @fileoverview Pure mixing maths for the sound system (no Web Audio here, fully testable).
 * Gains are linear (0..1); the AudioEngine multiplies them by each sound's base gain.
 */

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Hermite smoothstep: 0 at edge0, 1 at edge1, smooth in between. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** 1 within `inner`, 0 beyond `outer`, smooth falloff between. */
export function proximityGain(distance: number, inner: number, outer: number): number {
  return 1 - smoothstep(inner, outer, distance);
}

export function distance2D(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(ax - bx, az - bz);
}

/** Average xz position of a set of points (landmark rows such as the arcade cabinets). */
export function centroid(points: readonly (readonly [number, number, number])[]): { x: number; z: number } {
  if (points.length === 0) return { x: 0, z: 0 };
  let x = 0;
  let z = 0;
  for (const p of points) {
    x += p[0];
    z += p[2];
  }
  return { x: x / points.length, z: z / points.length };
}

export interface EngineMix {
  /** playbackRate of the engine loop. */
  rate: number;
  /** Relative gain (0..1). */
  gain: number;
}

export const ENGINE_IDLE_RATE = 0.75;
export const ENGINE_TOP_RATE = 1.35;
export const ENGINE_BOOST_RATE = 1.65;
export const ENGINE_IDLE_GAIN = 0.35;

/**
 * Engine pitch and level from the car speed: idle hum at rest, rising up to max speed,
 * then further while boosting (up to boostSpeed). Reverse counts as forward.
 */
export function engineMix(speed: number, boosting: boolean, maxSpeed: number, boostSpeed: number, out?: EngineMix): EngineMix {
  const s = Math.abs(speed);
  const t = clamp01(s / maxSpeed);
  const over = boostSpeed > maxSpeed ? clamp01((s - maxSpeed) / (boostSpeed - maxSpeed)) : 0;
  let rate = ENGINE_IDLE_RATE + (ENGINE_TOP_RATE - ENGINE_IDLE_RATE) * t;
  rate += (ENGINE_BOOST_RATE - ENGINE_TOP_RATE) * over;
  if (boosting) rate += 0.08;
  let gain = ENGINE_IDLE_GAIN + (1 - ENGINE_IDLE_GAIN) * t * 0.85;
  gain += 0.15 * over;
  if (boosting) gain += 0.05;
  const r = out ?? { rate: 0, gain: 0 };
  r.rate = rate;
  r.gain = clamp01(gain);
  return r;
}

/** Theme gain multiplier: down to about -10 dB when the arcade loop is at full level. */
export const THEME_DUCK_FLOOR = Math.pow(10, -10 / 20);
export function themeDuck(arcadeLevel: number): number {
  return 1 - (1 - THEME_DUCK_FLOOR) * clamp01(arcadeLevel);
}

/**
 * Next delay before a random one-shot: uniform in [min, max] (r in [0, 1)), stretched
 * up to 4x when far (proximity 0) and unchanged when right next to it (proximity 1).
 */
export function scaledInterval(min: number, max: number, proximity: number, r: number): number {
  const base = min + (max - min) * clamp01(r);
  return base * (1 + 3 * (1 - clamp01(proximity)));
}

/** Gain of a block hit from the closing speed (u/s) of the impact; 0 below the threshold. */
export const BLOCK_HIT_MIN_IMPACT = 0.8;
export function impactGain(impact: number): number {
  if (impact < BLOCK_HIT_MIN_IMPACT) return 0;
  return 0.25 + 0.75 * clamp01((impact - BLOCK_HIT_MIN_IMPACT) / 12);
}

/** True when enough time has passed since `last` (seconds). */
export function cooledDown(now: number, last: number, cooldown: number): boolean {
  return now - last >= cooldown;
}
