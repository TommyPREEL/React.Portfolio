import { describe, expect, it } from "vitest";
import { DEFAULT_VOLUMES, parseVolumes } from "./soundPref";

describe("parseVolumes", () => {
  it("returns the defaults when nothing is saved", () => {
    expect(parseVolumes(null)).toEqual(DEFAULT_VOLUMES);
  });
  it("defaults: master at 50 % and music below the game sounds", () => {
    expect(DEFAULT_VOLUMES.master).toBe(0.5);
    expect(DEFAULT_VOLUMES.music).toBeLessThan(DEFAULT_VOLUMES.effects);
    expect(DEFAULT_VOLUMES.music).toBeLessThan(DEFAULT_VOLUMES.ambience);
  });
  it("keeps saved channels and fills the missing ones", () => {
    expect(parseVolumes('{"music":0.1}')).toEqual({ ...DEFAULT_VOLUMES, music: 0.1 });
  });
  it("clamps out-of-range values and ignores invalid ones", () => {
    expect(parseVolumes('{"master":3,"ui":-1,"effects":"loud","ambience":null}')).toEqual({
      ...DEFAULT_VOLUMES,
      master: 1,
      ui: 0,
    });
  });
  it("survives corrupted storage", () => {
    expect(parseVolumes("{not json")).toEqual(DEFAULT_VOLUMES);
    expect(parseVolumes("42")).toEqual(DEFAULT_VOLUMES);
  });
});
