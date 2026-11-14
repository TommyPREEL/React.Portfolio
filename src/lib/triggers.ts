export interface TriggerLike {
  id: string;
  position: readonly [number, number, number];
  triggerRadius: number;
}

/** Returns the id of the nearest trigger whose radius contains (x, z), else null. */
export function detectTrigger(x: number, z: number, triggers: readonly TriggerLike[]): string | null {
  let best: string | null = null;
  let bestRatio = Infinity;
  for (let i = 0; i < triggers.length; i++) {
    const t = triggers[i]!;
    const dx = x - t.position[0];
    const dz = z - t.position[2];
    const r2 = t.triggerRadius * t.triggerRadius;
    const d2 = dx * dx + dz * dz;
    if (d2 > r2) continue;
    const ratio = d2 / r2; // normalised so a small trigger wins over a big overlapping one
    if (ratio < bestRatio) {
      bestRatio = ratio;
      best = t.id;
    }
  }
  return best;
}
