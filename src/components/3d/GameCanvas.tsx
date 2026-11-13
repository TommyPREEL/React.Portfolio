/**
 * @fileoverview WebGL canvas + scene, loaded lazily by App so express mode
 * and the loading screen never wait for three.js / R3F / post-processing.
 * Memoised, with every Canvas prop hoisted to a module constant, so App's
 * throttled re-renders never reach the Canvas.
 */

import { Suspense, memo, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, type RootState } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import { CONFIG, type Interactable } from "../../config";
import { useGameStore } from "../../store/gameStore";
import type { Language } from "../../i18n";
import { Scene } from "./Scene";

interface GameCanvasProps {
  language: Language;
  onInteract: (it: Interactable) => void;
  /** Loader progress 0..100 and whether the scene is still loading (loaders, fonts, textures). */
  onProgress: (progress: number, active: boolean) => void;
  /** Fired once the scene tree (including fonts and textures) has committed. */
  onReady: () => void;
}

const DPR_LOW: [number, number] = [1, 1.5];
const DPR_HIGH: [number, number] = [1, 2];
const GL = { antialias: true, powerPreference: "high-performance" } as const;
const CAMERA = { position: [0, 21, 17] as [number, number, number], fov: CONFIG.camera.fov, near: 0.5, far: 400 };
const onCreated = ({ gl }: RootState) => {
  gl.toneMapping = THREE.AgXToneMapping;
};

/**
 * Textures/models go through DefaultLoadingManager (useProgress); troika fonts do not,
 * so until the scene signals ready we never report "done": progress is capped at 95
 * and active stays true.
 */
function ProgressReporter({ ready, onProgress }: { ready: boolean; onProgress: GameCanvasProps["onProgress"] }) {
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  }, [onProgress]);
  // Imperative subscription: loaders update the store while Suspense children render, which
  // would trigger React's "setState while rendering another component" warning via the hook.
  useEffect(() => {
    const report = (s: { progress: number; active: boolean }) => cb.current(ready ? 100 : Math.min(s.progress, 95), ready ? s.active : true);
    report(useProgress.getState());
    return useProgress.subscribe(report);
  }, [ready]);
  return null;
}

function GameCanvas({ language, onInteract, onProgress, onReady }: GameCanvasProps) {
  const lowQuality = useGameStore((s) => s.quality === "low");
  const [ready, setReady] = useState(false);
  const readyCb = useRef(onReady);
  useEffect(() => {
    readyCb.current = onReady;
  }, [onReady]);
  const handleReady = useCallback(() => {
    setReady(true);
    readyCb.current();
  }, []);
  return (
    <Canvas dpr={lowQuality ? DPR_LOW : DPR_HIGH} gl={GL} camera={CAMERA} onCreated={onCreated} className="canvas">
      <ProgressReporter ready={ready} onProgress={onProgress} />
      <Suspense fallback={null}>
        <Scene language={language} onInteract={onInteract} onReady={handleReady} />
      </Suspense>
    </Canvas>
  );
}

export default memo(GameCanvas);
