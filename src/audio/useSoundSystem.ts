/**
 * @fileoverview React wiring of the AudioEngine: on/off preference (localStorage), gesture
 * unlock for a saved "on", panel/menu fades and open/close sounds. No audio work while off.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { readSoundPref, readVolumes, saveSoundPref, saveVolumes, type SoundVolumes } from "../lib/soundPref";
import { audio } from "./AudioEngine";
import { emitSound } from "./bus";

export interface SoundScene {
  /** A content panel is open. */
  panelOpen: boolean;
  /** The escape menu is open. */
  menuOpen: boolean;
  express: boolean;
}

export function useSoundSystem({ panelOpen, menuOpen, express }: SoundScene) {
  const [soundOn, setSoundOn] = useState(readSoundPref);
  const [volumes, setVolumesState] = useState<SoundVolumes>(readVolumes);

  // The engine always holds the current settings (applied when its context gets built).
  useEffect(() => {
    audio.setVolumes(volumes);
  }, [volumes]);

  const setVolume = useCallback((channel: keyof SoundVolumes, value: number) => {
    setVolumesState((prev) => {
      const next = { ...prev, [channel]: Math.min(1, Math.max(0, value)) };
      saveVolumes(next);
      return next;
    });
  }, []);

  // Must run inside the click handler: browsers only allow audio after a user gesture.
  const toggleSound = useCallback(() => {
    const next = !audio.isEnabled;
    setSoundOn(next);
    saveSoundPref(next);
    if (next) {
      audio.enable();
      audio.play("ui-toggle");
    } else {
      audio.disable();
    }
  }, []);

  // Saved as "on": start on the first gesture (a page load alone may not play audio).
  useEffect(() => {
    if (!soundOn) return;
    const onGesture = (e: Event) => {
      // A first click on the sound toggle itself is the user switching sound off:
      // starting audio here would make that click turn it off right after.
      if (e.target instanceof Element && e.target.closest("[data-sound-toggle]")) return;
      audio.enable();
      if (audio.isRunning) remove();
    };
    const remove = () => {
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
    };
    window.addEventListener("pointerdown", onGesture, true);
    window.addEventListener("keydown", onGesture, true);
    return () => {
      remove();
      audio.disable();
    };
  }, [soundOn]);

  useEffect(() => () => audio.dispose(), []);

  useEffect(() => {
    audio.setScene(panelOpen || menuOpen, express);
  }, [panelOpen, menuOpen, express]);

  // Open/close sounds on transitions only (not on first render).
  const prev = useRef({ panelOpen, menuOpen });
  useEffect(() => {
    const p = prev.current;
    if (panelOpen !== p.panelOpen) emitSound(panelOpen ? "ui-open" : "ui-close");
    else if (menuOpen !== p.menuOpen) emitSound(menuOpen ? "ui-open" : "ui-close");
    prev.current = { panelOpen, menuOpen };
  }, [panelOpen, menuOpen]);

  return { soundOn, toggleSound, volumes, setVolume };
}
