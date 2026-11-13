import { describe, expect, it } from "vitest";
import { CAR_BOUNDS, COLLIDERS, INTERACTABLES, ISLAND_OUTLINE, SKILL_BLOCKS, SPAWN, WORLD_BOUNDS, approachPoint, getInteractable } from "../config/world";
import { getContent } from "../i18n";
import { pointInPolygon } from "./geometry";
import { detectTrigger } from "./triggers";

describe("world layout", () => {
  it("has every interactable, collider and skill block on the island", () => {
    for (const it of INTERACTABLES) expect(pointInPolygon(it.position[0], it.position[2], ISLAND_OUTLINE), it.id).toBe(true);
    for (const c of COLLIDERS) expect(pointInPolygon(c.x, c.z, ISLAND_OUTLINE)).toBe(true);
    for (const b of SKILL_BLOCKS) expect(pointInPolygon(b.x, b.z, ISLAND_OUTLINE), b.id).toBe(true);
  });
  it("fits the island inside the declared bounds", () => {
    for (const [x, z] of ISLAND_OUTLINE) {
      expect(Math.abs(x)).toBeLessThan(WORLD_BOUNDS.width / 2);
      expect(Math.abs(z)).toBeLessThan(WORLD_BOUNDS.depth / 2);
    }
  });
  it("spawns on the island, in front of the garage but outside its trigger", () => {
    expect(pointInPolygon(SPAWN.x, SPAWN.z, CAR_BOUNDS)).toBe(true);
    expect(detectTrigger(SPAWN.x, SPAWN.z, INTERACTABLES)).toBeNull();
  });
  it("maps every projectId to a known i18n project, without duplicates", () => {
    const ids = INTERACTABLES.filter((i) => i.projectId).map((i) => i.projectId as string);
    const known = getContent("en").projects.items.map((p) => p.id);
    for (const id of ids) expect(known).toContain(id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(10);
  });
  it("creates one skill block per skill item", () => {
    const n = getContent("en").skills.categories.reduce((a, c) => a + c.items.length, 0);
    expect(SKILL_BLOCKS).toHaveLength(n);
  });
  it("approach points sit inside their own trigger", () => {
    for (const it of INTERACTABLES) {
      const p = approachPoint(it);
      expect(detectTrigger(p.x, p.z, INTERACTABLES), it.id).toBe(it.id);
    }
    expect(getInteractable("garage")?.section).toBe("about");
  });
});
