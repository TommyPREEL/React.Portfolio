/**
 * @fileoverview Shared TypeScript types and interfaces
 * Central type definitions for the portfolio application
 */

import type * as THREE from "three";
import type { Language } from "../i18n";

// =====================================================
// GLOBAL DECLARATIONS
// =====================================================

declare global {
  interface Window {
    keys: Record<string, boolean | number>;
  }
}

// =====================================================
// COMPONENT PROPS
// =====================================================

export interface ZoneData {
  id: string;
  position: [number, number, number];
  label: string;
  icon: string;
}

export interface MinimapProps {
  carPosition: THREE.Vector3;
  activeZone: string | null;
  onZoneClick: (zoneId: string) => void;
}

export interface IntroModalProps {
  onClose: () => void;
  language: Language;
}

export interface SettingsPanelProps {
  onOpenEscapeMenu: () => void;
}

export interface EscapeMenuProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  carPosition: THREE.Vector3;
  activeZone: string | null;
  onClose: () => void;
  onZoneClick: (zoneId: string) => void;
  initialTab?: "home" | "controls" | "settings" | "map";
}

export interface PortfolioTitleProps {
  title?: string;
}
