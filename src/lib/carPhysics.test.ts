import { describe, expect, it } from "vitest";
import { IDLE_INPUT, stepCar, type CarInput, type CarParams, type CarState } from "./carPhysics";

const P: CarParams = { acceleration: 20, maxSpeed: 10, boostSpeed: 20, boostAcceleration: 40, friction: 0.9, steeringSpeed: 2 };
const start = (): CarState => ({ x: 0, z: 0, rotation: 0, speed: 0 });
const input = (o: Partial<CarInput>): CarInput => ({ ...IDLE_INPUT, ...o });

describe("stepCar", () => {
  it("accelerates and moves along the heading (rotation 0 = +z)", () => {
    const s = stepCar(start(), input({ forward: true }), P, 0.1);
    expect(s.speed).toBeCloseTo(2);
    expect(s.z).toBeGreaterThan(0);
    expect(s.x).toBeCloseTo(0);
  });

  it("moves along +x when rotation is PI/2", () => {
    const s = stepCar({ ...start(), rotation: Math.PI / 2, speed: 5 }, IDLE_INPUT, P, 0.1);
    expect(s.x).toBeGreaterThan(0);
    expect(s.z).toBeCloseTo(0, 5);
  });

  it("clamps to max speed, and to boost speed when boosting", () => {
    let s = start();
    for (let i = 0; i < 100; i++) s = stepCar(s, input({ forward: true }), P, 0.05);
    expect(s.speed).toBe(10);
    for (let i = 0; i < 100; i++) s = stepCar(s, input({ forward: true, boost: true }), P, 0.05);
    expect(s.speed).toBe(20);
  });

  it("reverses with backward input, capped at max speed", () => {
    let s = start();
    for (let i = 0; i < 100; i++) s = stepCar(s, input({ backward: true }), P, 0.05);
    expect(s.speed).toBe(-10);
  });

  it("decays speed with friction when no throttle", () => {
    const s = stepCar({ ...start(), speed: 10 }, IDLE_INPUT, P, 1 / 60);
    expect(s.speed).toBeCloseTo(9);
  });

  it("does not steer while standing still, steers when moving", () => {
    expect(stepCar(start(), input({ left: true }), P, 0.1).rotation).toBe(0);
    const moving = stepCar({ ...start(), speed: 8 }, input({ left: true }), P, 0.1);
    expect(moving.rotation).toBeGreaterThan(0);
    const right = stepCar({ ...start(), speed: 8 }, input({ right: true }), P, 0.1);
    expect(right.rotation).toBeLessThan(0);
  });

  it("inverts steering when reversing", () => {
    const s = stepCar({ ...start(), speed: -8 }, input({ left: true }), P, 0.1);
    expect(s.rotation).toBeLessThan(0);
  });

  it("joystick turns towards the stick direction and scales speed", () => {
    let s = start();
    for (let i = 0; i < 120; i++) s = stepCar(s, input({ joystickX: 1, joystickZ: 0 }), P, 1 / 60);
    expect(s.rotation).toBeCloseTo(Math.PI / 2, 1);
    expect(s.speed).toBeCloseTo(10);
    const half = stepCar(start(), input({ joystickX: 0, joystickZ: 0.5 }), P, 1 / 60);
    expect(half.speed).toBeCloseTo(5);
  });

  it("writes into the provided out object without allocating a new one", () => {
    const out = start();
    const r = stepCar(start(), input({ forward: true }), P, 0.1, out);
    expect(r).toBe(out);
  });

  it("is stable for the same total time with different dt (position within 5 percent)", () => {
    let a = start();
    let b = start();
    for (let i = 0; i < 60; i++) a = stepCar(a, input({ forward: true }), P, 1 / 60);
    for (let i = 0; i < 30; i++) b = stepCar(b, input({ forward: true }), P, 1 / 30);
    expect(Math.abs(a.z - b.z) / a.z).toBeLessThan(0.05);
  });
});
