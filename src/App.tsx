/**
 * @fileoverview Main Application Component
 * 3D Portfolio with interactive car navigation
 * 
 * @description
 * Tech stack:
 * - React 19
 * - @react-three/fiber & drei
 * - Three.js
 * 
 * Features:
 * - Smooth car physics with rotation
 * - Interactive zones with neon styling
 * - Professional lighting setup
 * - Responsive camera following
 */

import { useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

// Config & Types
import { getContent, type Language } from "./i18n";
import { ZONES } from "./config";
import "./types"; // Import global type declarations

// Hooks
import { useKeyboardControls, useEnterKey, useEscapeKey } from "./hooks/useKeyboardControls";
import { isHWAccelEnabled } from "./utils/detectHWAccel";

// 3D Components
import { World } from "./components/3d";

// UI Components
import { Minimap, IntroModal, HWAccelWarning, MobileControls, PortfolioTitle, SettingsPanel, EscapeMenu } from "./components/ui";
import ContentPanel from "./components/ContentPanel";

// Styles
import "./App.css";

/**
 * App - Main application component
 * Manages global state and renders 3D world with UI overlays
 */
export default function App() {
  // Application state
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [carPosition, setCarPosition] = useState(new THREE.Vector3(-30, 0.25, 2.5));
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showHWAccelWarning, setShowHWAccelWarning] = useState(false);

  // Detect touch device (pointer: coarse = touchscreen)
  const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleIntroClose = () => {
    setShowIntro(false);
    if (!isHWAccelEnabled()) {
      setShowHWAccelWarning(true);
    }
  };
  const [showEscapeMenu, setShowEscapeMenu] = useState(false);
  const [escapeMenuTab, setEscapeMenuTab] = useState<"home" | "controls" | "settings" | "map">("home");
  const [teleportTarget, setTeleportTarget] = useState<THREE.Vector3 | null>(null);

  // Get content for current language
  const content = getContent(language);

  // Language toggle handler
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "fr" : "en"));
  };

  // Teleport to a zone by id
  const handleZoneClick = useCallback((zoneId: string) => {
    const zone = ZONES.find((z) => z.id === zoneId);
    if (zone) {
      // Place car slightly in front of the zone (offset Z so it enters the zone)
      setTeleportTarget(new THREE.Vector3(zone.position[0], 0, zone.position[2] + 4));
    }
  }, []);

  // Set up keyboard controls
  useKeyboardControls();
  
  // Handle Enter key for zone interaction
  useEnterKey(activeZone, activeSection, (zone) => {
    setActiveSection(zone);
  });

  // Handle Escape key to close popups or open escape menu
  useEscapeKey(() => {
    if (activeSection) {
      setActiveSection(null);
    } else if (showIntro) {
      setShowIntro(false);
    } else if (showEscapeMenu) {
      setShowEscapeMenu(false);
    } else {
      setEscapeMenuTab("home");
      setShowEscapeMenu(true);
    }
  });

  // Handle M key to open map tab in escape menu
  useEffect(() => {
    const handleMKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m" && !activeSection && !showIntro) {
        if (showEscapeMenu) {
          setShowEscapeMenu(false);
        } else {
          setEscapeMenuTab("map");
          setShowEscapeMenu(true);
        }
      }
    };
    window.addEventListener("keydown", handleMKey);
    return () => window.removeEventListener("keydown", handleMKey);
  }, [activeSection, showIntro, showEscapeMenu]);

  return (
    <div className="app">
      {/* Portfolio Title */}
      <PortfolioTitle />

      {/* Minimap */}
      <Minimap carPosition={carPosition} activeZone={activeZone} onZoneClick={handleZoneClick} />

      {/* Settings button */}
      <SettingsPanel onOpenEscapeMenu={() => { setEscapeMenuTab("settings"); setShowEscapeMenu(true); }} />

      {/* Introduction Modal */}
      {showIntro && (
        <IntroModal
          onClose={handleIntroClose}
          language={language}
        />
      )}

      {/* Hardware Acceleration Warning */}
      {showHWAccelWarning && (
        <HWAccelWarning onClose={() => setShowHWAccelWarning(false)} language={language} />
      )}

      {/* Escape Menu */}
      {showEscapeMenu && (
        <EscapeMenu
          language={language}
          onLanguageChange={setLanguage}
          carPosition={carPosition}
          activeZone={activeZone}
          onClose={() => setShowEscapeMenu(false)}
          onZoneClick={handleZoneClick}
          initialTab={escapeMenuTab}
        />
      )}

      {/* 3D Canvas Container */}
      <div className="canvas-container">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true }}
          camera={{ position: [0, 10, 8], fov: 50 }}
          className="canvas"
        >
          {/* Lighting setup */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[20, 30, 20]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={1}
            shadow-camera-far={100}
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          <pointLight position={[0, 15, 0]} intensity={0.4} />

          {/* Fog for depth - dark blue */}
          <fog attach="fog" args={["#0c1929", 40, 180]} />

          {/* Main world */}
          <World
            onZoneEnter={setActiveSection}
            carPosition={carPosition}
            onCarMove={(pos) => setCarPosition(pos)}
            activeZone={activeZone}
            setActiveZone={setActiveZone}
            language={language}
            onLanguageToggle={toggleLanguage}
            activeSection={activeSection}
            onCloseSection={() => setActiveSection(null)}
            teleportTarget={teleportTarget}
            onTeleportComplete={() => setTeleportTarget(null)}
          />
        </Canvas>
      </div>

      {/* Mobile joystick controls — only rendered on touch devices */}
      {isMobile && !activeSection && !showIntro && (
        <MobileControls
          activeZone={activeZone}
          onZoneEnter={(zone) => setActiveSection(zone)}
        />
      )}

      {/* Modal Backdrop */}
      {activeSection && (
        <div 
          className="modal-backdrop"
          onClick={() => setActiveSection(null)}
        />
      )}

      {/* Content Panel Modal */}
      {activeSection && (
        <div className="modal-wrapper">
          <ContentPanel
            section={activeSection}
            content={content}
            onBack={() => setActiveSection(null)}
          />
        </div>
      )}
    </div>
  );
}
