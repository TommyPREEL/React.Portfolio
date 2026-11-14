/**
 * @fileoverview Permanent HUD sound toggle (muted by default). The engine is wired by the app.
 */

import type { Language } from "../../i18n";
import { getContent } from "../../i18n";
import { SoundOnIcon, SoundOffIcon } from "./icons";
import styles from "./SoundToggle.module.css";

export interface SoundToggleProps {
  /** Current state; defaults to false (muted). */
  enabled?: boolean;
  onToggle?: () => void;
  language?: Language;
}

export function SoundToggle({ enabled = false, onToggle, language = "en" }: SoundToggleProps) {
  const { settings } = getContent(language).ui;
  const label = enabled ? settings.soundOn : settings.soundOff;
  return (
    <button
      type="button"
      className={styles.toggle}
      data-sound-toggle=""
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={settings.soundLabel + ": " + label}
      title={label}
    >
      {enabled ? <SoundOnIcon size={24} /> : <SoundOffIcon size={24} />}
    </button>
  );
}
