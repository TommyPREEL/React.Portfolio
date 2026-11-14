/**
 * @fileoverview Web Audio engine. One AudioContext, created on the first user gesture that
 * turns sound on; nothing is fetched before. Graph:
 *   master ─┬─ music (theme <audio> stream, ducked by the arcade)
 *           ├─ world ─┬─ effects  (engine loop, boost, block hits)
 *           │         └─ ambience (arcade chiptune, server hum/bleeps, plane, antenna)
 *           │   world is faded out in panels/express
 *           └─ ui    (interface one-shots)
 * master, music, effects, ambience and ui carry the visitor's volume settings (SoundVolumes).
 * Its own requestAnimationFrame loop reads the car pose from the store (no React).
 */
import { CONFIG } from "../config";
import { INTERACTABLES } from "../config/world";
import {
  centroid,
  cooledDown,
  distance2D,
  engineMix,
  proximityGain,
  scaledInterval,
  themeDuck,
  type EngineMix,
} from "../lib/audioMix";
import { DEFAULT_VOLUMES, type SoundVolumes } from "../lib/soundPref";
import { useGameStore } from "../store/gameStore";
import { setSoundListener } from "./bus";
import { ARCADE_FX, LOOPS, ONE_SHOTS, PROXIMITY, SERVER_BLEEPS, STREAMS, type OneShotId } from "./manifest";

/** setTargetAtTime time constants (s): ~3 tc to settle. */
const TC_FAST = 0.05;
const TC_SMOOTH = 0.15;
const TC_FADE = 0.35;
/** Theme level while a panel/menu is open or in express mode. */
const THEME_DIMMED = 0.6;
const BOOST_COOLDOWN = 1;
const PLANE_COOLDOWN = 20;
const ANTENNA_PERIOD = 3;
/** A one-shot whose file is still loading is dropped if it would start later than this (ms). */
const MAX_LATE_MS = 800;

const ARCADE_CENTER = centroid(INTERACTABLES.filter((i) => i.kind === "arcade").map((i) => i.position));
const point = (kind: string) => {
  const it = INTERACTABLES.find((i) => i.kind === kind);
  return { id: it?.id ?? "", x: it?.position[0] ?? 0, z: it?.position[2] ?? 0 };
};
const HANGAR = point("plane-hangar");
const SERVER = point("server-rack");
const ANTENNA = point("antenna");

interface Stream {
  el: HTMLAudioElement;
  gain: GainNode;
}

type TargetKey = "world" | "engineRate" | "engineGain" | "hum" | "arcade" | "theme";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private world: GainNode | null = null;
  private effects: GainNode | null = null;
  private ambience: GainNode | null = null;
  private music: GainNode | null = null;
  private ui: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private humGain: GainNode | null = null;
  private engineSrc: AudioBufferSourceNode | null = null;
  private theme: Stream | null = null;
  private arcade: Stream | null = null;

  private enabled = false;
  private volumes: SoundVolumes = { ...DEFAULT_VOLUMES };
  private loadStarted = false;
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly pending = new Map<string, Promise<AudioBuffer | null>>();
  private readonly lastPlayed = new Map<OneShotId, number>();
  private readonly targets: Record<TargetKey, number> = { world: -1, engineRate: -1, engineGain: -1, hum: -1, arcade: -1, theme: -1 };
  private readonly mix: EngineMix = { rate: 1, gain: 0 };

  private raf = 0;
  private suspendTimer = 0;
  private dimmed = false;
  private express = false;
  private prevBoosting = false;
  private prevTrigger: string | null = null;
  private lastBoost = -Infinity;
  private lastPlane = -Infinity;
  private nextArcadeFx = 0;
  private nextBleep = 0;
  private nextPing = 0;

  get isEnabled(): boolean {
    return this.enabled;
  }

  /** True once the browser actually lets the context play (after a user gesture). */
  get isRunning(): boolean {
    return this.ctx?.state === "running";
  }

  /** Call from a user gesture handler (click/keydown/pointerdown) so the browser allows audio. */
  enable(): void {
    if (!this.ctx) this.build();
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    window.clearTimeout(this.suspendTimer);
    this.unlock();
    if (this.enabled) return;
    this.enabled = true;
    this.master.gain.setTargetAtTime(this.volumes.master, ctx.currentTime, TC_FAST);
    if (!this.loadStarted) this.load();
    setSoundListener((id, gain) => this.play(id, gain));
    document.addEventListener("visibilitychange", this.onVisibility);
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Resumes the context and the streams (needs a gesture the first time). */
  unlock(): void {
    if (!this.ctx || document.hidden) return;
    this.ctx.resume().catch(() => {});
    this.playStreams();
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    setSoundListener(null);
    cancelAnimationFrame(this.raf);
    document.removeEventListener("visibilitychange", this.onVisibility);
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0, ctx.currentTime, TC_FAST);
    // Let the fade finish, then stop doing any work at all.
    this.suspendTimer = window.setTimeout(() => {
      if (this.enabled) return;
      this.pauseStreams();
      ctx.suspend().catch(() => {});
    }, 400);
  }

  /** Stops everything and releases the context (buffers are kept: they are context-independent). */
  dispose(): void {
    this.disable();
    window.clearTimeout(this.suspendTimer);
    if (!this.ctx) return;
    this.pauseStreams();
    for (const s of [this.theme, this.arcade]) if (s) s.el.removeAttribute("src");
    this.ctx.close().catch(() => {});
    this.ctx = this.master = this.world = this.effects = this.ambience = this.music = this.ui = null;
    this.engineGain = this.humGain = null;
    this.engineSrc = null;
    this.theme = this.arcade = null;
    this.loadStarted = false;
    this.pending.clear();
    for (const k of Object.keys(this.targets) as TargetKey[]) this.targets[k] = -1;
  }

  /** Visitor volume settings; applied with a short ramp, kept for when the context is built. */
  setVolumes(volumes: SoundVolumes): void {
    this.volumes = { ...volumes };
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    if (this.enabled) this.master?.gain.setTargetAtTime(volumes.master, now, TC_FAST);
    this.music?.gain.setTargetAtTime(volumes.music, now, TC_FAST);
    this.effects?.gain.setTargetAtTime(volumes.effects, now, TC_FAST);
    this.ambience?.gain.setTargetAtTime(volumes.ambience, now, TC_FAST);
    this.ui?.gain.setTargetAtTime(volumes.ui, now, TC_FAST);
  }

  /** Panel or menu open (ambiences fade), express mode (no world at all). */
  setScene(dimmed: boolean, express: boolean): void {
    this.dimmed = dimmed;
    this.express = express;
  }

  play(id: OneShotId, gain = 1, rate = 1): void {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || gain <= 0) return;
    const def = ONE_SHOTS[id];
    const buffer = this.buffers.get(def.src);
    if (!buffer) {
      // Still loading (first seconds after enabling): play it if it arrives quickly enough.
      const p = this.pending.get(def.src);
      if (p) {
        const t0 = performance.now();
        void p.then((b) => {
          if (b && performance.now() - t0 < MAX_LATE_MS) this.play(id, gain, rate);
        });
      }
      return;
    }
    const now = ctx.currentTime;
    const minInterval = "minInterval" in def ? def.minInterval : 0;
    if (now - (this.lastPlayed.get(id) ?? -Infinity) < minInterval) return;
    this.lastPlayed.set(id, now);
    const channel = def.channel === "ui" ? this.ui : def.channel === "effects" ? this.effects : this.ambience;
    if (!channel) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = def.gain * Math.min(gain, 1);
    src.connect(g).connect(channel);
    src.onended = () => {
      src.disconnect();
      g.disconnect();
    };
    src.start();
  }

  private build(): void {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;
    const gain = (to: AudioNode, value: number) => {
      const g = ctx.createGain();
      g.gain.value = value;
      g.connect(to);
      return g;
    };
    this.master = gain(ctx.destination, 0);
    const v = this.volumes;
    this.music = gain(this.master, v.music);
    this.world = gain(this.master, 1);
    this.effects = gain(this.world, v.effects);
    this.ambience = gain(this.world, v.ambience);
    this.ui = gain(this.master, v.ui);
    this.engineGain = gain(this.effects, 0);
    this.humGain = gain(this.ambience, 0);
    // Elements are created (and played) inside the gesture: iOS requires it.
    this.theme = this.stream(STREAMS.theme.src, this.music);
    this.arcade = this.stream(STREAMS.arcade.src, this.ambience);
  }

  private stream(src: string, to: AudioNode): Stream | null {
    const ctx = this.ctx;
    if (!ctx) return null;
    const el = new Audio(src);
    el.loop = true;
    el.preload = "auto";
    const g = ctx.createGain();
    g.gain.value = 0;
    ctx.createMediaElementSource(el).connect(g).connect(to);
    return { el, gain: g };
  }

  private playStreams(): void {
    for (const s of [this.theme, this.arcade]) if (s && s.el.paused) s.el.play().catch(() => {});
  }

  private pauseStreams(): void {
    for (const s of [this.theme, this.arcade]) s?.el.pause();
  }

  private fetchBuffer(src: string): Promise<AudioBuffer | null> {
    const existing = this.pending.get(src);
    if (existing) return existing;
    const cached = this.buffers.get(src);
    if (cached) return Promise.resolve(cached);
    const ctx = this.ctx;
    const p = ctx
      ? fetch(src)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status} ${src}`))))
          .then((data) => ctx.decodeAudioData(data))
          .then((b) => {
            this.buffers.set(src, b);
            return b;
          })
          .catch((err: unknown) => {
            console.warn("[audio] could not load", src, err);
            return null;
          })
      : Promise.resolve(null);
    this.pending.set(src, p);
    return p;
  }

  private load(): void {
    this.loadStarted = true;
    // UI first (the toggle click itself), then the engine, then the rest.
    for (const id of ["ui-toggle", "ui-open", "ui-close", "ui-click"] as const) void this.fetchBuffer(ONE_SHOTS[id].src);
    void this.fetchBuffer(LOOPS.engine.src).then((b) => {
      if (b) this.engineSrc = this.startLoop(b, this.engineGain);
    });
    void this.fetchBuffer(LOOPS.serverHum.src).then((b) => {
      if (b) this.startLoop(b, this.humGain);
    });
    for (const def of Object.values(ONE_SHOTS)) void this.fetchBuffer(def.src);
  }

  private startLoop(buffer: AudioBuffer, to: GainNode | null): AudioBufferSourceNode | null {
    const ctx = this.ctx;
    if (!ctx || !to) return null;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(to);
    src.start();
    return src;
  }

  private onVisibility = (): void => {
    if (!this.ctx || !this.enabled) return;
    if (document.hidden) {
      this.pauseStreams();
      this.ctx.suspend().catch(() => {});
    } else {
      this.unlock();
    }
  };

  /** Ramps a param towards `value` only when the target actually changed (no automation spam). */
  private target(key: TargetKey, param: AudioParam, value: number, now: number, tc: number): void {
    if (Math.abs(this.targets[key] - value) < 1e-3) return;
    this.targets[key] = value;
    param.setTargetAtTime(value, now, tc);
  }

  private tick = (): void => {
    this.raf = requestAnimationFrame(this.tick);
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running" || !this.world || !this.engineGain || !this.humGain) return;
    const now = ctx.currentTime;
    const state = useGameStore.getState();
    const pose = state.pose;
    const worldOn = !this.dimmed && !this.express;

    this.target("world", this.world.gain, worldOn ? 1 : 0, now, TC_FADE);

    // Engine: pitch and level follow the speed.
    engineMix(pose.speed, pose.boosting, CONFIG.car.maxSpeed, CONFIG.car.boostSpeed, this.mix);
    if (this.engineSrc) this.target("engineRate", this.engineSrc.playbackRate, this.mix.rate, now, TC_SMOOTH);
    this.target("engineGain", this.engineGain.gain, LOOPS.engine.gain * this.mix.gain, now, TC_SMOOTH);

    // Boost: rising edge only.
    if (pose.boosting && !this.prevBoosting && worldOn && cooledDown(now, this.lastBoost, BOOST_COOLDOWN)) {
      this.lastBoost = now;
      this.play("boost");
    }
    this.prevBoosting = pose.boosting;

    // Plane take-off when the car enters the hangar trigger.
    const trigger = state.activeTriggerId;
    if (trigger !== this.prevTrigger) {
      if (trigger === HANGAR.id && worldOn && cooledDown(now, this.lastPlane, PLANE_COOLDOWN)) {
        this.lastPlane = now;
        this.play("plane");
      }
      this.prevTrigger = trigger;
    }

    // Proximity ambiences.
    const arcadeP = proximityGain(distance2D(pose.x, pose.z, ARCADE_CENTER.x, ARCADE_CENTER.z), PROXIMITY.arcade.inner, PROXIMITY.arcade.outer);
    const serverP = proximityGain(distance2D(pose.x, pose.z, SERVER.x, SERVER.z), PROXIMITY.serverRack.inner, PROXIMITY.serverRack.outer);
    const antennaP = proximityGain(distance2D(pose.x, pose.z, ANTENNA.x, ANTENNA.z), PROXIMITY.antenna.inner, PROXIMITY.antenna.outer);
    if (this.arcade) this.target("arcade", this.arcade.gain.gain, STREAMS.arcade.gain * arcadeP, now, TC_SMOOTH);
    this.target("hum", this.humGain.gain, LOOPS.serverHum.gain * serverP, now, TC_SMOOTH);
    if (this.theme) {
      const duck = themeDuck(worldOn ? arcadeP : 0);
      this.target("theme", this.theme.gain.gain, STREAMS.theme.gain * duck * (worldOn ? 1 : THEME_DIMMED), now, TC_FADE);
    }

    if (!worldOn) return;
    if (now >= this.nextArcadeFx) {
      if (arcadeP > 0.05) this.play(ARCADE_FX[Math.floor(Math.random() * ARCADE_FX.length)]!, arcadeP);
      this.nextArcadeFx = now + scaledInterval(3, 9, arcadeP, Math.random());
    }
    if (now >= this.nextBleep) {
      if (serverP > 0.05) this.play(SERVER_BLEEPS[Math.floor(Math.random() * SERVER_BLEEPS.length)]!, serverP);
      this.nextBleep = now + scaledInterval(0.6, 2.5, serverP, Math.random());
    }
    if (now >= this.nextPing) {
      if (antennaP > 0.1) this.play("antenna-ping", antennaP);
      this.nextPing = now + ANTENNA_PERIOD * (0.9 + 0.2 * Math.random());
    }
  };
}

/** The app-wide engine. Creating it costs nothing: no AudioContext until enable(). */
export const audio = new AudioEngine();
