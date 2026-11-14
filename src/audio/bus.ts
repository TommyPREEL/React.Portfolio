/**
 * @fileoverview Tiny module-level sound event bus: game code (useFrame, handlers) fires
 * one-shots without React state. With sound off there is no listener and emits are no-ops.
 */
import type { OneShotId } from "./manifest";

type Listener = (id: OneShotId, gain: number) => void;

let listener: Listener | null = null;

export function emitSound(id: OneShotId, gain = 1): void {
  if (listener) listener(id, gain);
}

export function setSoundListener(l: Listener | null): void {
  listener = l;
}
