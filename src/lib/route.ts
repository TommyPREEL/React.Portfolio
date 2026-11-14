/**
 * URL <-> app view mapping. Pure so it can be unit-tested.
 * Supported paths: "/", "/classic", "/about", "/projects", "/projects/<id>", "/skills", "/contact".
 */

export const SECTIONS = ["about", "projects", "skills", "contact"] as const;
export type Section = (typeof SECTIONS)[number];

export type Route =
  | { mode: "express" }
  | { mode: "world"; section: Section | null; projectId: string | null };

const isSection = (s: string): s is Section => (SECTIONS as readonly string[]).includes(s);

export function parseRoute(pathname: string, knownProjectIds: readonly string[]): Route {
  const parts = pathname.toLowerCase().split("/").filter(Boolean);
  const [first, second] = parts;
  if (first === "classic") return { mode: "express" };
  if (first && isSection(first)) {
    const projectId = first === "projects" && second && knownProjectIds.includes(second) ? second : null;
    return { mode: "world", section: first, projectId };
  }
  return { mode: "world", section: null, projectId: null };
}

export function routeToPath(route: Route): string {
  if (route.mode === "express") return "/classic";
  if (!route.section) return "/";
  if (route.section === "projects" && route.projectId) return `/projects/${route.projectId}`;
  return `/${route.section}`;
}
