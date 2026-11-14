export interface MinimapPoint {
  /** Percent from the left / top of the minimap box. */
  x: number;
  y: number;
}

/**
 * Projects world xz to minimap percentages. The world (centred on the origin) spans
 * spanX / spanY percent either side of the centre (leaves a margin by default).
 */
export function projectToMinimap(
  x: number,
  z: number,
  world: { width: number; depth: number },
  spanX = 45,
  spanY = 45,
): MinimapPoint {
  return { x: 50 + (x / (world.width / 2)) * spanX, y: 50 + (z / (world.depth / 2)) * spanY };
}
