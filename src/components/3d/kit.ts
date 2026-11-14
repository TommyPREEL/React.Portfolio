/**
 * @fileoverview Procedural low-poly kit: describe a landmark as boxes / cylinders /
 * cones, merge them into ONE geometry with baked vertex-colour shading (fake AO:
 * darker low and on bottom faces). Replaced later by Blender GLBs.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export interface Part {
  shape: "box" | "cyl" | "cone";
  /** box: [w,h,d]; cyl: [rTop,rBottom,h,segments?]; cone: [r,h,segments?] */
  size: number[];
  pos: [number, number, number];
  rot?: [number, number, number];
  color?: string;
}

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const one = new THREE.Vector3(1, 1, 1);
const col = new THREE.Color();

function baseGeometry(p: Part): THREE.BufferGeometry {
  const s = p.size;
  if (p.shape === "box") return new THREE.BoxGeometry(s[0], s[1], s[2]);
  if (p.shape === "cyl") return new THREE.CylinderGeometry(s[0], s[1], s[2], s[3] ?? 10);
  return new THREE.ConeGeometry(s[0], s[1], s[2] ?? 10);
}

/** Optional world placement applied to every part (yaw + offset), for merging many props. */
export interface Placement {
  x: number;
  z: number;
  rotY: number;
}

export function mergeParts(parts: Part[], placement?: Placement): THREE.BufferGeometry {
  const geos = parts.map((p) => {
    const g = baseGeometry(p);
    g.deleteAttribute("uv");
    q.setFromEuler(e.set(...(p.rot ?? [0, 0, 0])));
    m.compose(new THREE.Vector3(...p.pos), q, one);
    g.applyMatrix4(m);
    if (placement) {
      m.makeRotationY(placement.rotY).setPosition(placement.x, 0, placement.z);
      g.applyMatrix4(m);
    }
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    const h = Math.max(bb.max.y - bb.min.y, 1e-3);
    const pos = g.getAttribute("position");
    const nor = g.getAttribute("normal");
    const colors = new Float32Array(pos.count * 3);
    col.set(p.color ?? "#1B2129");
    for (let i = 0; i < pos.count; i++) {
      const ny = nor.getY(i);
      const nz = nor.getZ(i);
      // top lit by the moon, bottoms in contact shadow, sides in between (fronts a bit brighter)
      const face = ny > 0.5 ? 1 : ny < -0.5 ? 0.4 : 0.62 + 0.14 * Math.max(0, nz);
      const t = (pos.getY(i) - bb.min.y) / h;
      const k = face * (0.72 + 0.28 * t);
      colors[i * 3] = col.r * k;
      colors[i * 3 + 1] = col.g * k;
      colors[i * 3 + 2] = col.b * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  });
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  if (!merged) throw new Error("mergeParts: incompatible geometries");
  return merged;
}

/** Shorthand builders. */
export const box = (w: number, h: number, d: number, x: number, y: number, z: number, color?: string, rot?: [number, number, number]): Part => ({
  shape: "box",
  size: [w, h, d],
  pos: [x, y, z],
  ...(color ? { color } : {}),
  ...(rot ? { rot } : {}),
});
export const cyl = (rTop: number, rBot: number, h: number, x: number, y: number, z: number, color?: string, rot?: [number, number, number], seg = 10): Part => ({
  shape: "cyl",
  size: [rTop, rBot, h, seg],
  pos: [x, y, z],
  ...(color ? { color } : {}),
  ...(rot ? { rot } : {}),
});
export const cone = (r: number, h: number, x: number, y: number, z: number, color?: string, rot?: [number, number, number], seg = 10): Part => ({
  shape: "cone",
  size: [r, h, seg],
  pos: [x, y, z],
  ...(color ? { color } : {}),
  ...(rot ? { rot } : {}),
});
