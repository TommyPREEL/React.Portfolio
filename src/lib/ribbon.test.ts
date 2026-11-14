import { describe, expect, it } from "vitest";
import { buildRibbon, buildWall } from "./ribbon";

const pts = [[0, 0], [1, 0], [2, 0], [3, 0]] as const;

describe("buildRibbon skip", () => {
  it("omits triangles for skipped segments", () => {
    expect(buildRibbon(pts, 1, 0, false).indices.length).toBe(18);
    expect(buildRibbon(pts, 1, 0, false, (i) => i === 1).indices.length).toBe(12);
  });
});

describe("buildWall", () => {
  it("emits bottom and top vertices per point", () => {
    const w = buildWall(pts, 0, 0.5, false);
    expect(w.positions.length).toBe(pts.length * 6);
    expect(w.positions[4]).toBe(0.5);
    expect(w.indices.length).toBe(18);
  });
});
