import { describe, expect, it } from "vitest";
import {
  ENGINE_IDLE_GAIN,
  ENGINE_IDLE_RATE,
  THEME_DUCK_FLOOR,
  centroid,
  cooledDown,
  engineMix,
  impactGain,
  proximityGain,
  scaledInterval,
  smoothstep,
  themeDuck,
} from "./audioMix";
import { parseSoundPref } from "./soundPref";
import { stepBlocks, type BlockBody } from "./blocks";

describe("smoothstep / proximityGain", () => {
  it("smoothstep clamps and is symmetric around the midpoint", () => {
    expect(smoothstep(0, 10, -5)).toBe(0);
    expect(smoothstep(0, 10, 15)).toBe(1);
    expect(smoothstep(0, 10, 5)).toBeCloseTo(0.5);
    expect(smoothstep(0, 10, 2) + smoothstep(0, 10, 8)).toBeCloseTo(1);
  });
  it("is full inside the inner radius, silent beyond the outer one, decreasing between", () => {
    expect(proximityGain(0, 3, 25)).toBe(1);
    expect(proximityGain(3, 3, 25)).toBe(1);
    expect(proximityGain(25, 3, 25)).toBe(0);
    expect(proximityGain(40, 3, 25)).toBe(0);
    const a = proximityGain(8, 3, 25);
    const b = proximityGain(16, 3, 25);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(0);
  });
  it("centroid averages xz", () => {
    expect(centroid([[-6, 0, -8], [0, 5, -8], [6, 0, -8]])).toEqual({ x: 0, z: -8 });
    expect(centroid([])).toEqual({ x: 0, z: 0 });
  });
});

describe("engineMix", () => {
  const max = 11;
  const boost = 20;
  it("idles at rest", () => {
    const m = engineMix(0, false, max, boost);
    expect(m.rate).toBe(ENGINE_IDLE_RATE);
    expect(m.gain).toBe(ENGINE_IDLE_GAIN);
  });
  it("rises with speed, reverse counts as forward", () => {
    const slow = engineMix(3, false, max, boost);
    const fast = engineMix(11, false, max, boost);
    expect(fast.rate).toBeGreaterThan(slow.rate);
    expect(fast.gain).toBeGreaterThan(slow.gain);
    expect(engineMix(-3, false, max, boost)).toEqual(slow);
  });
  it("goes higher while boosting and stays within gain bounds", () => {
    const top = engineMix(11, false, max, boost);
    const boosted = engineMix(20, true, max, boost);
    expect(boosted.rate).toBeGreaterThan(top.rate);
    expect(boosted.gain).toBeGreaterThanOrEqual(top.gain);
    expect(boosted.gain).toBeLessThanOrEqual(1);
  });
  it("writes into the provided object (no allocation)", () => {
    const out = { rate: 0, gain: 0 };
    expect(engineMix(5, false, max, boost, out)).toBe(out);
  });
});

describe("themeDuck / intervals / impacts", () => {
  it("ducks the theme by about 10 dB at full arcade level", () => {
    expect(themeDuck(0)).toBe(1);
    expect(themeDuck(1)).toBeCloseTo(THEME_DUCK_FLOOR);
    expect(20 * Math.log10(themeDuck(1))).toBeCloseTo(-10);
    expect(themeDuck(0.5)).toBeGreaterThan(themeDuck(1));
  });
  it("scaledInterval spans [min, max] when close and stretches when far", () => {
    expect(scaledInterval(0.6, 2.5, 1, 0)).toBeCloseTo(0.6);
    expect(scaledInterval(0.6, 2.5, 1, 1)).toBeCloseTo(2.5);
    expect(scaledInterval(0.6, 2.5, 0, 0)).toBeCloseTo(2.4);
    expect(scaledInterval(0.6, 2.5, 0.5, 0.5)).toBeGreaterThan(scaledInterval(0.6, 2.5, 1, 0.5));
  });
  it("impactGain is silent for grazes and grows with impact", () => {
    expect(impactGain(0.2)).toBe(0);
    expect(impactGain(2)).toBeGreaterThan(0);
    expect(impactGain(10)).toBeGreaterThan(impactGain(2));
    expect(impactGain(100)).toBe(1);
  });
  it("cooledDown", () => {
    expect(cooledDown(10, 9.5, 1)).toBe(false);
    expect(cooledDown(10, 9, 1)).toBe(true);
    expect(cooledDown(0, -Infinity, 20)).toBe(true);
  });
});

describe("sound preference", () => {
  it("is off unless saved as on", () => {
    expect(parseSoundPref(null)).toBe(false);
    expect(parseSoundPref("off")).toBe(false);
    expect(parseSoundPref("garbage")).toBe(false);
    expect(parseSoundPref("on")).toBe(true);
  });
});

describe("stepBlocks impact report", () => {
  const params = { radius: 0.75, damping: 2.6, limitX: 50, limitZ: 50 };
  it("reports the closing speed of a car hit, and 0 when nothing is touched", () => {
    const b: BlockBody[] = [{ x: 1.2, z: 0, vx: 0, vz: 0, yaw: 0, spin: 0 }];
    const hit = { impact: -1 };
    stepBlocks(b, { x: 0, z: 0, vx: 8, vz: 0, r: 0.9 }, params, 1 / 60, hit);
    expect(hit.impact).toBeCloseTo(8);
    stepBlocks(b, { x: 99, z: 99, vx: 0, vz: 0, r: 0.9 }, params, 1 / 60, hit);
    expect(hit.impact).toBe(0);
  });
});
