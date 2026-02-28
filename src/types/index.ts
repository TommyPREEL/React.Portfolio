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
    keys: Record<string, boolean>;
  }
}

// =====================================================
// COMPONENT PROPS
// =====================================================

export interface CarProps {
  position: THREE.Vector3;
  onMove: (position: THREE.Vector3, rotation: number) => void;
  isDisabled: boolean;
}

export interface ZoneData {
  id: string;
  position: [number, number, number];
  label: string;
  icon: string;
}

export interface ZoneProps {
  position: [number, number, number];
  label: string;
  icon: string;
  onEnter: () => void;
  isActive: boolean;
  pressEnterText: string;
}

export interface WorldProps {
  onZoneEnter: (section: string) => void;
  carPosition: THREE.Vector3;
  onCarMove: (position: THREE.Vector3, rotation: number) => void;
  activeZone: string | null;
  setActiveZone: (zone: string | null) => void;
  language: Language;
  onLanguageToggle: () => void;
  activeSection: string | null;
  onCloseSection: () => void;
}

export interface ThreeDUIProps {
  language: Language;
  onLanguageToggle: () => void;
  activeSection: string | null;
  onClose: () => void;
  carPosition: THREE.Vector3;
}

export interface MinimapProps {
  carPosition: THREE.Vector3;
  activeZone: string | null;
}

export interface IntroModalProps {
  onClose: () => void;
  language: Language;
}

export interface SettingsPanelProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export interface PortfolioTitleProps {
  title?: string;
}
