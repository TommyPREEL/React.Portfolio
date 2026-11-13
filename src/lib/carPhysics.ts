/**
 * @fileoverview Pure car physics step (input -> new pose). No React / three.
 * Units: world units and seconds; rotation 0 faces +z, forward = (sin r, cos r).
 */

export interface CarState {
  x: number;
  z: number;
  rotation: number;
  speed: number;
}

export interface CarInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
  /** Absolute world-space joystick vector (mobile), each in [-1, 1]. */
  joystickX: number;
  joystickZ: number;
}

export interface CarParams {
  acceleration: number;
  maxSpeed: number;
  boostSpeed: number;
  boostAcceleration: number;
  /** Speed multiplier per 1/60 s when not accelerating. */
  friction: number;
  steeringSpeed: number;
}

export const IDLE_INPUT: Readonly<CarInput> = {
  forward: false, backward: false, left: false, right: false, boost: false, joystickX: 0, joystickZ: 0,
};

const TAU = Math.PI * 2;

function wrapAngle(a: number): number {
  let d = a % TAU;
  if (d > Math.PI) d -= TAU;
  else if (d < -Math.PI) d += TAU;
  return d;
}

/** Steps the car by `dt` seconds. Writes into `out` (defaults to a fresh object). */
export function stepCar(prev: CarState, input: CarInput, p: CarParams, dt: number, out: CarState = { x: 0, z: 0, rotation: 0, speed: 0 }): CarState {
  const maxSpeed = input.boost ? p.boostSpeed : p.maxSpeed;
  const accel = input.boost ? p.boostAcceleration : p.acceleration;
  let { speed, rotation } = prev;

  const jmag = Math.hypot(input.joystickX, input.joystickZ);
  if (jmag > 0.05) {
    const target = Math.atan2(input.joystickX, input.joystickZ);
    rotation += wrapAngle(target - rotation) * (1 - Math.exp(-dt * 11));
    speed = Math.min(jmag, 1) * maxSpeed;
  } else {
    const throttle = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
    speed += throttle * accel * dt;
    speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed));
    if (throttle === 0) speed *= Math.pow(p.friction, dt * 60);
    // No steering at standstill; ramps in with speed so the car does not pivot on the spot.
    const authority = Math.min(1, Math.abs(speed) / 2.5);
    const steer = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    rotation += steer * p.steeringSpeed * authority * dt * (speed >= 0 ? 1 : -1);
    if (Math.abs(speed) < 0.001) rotation = prev.rotation;
  }

  out.rotation = rotation;
  out.speed = speed;
  out.x = prev.x + Math.sin(rotation) * speed * dt;
  out.z = prev.z + Math.cos(rotation) * speed * dt;
  return out;
}
