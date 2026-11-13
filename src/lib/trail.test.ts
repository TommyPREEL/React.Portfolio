import { describe, expect, it } from "vitest";
import { advanceTrail, collapseTrail, createTrail, setTrailHead, trailFade } from "./trail";

describe("trail", () => {
  it("writes the head pair perpendicular to the heading", () => {
    const t = createTrail(4);
    setTrailHead(t, 10, 5, 0.1, 1, 0, 0.5);
    expect(Array.from(t.positions.slice(0, 6))).toEqual([9.5, expect.closeTo(0.1), 5, 10.5, expect.closeTo(0.1), 5]);
  });
  it("advance shifts samples older and keeps the head", () => {
    const t = createTrail(3);
    setTrailHead(t, 11, 1, 0, 1, 0, 1);
    advanceTrail(t);
    setTrailHead(t, 21, 2, 0, 1, 0, 1);
    expect(t.positions[0]).toBe(20);
    expect(t.positions[6]).toBe(10);
    advanceTrail(t);
    expect(t.positions[12]).toBe(10);
    expect(t.positions[6]).toBe(20);
  });
  it("collapse copies the head everywhere", () => {
    const t = createTrail(3);
    setTrailHead(t, 7, 7, 0, 1, 0, 1);
    collapseTrail(t);
    expect(t.positions[12]).toBe(6);
  });
  it("fades from 1 to 0", () => {
    expect(trailFade(0, 10)).toBe(1);
    expect(trailFade(9, 10)).toBe(0);
    expect(trailFade(4, 10)).toBeLessThan(trailFade(2, 10));
  });
});
