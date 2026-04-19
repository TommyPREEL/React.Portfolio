/**
 * @fileoverview Hardware Acceleration Warning modal
 * Shown once after the intro modal to advise the user to enable
 * hardware acceleration for optimal WebGL / Three.js performance.
 */

import type { Language } from "../../i18n";
import { getContent } from "../../i18n";
import styles from "./HWAccelWarning.module.css";

interface HWAccelWarningProps {
  onClose: () => void;
  language: Language;
}

export function HWAccelWarning({ onClose, language }: HWAccelWarningProps) {
  const { hwAccelWarning } = getContent(language).ui;

  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon}>⚡</span>
      <p className={styles.text}>
        <strong>{hwAccelWarning.title} — </strong>
        {hwAccelWarning.description}
      </p>
      <button className={styles.closeButton} onClick={onClose}>
        {hwAccelWarning.dismissButton}
      </button>
    </div>
  );
}
