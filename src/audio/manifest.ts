/**
 * @fileoverview Every sound file, its base gain and its mix channel.
 * Base gains are first guesses: tune them by ear. Sources: docs/ASSET_LICENSES.md.
 */

/** Mix channel, each with its own user volume (see SoundVolumes). */
export type Channel = "effects" | "ambience" | "ui";

export interface OneShotDef {
  src: string;
  gain: number;
  channel: Channel;
  /** Minimum delay between two plays of this sound (s). */
  minInterval?: number;
}

/** Short files decoded to AudioBuffers and fired on demand. */
export const ONE_SHOTS = {
  boost: { src: "/sounds/boost.mp3", gain: 0.55, channel: "effects" },
  plane: { src: "/sounds/plane.mp3", gain: 0.7, channel: "ambience" },
  "block-hit": { src: "/sounds/block-hit.mp3", gain: 0.6, channel: "effects", minInterval: 0.08 },
  "server-bleep-1": { src: "/sounds/server-bleep-1.mp3", gain: 0.25, channel: "ambience" },
  "server-bleep-2": { src: "/sounds/server-bleep-2.mp3", gain: 0.25, channel: "ambience" },
  "server-bleep-3": { src: "/sounds/server-bleep-3.mp3", gain: 0.25, channel: "ambience" },
  "arcade-coin": { src: "/sounds/arcade-coin.mp3", gain: 0.35, channel: "ambience" },
  "arcade-powerup": { src: "/sounds/arcade-powerup.mp3", gain: 0.3, channel: "ambience" },
  "antenna-ping": { src: "/sounds/antenna-ping.mp3", gain: 0.35, channel: "ambience" },
  "ui-click": { src: "/sounds/ui-click.mp3", gain: 0.4, channel: "ui", minInterval: 0.05 },
  "ui-open": { src: "/sounds/ui-open.mp3", gain: 0.45, channel: "ui", minInterval: 0.1 },
  "ui-close": { src: "/sounds/ui-close.mp3", gain: 0.45, channel: "ui", minInterval: 0.1 },
  "ui-toggle": { src: "/sounds/ui-toggle.mp3", gain: 0.5, channel: "ui" },
} as const satisfies Record<string, OneShotDef>;

export type OneShotId = keyof typeof ONE_SHOTS;

/** Short seamless loops, decoded to AudioBuffers. */
export const LOOPS = {
  engine: { src: "/sounds/engine.mp3", gain: 0.3 },
  serverHum: { src: "/sounds/server-hum.mp3", gain: 0.45 },
} as const;

/** Long tracks, streamed through <audio> elements (no minutes of decoded PCM in memory). */
export const STREAMS = {
  theme: { src: "/sounds/theme.mp3", gain: 0.22 },
  arcade: { src: "/sounds/arcade.mp3", gain: 0.4 },
} as const;

/** Proximity radii (world units): full level inside `inner`, silent beyond `outer`. */
export const PROXIMITY = {
  arcade: { inner: 7, outer: 25 },
  serverRack: { inner: 2.5, outer: 20 },
  antenna: { inner: 4, outer: 22 },
} as const;

export const SERVER_BLEEPS = ["server-bleep-1", "server-bleep-2", "server-bleep-3"] as const satisfies readonly OneShotId[];
export const ARCADE_FX = ["arcade-coin", "arcade-powerup"] as const satisfies readonly OneShotId[];
