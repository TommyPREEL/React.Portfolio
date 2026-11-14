export const SOUND_STORAGE_KEY = "portfolio.sound";

/** Sound is off unless the visitor explicitly turned it on before. */
export function parseSoundPref(saved: string | null): boolean {
  return saved === "on";
}

/** Browser storage can throw (private mode, blocked site data): never let it break the app. */
export function readSoundPref(): boolean {
  try {
    return parseSoundPref(window.localStorage.getItem(SOUND_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function saveSoundPref(on: boolean): void {
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* preference simply not remembered */
  }
}

/** Volume of each mix channel, 0..1 (linear amplitude: 0.5 ≈ -6 dB). */
export interface SoundVolumes {
  master: number;
  music: number;
  effects: number;
  ambience: number;
  ui: number;
}

export const VOLUME_CHANNELS = ["master", "music", "effects", "ambience", "ui"] as const satisfies readonly (keyof SoundVolumes)[];

/** Defaults chosen with Tommy: overall at 50 %, music clearly under the game sounds. */
export const DEFAULT_VOLUMES: SoundVolumes = { master: 0.5, music: 0.35, effects: 0.8, ambience: 0.7, ui: 0.6 };

export const VOLUMES_STORAGE_KEY = "portfolio.volumes";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Saved JSON → volumes; anything missing, invalid or out of range falls back to / is clamped to defaults. */
export function parseVolumes(saved: string | null): SoundVolumes {
  const out: SoundVolumes = { ...DEFAULT_VOLUMES };
  if (!saved) return out;
  let data: unknown;
  try {
    data = JSON.parse(saved);
  } catch {
    return out;
  }
  if (typeof data !== "object" || data === null) return out;
  for (const key of VOLUME_CHANNELS) {
    const v = (data as Record<string, unknown>)[key];
    if (typeof v === "number" && Number.isFinite(v)) out[key] = clamp01(v);
  }
  return out;
}

export function readVolumes(): SoundVolumes {
  try {
    return parseVolumes(window.localStorage.getItem(VOLUMES_STORAGE_KEY));
  } catch {
    return { ...DEFAULT_VOLUMES };
  }
}

export function saveVolumes(volumes: SoundVolumes): void {
  try {
    window.localStorage.setItem(VOLUMES_STORAGE_KEY, JSON.stringify(volumes));
  } catch {
    /* preference simply not remembered */
  }
}
