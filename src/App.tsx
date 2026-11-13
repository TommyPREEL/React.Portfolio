/**
 * @fileoverview App shell: routing (world / express / deep links), language,
 * overlays, and the lazily loaded 3D canvas.
 */

import { lazy, Suspense, useState, useCallback, useEffect } from "react";

import { getContent, type Language } from "./i18n";
import { INTERACTABLES, ZONES, approachPoint, getInteractable, type Interactable } from "./config";
import "./types";

import { useKeyboardControls, useEnterKey, useEscapeKey } from "./hooks/useKeyboardControls";
import { useThrottledCarPosition } from "./hooks/useCarPosition";
import { useGameStore } from "./store/gameStore";
import { isHWAccelEnabled } from "./utils/detectHWAccel";
import { parseRoute, routeToPath, type Route, type Section } from "./lib/route";
import { pickLanguage, readSavedLanguage, saveLanguage } from "./lib/language";

import {
  Minimap,
  IntroModal,
  HWAccelWarning,
  MobileControls,
  PortfolioTitle,
  SettingsPanel,
  EscapeMenu,
  LoadingScreen,
  InteractionPrompt,
  ExpressView,
  SoundToggle,
} from "./components/ui";
import ContentPanel from "./components/ContentPanel";
import { CanvasErrorBoundary } from "./components/CanvasErrorBoundary";

import "./App.css";

// three.js, R3F, drei and post-processing live in their own chunk.
const GameCanvas = lazy(() => import("./components/3d/GameCanvas"));

const PROJECT_IDS = getContent("en").projects.items.map((p) => p.id);
const initialRoute = (): Route => parseRoute(window.location.pathname, PROJECT_IDS);

export default function App() {
  const [route] = useState(initialRoute);
  const [isExpress, setIsExpress] = useState(route.mode === "express");
  const [activeSection, setActiveSection] = useState<Section | null>(route.mode === "world" ? route.section : null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(route.mode === "world" ? route.projectId : null);
  const [language, setLanguageState] = useState<Language>(() =>
    pickLanguage(readSavedLanguage(), typeof navigator !== "undefined" ? navigator.languages : []),
  );
  // A deep link goes straight to its content: no intro wall.
  const [showIntro, setShowIntro] = useState(route.mode === "world" && route.section === null);
  // Deep links skip the intro, so they run the GPU check immediately.
  const [showHWAccelWarning, setShowHWAccelWarning] = useState(
    () => route.mode === "world" && route.section !== null && !isHWAccelEnabled(),
  );
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  // Sound engine comes later; the toggle exists now, muted by default (art direction).
  const [soundOn, setSoundOn] = useState(false);
  const [showEscapeMenu, setShowEscapeMenu] = useState(false);
  const [escapeMenuTab, setEscapeMenuTab] = useState<"home" | "controls" | "settings" | "map">("home");
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaderActive, setLoaderActive] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  // Car pose lives in the store (written in useFrame); the UI only sees a ~8 Hz copy.
  const carPosition = useThrottledCarPosition(8);
  const activeTriggerId = useGameStore((s) => s.activeTriggerId);
  const qualityMode = useGameStore((s) => s.qualityMode);
  const setQualityMode = useGameStore((s) => s.setQualityMode);
  const activeInteractable = activeTriggerId ? getInteractable(activeTriggerId) : undefined;
  const activeZone = activeInteractable?.section ?? null;

  const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const content = getContent(language);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Keep the address bar in sync so sections can be shared as links.
  useEffect(() => {
    const next = routeToPath(
      isExpress ? { mode: "express" } : { mode: "world", section: activeSection, projectId: activeProjectId },
    );
    if (window.location.pathname !== next) window.history.replaceState(null, "", next);
  }, [isExpress, activeSection, activeProjectId]);

  const checkHWAccel = useCallback(() => {
    if (!isHWAccelEnabled()) setShowHWAccelWarning(true);
  }, []);

  const handleIntroClose = () => {
    setShowIntro(false);
    checkHWAccel();
  };

  const openExpress = useCallback(() => {
    setShowIntro(false);
    setShowEscapeMenu(false);
    setIsExpress(true);
    // A real history entry, so the browser Back button returns to the world.
    window.history.pushState(null, "", "/express");
  }, []);

  // Back/forward: re-apply whatever the URL now says.
  useEffect(() => {
    const onPopState = () => {
      const r = parseRoute(window.location.pathname, PROJECT_IDS);
      setIsExpress(r.mode === "express");
      setActiveSection(r.mode === "world" ? r.section : null);
      setActiveProjectId(r.mode === "world" ? r.projectId : null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openInteractable = useCallback((it: Interactable) => {
    setActiveProjectId(it.projectId ?? null);
    setActiveSection(it.section);
  }, []);

  const closeSection = useCallback(() => {
    setActiveSection(null);
    setActiveProjectId(null);
  }, []);

  // Teleport (minimap / menu) to the landmark closest to the zone marker
  const handleZoneClick = useCallback((zoneId: string) => {
    const zone = ZONES.find((z) => z.id === zoneId);
    if (!zone) return;
    let best: Interactable | undefined;
    let bd = Infinity;
    for (const it of INTERACTABLES) {
      if (it.section !== zoneId) continue;
      const d = Math.hypot(it.position[0] - zone.position[0], it.position[2] - zone.position[2]);
      if (d < bd) {
        bd = d;
        best = it;
      }
    }
    if (!best) return;
    const { x, z } = approachPoint(best);
    useGameStore.getState().requestTeleport(x, z);
  }, []);

  const handleProgress = useCallback((progress: number, active: boolean) => {
    setLoadProgress(progress);
    setLoaderActive(active);
  }, []);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const sceneLoaded = sceneReady && !loaderActive;

  // After 12 s without a scene, push the express version forward on the loading screen.
  useEffect(() => {
    if (sceneLoaded || isExpress) return;
    const t = window.setTimeout(() => setLoadTimedOut(true), 12000);
    return () => window.clearTimeout(t);
  }, [sceneLoaded, isExpress]);

  // The car stops answering to input while a panel or menu is open
  useEffect(() => {
    useGameStore.getState().setInputLocked(!!activeSection || showEscapeMenu || isExpress);
  }, [activeSection, showEscapeMenu, isExpress]);

  useKeyboardControls();

  useEnterKey(isExpress || showEscapeMenu ? null : activeTriggerId, activeSection, (id) => {
    const it = getInteractable(id);
    if (it) openInteractable(it);
  });

  useEscapeKey(() => {
    if (isExpress) return; // ExpressView handles its own navigation
    if (activeSection) closeSection();
    else if (showIntro) handleIntroClose();
    else if (showEscapeMenu) setShowEscapeMenu(false);
    else {
      setEscapeMenuTab("home");
      setShowEscapeMenu(true);
    }
  });

  // M opens the map tab
  useEffect(() => {
    const handleMKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "m" || isExpress || activeSection || showIntro) return;
      if (showEscapeMenu) setShowEscapeMenu(false);
      else {
        setEscapeMenuTab("map");
        setShowEscapeMenu(true);
      }
    };
    window.addEventListener("keydown", handleMKey);
    return () => window.removeEventListener("keydown", handleMKey);
  }, [isExpress, activeSection, showIntro, showEscapeMenu]);

  if (isExpress) {
    return (
      <ExpressView
        content={content}
        language={language}
        onLanguageChange={setLanguage}
        onBackTo3D={() => setIsExpress(false)}
      />
    );
  }

  const promptLabel = activeInteractable
    ? (content.projects.items.find((p) => p.id === activeInteractable.projectId)?.name ??
      content.navigation[activeInteractable.section])
    : null;
  const showPrompt = !!promptLabel && !activeSection && !showIntro && !showEscapeMenu;

  return (
    <div className="app">
      <LoadingScreen
        progress={loadProgress}
        done={sceneLoaded}
        language={language}
        onExpress={openExpress}
        timedOut={loadTimedOut}
      />

      <PortfolioTitle />

      <Minimap carPosition={carPosition} activeZone={activeZone} onZoneClick={handleZoneClick} language={language} />

      <SettingsPanel
        language={language}
        onExpress={openExpress}
        onOpenEscapeMenu={() => {
          setEscapeMenuTab("settings");
          setShowEscapeMenu(true);
        }}
      >
        <SoundToggle enabled={soundOn} onToggle={() => setSoundOn((v) => !v)} language={language} />
      </SettingsPanel>

      {showIntro && <IntroModal onClose={handleIntroClose} language={language} onExpress={openExpress} />}

      {showHWAccelWarning && <HWAccelWarning onClose={() => setShowHWAccelWarning(false)} language={language} onExpress={openExpress} />}

      {showEscapeMenu && (
        <EscapeMenu
          language={language}
          onLanguageChange={setLanguage}
          carPosition={carPosition}
          activeZone={activeZone}
          onClose={() => setShowEscapeMenu(false)}
          onZoneClick={handleZoneClick}
          initialTab={escapeMenuTab}
          quality={qualityMode}
          onQualityChange={setQualityMode}
        />
      )}

      <div className="canvas-container">
        <CanvasErrorBoundary onError={openExpress}>
          <Suspense fallback={null}>
            <GameCanvas
              language={language}
              onInteract={openInteractable}
              onProgress={handleProgress}
              onReady={handleSceneReady}
            />
          </Suspense>
        </CanvasErrorBoundary>
      </div>

      {showPrompt && activeInteractable && (
        <InteractionPrompt
          label={promptLabel}
          isTouch={isMobile}
          language={language}
          onActivate={() => openInteractable(activeInteractable)}
        />
      )}

      {isMobile && !activeSection && !showIntro && <MobileControls language={language} />}

      {activeSection && <div className="modal-backdrop" onClick={closeSection} />}

      {activeSection && (
        <div className="modal-wrapper">
          <ContentPanel
            section={activeSection}
            content={content}
            onBack={closeSection}
            focusProjectId={activeProjectId}
          />
        </div>
      )}
    </div>
  );
}
