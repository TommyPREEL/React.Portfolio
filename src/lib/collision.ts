import { pointInPolygon, type Point } from "./geometry";
import type { CarState } from "./carPhysics";

export interface Circle {
  x: number;
  z: number;
  r: number;
}

/** Pushes the car out of static circles and kills most of its speed on impact. Mutates car. */
export function resolveCircleCollisions(car: CarState, carRadius: number, circles: readonly Circle[]): boolean {
  let hit = false;
  for (let i = 0; i < circles.length; i++) {
    const c = circles[i]!;
    const dx = car.x - c.x;
    const dz = car.z - c.z;
    const min = carRadius + c.r;
    const d2 = dx * dx + dz * dz;
    if (d2 >= min * min) continue;
    const d = Math.sqrt(d2);
    if (d > 1e-4) {
      const push = min - d;
      car.x += (dx / d) * push;
      car.z += (dz / d) * push;
    } else {
      car.x += min;
    }
    hit = true;
  }
  if (hit) car.speed *= 0.3;
  return hit;
}

/**
 * Keeps the car inside bounds: if the new position is outside, slide along one axis,
 * else revert to the previous position. Mutates car; returns true if it was constrained.
 */
export function constrainToPolygon(car: CarState, prevX: number, prevZ: number, bounds: readonly Point[]): boolean {
  if (pointInPolygon(car.x, car.z, bounds)) return false;
  const nx = car.x;
  const nz = car.z;
  if (pointInPolygon(nx, prevZ, bounds)) {
    car.z = prevZ;
  } else if (pointInPolygon(prevX, nz, bounds)) {
    car.x = prevX;
  } else {
    car.x = prevX;
    car.z = prevZ;
  }
  car.speed *= 0.6;
  return true;
}
