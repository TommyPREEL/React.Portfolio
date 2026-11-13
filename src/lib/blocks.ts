/** Simple push physics for the skill blocks (circles on the xz plane). */

export interface BlockBody {
  x: number;
  z: number;
  vx: number;
  vz: number;
  yaw: number;
  spin: number;
}

export interface PusherState {
  x: number;
  z: number;
  vx: number;
  vz: number;
  r: number;
}

export interface BlockParams {
  radius: number;
  /** Velocity damping rate (1/s). */
  damping: number;
  /** Half extent of the allowed area (blocks stay within +-limit). */
  limitX: number;
  limitZ: number;
}

/** Velocities below this are snapped to rest so settled blocks stop reporting movement. */
const REST_EPS = 1e-3;

/** Advances the blocks; returns true when at least one block moved (callers skip GPU uploads otherwise). */
export function stepBlocks(blocks: BlockBody[], car: PusherState, p: BlockParams, dt: number): boolean {
  let moved = false;
  const minCar = car.r + p.radius;
  const decay = Math.exp(-p.damping * dt);
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]!;
    const dx = b.x - car.x;
    const dz = b.z - car.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < minCar * minCar && d2 > 1e-8) {
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const nz = dz / d;
      b.x += nx * (minCar - d);
      b.z += nz * (minCar - d);
      moved = true;
      const rel = (car.vx - b.vx) * nx + (car.vz - b.vz) * nz; // closing speed along the normal
      if (rel > 0) {
        b.vx += nx * rel * 1.2;
        b.vz += nz * rel * 1.2;
        b.spin += (nx * car.vz - nz * car.vx) * 0.25;
      }
    }
    // block-block separation (cheap O(n^2), n is small)
    for (let j = i + 1; j < blocks.length; j++) {
      const o = blocks[j]!;
      const ex = o.x - b.x;
      const ez = o.z - b.z;
      const e2 = ex * ex + ez * ez;
      const m = p.radius * 2;
      if (e2 < m * m && e2 > 1e-8) {
        const e = Math.sqrt(e2);
        const nx = ex / e;
        const nz = ez / e;
        const half = (m - e) / 2;
        b.x -= nx * half;
        b.z -= nz * half;
        o.x += nx * half;
        o.z += nz * half;
        moved = true;
        const rv = (b.vx - o.vx) * nx + (b.vz - o.vz) * nz;
        if (rv > 0) {
          b.vx -= nx * rv * 0.5;
          b.vz -= nz * rv * 0.5;
          o.vx += nx * rv * 0.5;
          o.vz += nz * rv * 0.5;
        }
      }
    }
    if (b.vx !== 0 || b.vz !== 0 || b.spin !== 0) {
      b.x += b.vx * dt;
      b.z += b.vz * dt;
      b.yaw += b.spin * dt;
      moved = true;
    }
    b.vx *= decay;
    b.vz *= decay;
    b.spin *= decay;
    if (Math.abs(b.vx) < REST_EPS) b.vx = 0;
    if (Math.abs(b.vz) < REST_EPS) b.vz = 0;
    if (Math.abs(b.spin) < REST_EPS) b.spin = 0;
    if (Math.abs(b.x) > p.limitX) {
      b.x = Math.sign(b.x) * p.limitX;
      moved = true;
      b.vx *= -0.3;
    }
    if (Math.abs(b.z) > p.limitZ) {
      b.z = Math.sign(b.z) * p.limitZ;
      moved = true;
      b.vz *= -0.3;
    }
  }
  return moved;
}
