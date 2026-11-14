import { describe, expect, it } from "vitest";
import { stepBlocks, type BlockBody } from "./blocks";
import type { CarState } from "./carPhysics";
import { constrainToPolygon, resolveCircleCollisions } from "./collision";
import { damp, pointInPolygon, type Point } from "./geometry";
import { projectToMinimap } from "./map";
import { buildRibbon } from "./ribbon";
import { detectTrigger } from "./triggers";

const square: Point[] = [[-10, -10], [10, -10], [10, 10], [-10, 10]];
const car = (o: Partial<CarState> = {}): CarState => ({ x: 0, z: 0, rotation: 0, speed: 5, ...o });

describe("geometry", () => {
  it("pointInPolygon", () => {
    expect(pointInPolygon(0, 0, square)).toBe(true);
    expect(pointInPolygon(11, 0, square)).toBe(false);
  });
  it("damp converges without overshoot", () => {
    const v = damp(0, 10, 5, 0.1);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(10);
  });
});

describe("detectTrigger", () => {
  const t = [
    { id: "big", position: [0, 0, 0] as const, triggerRadius: 10 },
    { id: "small", position: [2, 0, 0] as const, triggerRadius: 2 },
  ];
  it("returns null outside every trigger", () => expect(detectTrigger(50, 50, t)).toBeNull());
  it("returns the containing trigger", () => expect(detectTrigger(-8, 0, t)).toBe("big"));
  it("prefers the one the car is relatively closest to", () => expect(detectTrigger(2.2, 0, t)).toBe("small"));
});

describe("projectToMinimap", () => {
  const w = { width: 100, depth: 50 };
  it("centres the origin", () => expect(projectToMinimap(0, 0, w)).toEqual({ x: 50, y: 50 }));
  it("maps world edges to the span", () => {
    expect(projectToMinimap(50, 25, w)).toEqual({ x: 95, y: 95 });
    expect(projectToMinimap(-50, -25, w, 40, 30)).toEqual({ x: 10, y: 20 });
  });
});

describe("collision", () => {
  it("pushes the car out of a circle and slows it", () => {
    const c = car({ x: 1, z: 0 });
    expect(resolveCircleCollisions(c, 1, [{ x: 0, z: 0, r: 1 }])).toBe(true);
    expect(c.x).toBeCloseTo(2);
    expect(c.speed).toBeCloseTo(1.5);
  });
  it("ignores far circles", () => {
    const c = car({ x: 5 });
    expect(resolveCircleCollisions(c, 1, [{ x: 0, z: 0, r: 1 }])).toBe(false);
    expect(c.speed).toBe(5);
  });
  it("slides along the polygon edge instead of stopping dead", () => {
    const c = car({ x: 12, z: 5 });
    expect(constrainToPolygon(c, 9, 4, square)).toBe(true);
    expect(c.x).toBe(9);
    expect(c.z).toBe(5);
  });
  it("leaves a car that is inside alone", () => {
    const c = car({ x: 1, z: 1 });
    expect(constrainToPolygon(c, 0, 0, square)).toBe(false);
  });
});

describe("buildRibbon", () => {
  const pts: Point[] = [[0, 0], [10, 0], [20, 0]];
  it("creates 2 vertices per point and 2 triangles per segment", () => {
    const r = buildRibbon(pts, 1, 0.1, false);
    expect(r.positions).toHaveLength(18);
    expect(r.indices).toHaveLength(12);
  });
  it("is offset by the half width on both sides", () => {
    const r = buildRibbon(pts, 2, 0, false);
    expect(Math.abs(r.positions[2]! - r.positions[5]!)).toBeCloseTo(4);
  });
  it("closed ribbons add the wrap-around segment", () => {
    expect(buildRibbon(square, 1, 0, true).indices).toHaveLength(24);
  });
});

describe("stepBlocks", () => {
  const params = { radius: 0.7, damping: 3, limitX: 100, limitZ: 100 };
  const block = (x: number, z: number): BlockBody => ({ x, z, vx: 0, vz: 0, yaw: 0, spin: 0 });
  it("pushes a block away from a moving car", () => {
    const b = [block(1, 0)];
    stepBlocks(b, { x: 0, z: 0, vx: 8, vz: 0, r: 0.9 }, params, 1 / 60);
    expect(b[0]!.vx).toBeGreaterThan(5);
    expect(b[0]!.x).toBeGreaterThan(1);
  });
  it("blocks come to rest through damping", () => {
    const b = [{ ...block(0, 0), vx: 5 }];
    for (let i = 0; i < 600; i++) stepBlocks(b, { x: 99, z: 99, vx: 0, vz: 0, r: 0.9 }, params, 1 / 60);
    expect(Math.abs(b[0]!.vx)).toBeLessThan(0.01);
  });
  it("separates overlapping blocks", () => {
    const b = [block(0, 0), block(0.5, 0)];
    stepBlocks(b, { x: 99, z: 99, vx: 0, vz: 0, r: 0.9 }, params, 1 / 60);
    expect(b[1]!.x - b[0]!.x).toBeGreaterThanOrEqual(1.39);
  });
  it("keeps blocks inside the limits", () => {
    const b = [{ ...block(99, 0), vx: 100 }];
    stepBlocks(b, { x: -99, z: 0, vx: 0, vz: 0, r: 0.9 }, params, 0.5);
    expect(b[0]!.x).toBeLessThanOrEqual(100);
  });
  it("reports no movement once every block is at rest", () => {
    const b = [block(0, 0)];
    const far = { x: 99, z: 99, vx: 0, vz: 0, r: 0.9 };
    expect(stepBlocks(b, far, params, 1 / 60)).toBe(false);
    b[0]!.vx = 5;
    expect(stepBlocks(b, far, params, 1 / 60)).toBe(true);
    let last = true;
    for (let i = 0; i < 900 && last; i++) last = stepBlocks(b, far, params, 1 / 60);
    expect(last).toBe(false);
  });
});
