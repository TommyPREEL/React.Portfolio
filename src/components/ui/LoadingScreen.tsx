/**
 * @fileoverview Full-screen loading screen for the 3D scene.
 * Stays mounted and fades out when `done` is true (opacity transition only).
 */

import type { Language } from "../../i18n";
import { getContent } from "../../i18n";
import styles from "./LoadingScreen.module.css";

export interface LoadingScreenProps {
  /** Loading progress from 0 to 100 (values outside are clamped). */
  progress: number;
  /** When true the screen fades out and stops intercepting input. */
  done: boolean;
  language: Language;
  /** When provided, a visible "Express version" link is shown. */
  onExpress?: () => void;
  /** When true, shows the "3D is taking long" message emphasising the Express link. */
  timedOut?: boolean;
}

export function LoadingScreen({ progress, done, language, onExpress, timedOut = false }: LoadingScreenProps) {
  const { profile, ui } = getContent(language);
  const value = Math.round(Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0)));

  return (
    <div className={styles.screen + (done ? " " + styles.done : "")} aria-hidden={done ? "true" : undefined}>
      <div className={styles.inner}>
        <p className={styles.name}>{profile.name}</p>
        <h2 className={styles.title}>{ui.loading.title}</h2>
        <div
          className={styles.bar}
          role="progressbar"
          aria-label={ui.loading.title}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        >
          <div className={styles.fill} style={{ transform: "scaleX(" + value / 100 + ")" }} />
        </div>
        <p className={styles.hint}>
          <span role="status" aria-live="polite">
            {done ? ui.loading.ready : ui.loading.hint}
          </span>
          <span className={styles.value} aria-hidden="true">
            {value}%
          </span>
        </p>
        {timedOut && !done && <p className={styles.timedOut}>{ui.loading.timedOut}</p>}
        {onExpress && !done && (
          <button
            type="button"
            className={styles.express + (timedOut ? " " + styles.expressStrong : "")}
            onClick={onExpress}
          >
            {ui.settings.expressLink}
          </button>
        )}
      </div>
    </div>
  );
}
