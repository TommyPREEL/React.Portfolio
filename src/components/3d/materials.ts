/**
 * @fileoverview Shared materials + palette helpers for the neon diorama.
 * Bloom luminanceThreshold is 0.6 (Scene). Multipliers stay low (<2) because AgX desaturates
 * channels pushed far above 1 toward white/yellow; hue holds when the max channel is ~1.6-1.7: only the HDR cyan/orange emissives exceed it;
 * the dim cyan, text labels and the matte surfaces stay below, so they never glow.
 */
import * as THREE from "three";
import { CONFIG } from "../../config";

const P = CONFIG.colors;

const hdr = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

export const emitCyan = new THREE.MeshBasicMaterial({ color: hdr(P.cyan, 1.6), toneMapped: false });
export const emitOrange = new THREE.MeshBasicMaterial({ color: hdr(P.orange, 1.7), toneMapped: false });
export const emitCyanDim = new THREE.MeshBasicMaterial({ color: hdr(P.cyanDim, 1), toneMapped: false });

/** Static scenery: unlit, shading is baked into vertex colours (see kit.ts). */
export const bakedMat = new THREE.MeshBasicMaterial({ vertexColors: true });

/** Dynamic objects (car, blocks): simple lit material, moon + faint ambient. */
export const litMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.1 });
export const blockMat = new THREE.MeshStandardMaterial({ color: P.matter700, roughness: 0.9, metalness: 0.05 });

export const palette = {
  night: P.night,
  m900: P.matter900,
  m800: P.matter800,
  m700: P.matter700,
  m600: P.matter600,
  line: P.line,
} as const;

let blobTexture: THREE.CanvasTexture | null = null;
/** Soft dark radial decal shared by every fake shadow. */
export function getBlobTexture(): THREE.CanvasTexture {
  if (blobTexture) return blobTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(0.6, "rgba(0,0,0,0.3)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  blobTexture = new THREE.CanvasTexture(canvas);
  blobTexture.colorSpace = THREE.SRGBColorSpace;
  return blobTexture;
}

let blobMaterial: THREE.MeshBasicMaterial | null = null;
export function getBlobMaterial(): THREE.MeshBasicMaterial {
  blobMaterial ??= new THREE.MeshBasicMaterial({ map: getBlobTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  return blobMaterial;
}
