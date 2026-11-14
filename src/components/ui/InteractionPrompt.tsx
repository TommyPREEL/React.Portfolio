/**
 * @fileoverview Contextual prompt shown when the car is inside a zone.
 * Desktop: "Enter" key cap + "Open {label}". Touch: tappable button.
 */

import type { Language } from "../../i18n";
import { getContent } from "../../i18n";
import { ArrowIcon } from "./icons";
import styles from "./InteractionPrompt.module.css";

export interface InteractionPromptProps {
  /** Name of the zone or object to open (already translated). */
  label: string;
  isTouch: boolean;
  onActivate: () => void;
  /** Defaults to "en". */
  language?: Language;
}

export function InteractionPrompt({ label, isTouch, onActivate, language = "en" }: InteractionPromptProps) {
  const { prompt } = getContent(language).ui;

  return (
    <button type="button" className={styles.prompt + (isTouch ? " " + styles.touch : "")} onClick={onActivate}>
      {isTouch ? null : <kbd className={styles.key}>{prompt.enterKey}</kbd>}
      <span className={styles.text}>
        <span className={styles.verb}>{isTouch ? prompt.tapToOpen : prompt.open}</span>
        <span className={styles.label}>{label}</span>
      </span>
      {isTouch && <ArrowIcon size={20} />}
    </button>
  );
}
