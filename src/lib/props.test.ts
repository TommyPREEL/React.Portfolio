import { describe, expect, it } from "vitest";
import { scatterAlongOutline, seeded } from "./props";

const ring = Array.from({ length: 24 }, (_, i) => [50 * Math.cos((i / 24) * 6.283), 30 * Math.sin((i / 24) * 6.283)] as const);

describe("scatterAlongOutline", () => {
  it("is deterministic for a seed", () => {
    expect(scatterAlongOutline(ring, 10, 7, [], 0)).toEqual(scatterAlongOutline(ring, 10, 7, [], 0));
  });
  it("keeps clear of avoided points", () => {
    const avoid = [[50, 0]] as const;
    for (const p of scatterAlongOutline(ring, 30, 3, avoid, 12)) expect(Math.hypot(p.x - 50, p.z)).toBeGreaterThanOrEqual(12);
  });
  it("seeded rng stays in [0,1)", () => {
    const r = seeded(1);
    for (let i = 0; i < 100; i++) expect(r()).toBeLessThan(1);
  });
});
