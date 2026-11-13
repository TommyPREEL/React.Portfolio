import { describe, expect, it } from "vitest";
import { parseRoute, routeToPath } from "./route";
import { pickLanguage } from "./language";

const ids = ["pvpedia", "airbus"];

describe("parseRoute", () => {
  it("maps the root to the world without a section", () => {
    expect(parseRoute("/", ids)).toEqual({ mode: "world", section: null, projectId: null });
  });
  it("recognises express mode", () => {
    expect(parseRoute("/express", ids)).toEqual({ mode: "express" });
  });
  it("opens a section, case-insensitive, trailing slash tolerated", () => {
    expect(parseRoute("/Skills/", ids)).toEqual({ mode: "world", section: "skills", projectId: null });
  });
  it("keeps a known project id and drops an unknown one", () => {
    expect(parseRoute("/projects/pvpedia", ids)).toEqual({ mode: "world", section: "projects", projectId: "pvpedia" });
    expect(parseRoute("/projects/nope", ids)).toEqual({ mode: "world", section: "projects", projectId: null });
  });
  it("falls back to the world on unknown paths", () => {
    expect(parseRoute("/whatever/else", ids)).toEqual({ mode: "world", section: null, projectId: null });
  });
  it("round-trips through routeToPath", () => {
    for (const p of ["/", "/express", "/about", "/projects", "/projects/airbus", "/contact"]) {
      expect(routeToPath(parseRoute(p, ids))).toBe(p);
    }
  });
});

describe("pickLanguage", () => {
  it("prefers a saved valid choice", () => {
    expect(pickLanguage("fr", ["en-US"])).toBe("fr");
    expect(pickLanguage("en", ["fr-FR"])).toBe("en");
  });
  it("ignores an invalid saved value and uses the browser language", () => {
    expect(pickLanguage("de", ["fr-CA"])).toBe("fr");
  });
  it("defaults to English", () => {
    expect(pickLanguage(null, [])).toBe("en");
    expect(pickLanguage(null, ["es-ES"])).toBe("en");
  });
});
