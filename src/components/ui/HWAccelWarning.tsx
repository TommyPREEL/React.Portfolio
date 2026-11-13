/**
 * @fileoverview Hardware acceleration toast
 * Compact dismissible notice; Escape dismisses it without reaching the app's menu handler.
 */

import { useEffect, useRef } from "react";
import type { Language } from "../../i18n";
import { getContent } from "../../i18n";
import { BoostIcon, CloseIcon } from "./icons";
import styles from "./HWAccelWarning.module.css";

interface HWAccelWarningProps {
  onClose: () => void;
  language: Language;
  /** When provided, an "Express version" link is shown inside the toast. */
  onExpress?: () => void;
}

export function HWAccelWarning({ onClose, language, onExpress }: HWAccelWarningProps) {
  const { hwAccelWarning, settings } = getContent(language).ui;
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // A dialog owns Escape while it is open
      if (document.querySelector('[role="dialog"]')) return;
      e.stopPropagation();
      closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.toast + " cut cut-sm"} role="status">
      <BoostIcon className={styles.icon} size={20} />
      <div className={styles.body}>
        <p className={styles.text}>
          <strong>{hwAccelWarning.title}</strong> {hwAccelWarning.description}
        </p>
        {onExpress && (
          <button type="button" className={styles.expressLink} onClick={onExpress}>
            {settings.expressLink}
          </button>
        )}
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label={hwAccelWarning.dismissButton}
        title={hwAccelWarning.dismissButton}
      >
        <CloseIcon size={18} />
      </button>
    </div>
  );
}
