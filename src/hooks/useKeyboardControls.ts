/**
 * @fileoverview Keyboard controls hook for car movement
 * Handles WASD/ZQSD controls and boost activation
 */

import { useEffect } from "react";

// Initialize global keys object
if (typeof window !== "undefined") {
  window.keys = {};
}

/**
 * Hook to set up keyboard event listeners for car controls
 * Supports WASD (QWERTY) and ZQSD (AZERTY) layouts
 */
export function useKeyboardControls(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "z") window.keys.forward = true;
      if (key === "s") window.keys.backward = true;
      if (key === "a" || key === "q") window.keys.left = true;
      if (key === "d") window.keys.right = true;
      if (key === "enter") window.keys.enter = true;
      if (key === "shift") window.keys.boost = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "z") window.keys.forward = false;
      if (key === "s") window.keys.backward = false;
      if (key === "a" || key === "q") window.keys.left = false;
      if (key === "d") window.keys.right = false;
      if (key === "enter") window.keys.enter = false;
      if (key === "shift") window.keys.boost = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
}

/**
 * Hook to handle Enter key for zone interaction
 */
export function useEnterKey(
  activeZone: string | null,
  activeSection: string | null,
  onEnter: (zone: string) => void
): void {
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat || !activeZone || activeSection) return;
      // Enter on a focused control belongs to that control (link, button, field).
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button, input, select, textarea, [role='button'], [role='tab']")) return;
      // Without this, the dialog focuses its close button during this keydown and the
      // browser's default Enter action then "clicks" it, closing the panel instantly.
      e.preventDefault();
      onEnter(activeZone);
    };

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [activeZone, activeSection, onEnter]);
}

/**
 * Hook to handle Escape key for closing modals/popups
 */
export function useEscapeKey(onEscape: () => void): void {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onEscape]);
}
