/**
 * @fileoverview Canvas content of the neon diorama: sky, lights, world, car, camera,
 * trigger detection and post-processing (high tier only).
 */
import { Suspense, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { CONFIG, INTERACTABLES, type Interactable } from "../../config";
import type { Language } from "../../i18n";
import { detectTrigger } from "../../lib/triggers";
import { useGameStore } from "../../store/gameStore";
import { Car } from "./Car";
import { CameraRig } from "./CameraRig";
import { Ground } from "./Ground";
import { Landmarks } from "./Landmarks";
import { SkillBlocks } from "./SkillBlocks";

interface SceneProps {
  language: Language;
  /** Called when a landmark is clicked / tapped. */
  onInteract: (it: Interactable) => void;
  /** Fired once Landmarks / SkillBlocks (troika fonts, screenshot textures) have all resolved. */
  onReady: () => void;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

/** Writes the active trigger into the store (only notifies on change). */
function TriggerSystem() {
  useFrame(() => {
    const { pose, setActiveTrigger } = useGameStore.getState();
    setActiveTrigger(detectTrigger(pose.x, pose.z, INTERACTABLES));
  });
  return null;
}

/** Dev only: exposes the renderer for perf measurement and ?q=low|high for the tier. */
function DevProbe() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __gl?: unknown; __game?: unknown };
    w.__gl = gl;
    w.__game = useGameStore;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q === "low" || q === "high") useGameStore.getState().setQualityMode(q);
  }, [gl]);
  return null;
}

export function Scene({ language, onInteract, onReady }: SceneProps) {
  const quality = useGameStore((s) => s.quality);
  const setAutoQuality = useGameStore((s) => s.setAutoQuality);

  return (
    <>
      <color attach="background" args={[CONFIG.colors.night]} />
      <fog attach="fog" args={[CONFIG.colors.night, 70, 240]} />

      {/* One moon + faint fill; static scenery is baked and ignores lights */}
      <ambientLight intensity={0.8} color={CONFIG.colors.text} />
      <directionalLight position={[-40, 60, -30]} intensity={1.3} color={CONFIG.colors.text} />

      <PerformanceMonitor flipflops={3} onDecline={() => setAutoQuality("low")} onIncline={() => setAutoQuality("high")} onFallback={() => setAutoQuality("low")} />
      <DevProbe />
      <TriggerSystem />
      <CameraRig />

      <Ground />
      <Suspense fallback={null}>
        <Landmarks onActivate={onInteract} language={language} />
        <SkillBlocks language={language} />
        {/* Commits only when nothing above suspends any more. */}
        <ReadySignal onReady={onReady} />
      </Suspense>
      <Car />

      {quality === "high" && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={0.6} luminanceSmoothing={0.05} intensity={0.85} radius={0.6} />
          <ToneMapping mode={ToneMappingMode.AGX} />
        </EffectComposer>
      )}
    </>
  );
}
