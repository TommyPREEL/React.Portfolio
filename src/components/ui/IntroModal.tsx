/**
 * @fileoverview Introduction modal component
 * Welcome screen with navigation instructions
 */

import { useId, useRef } from "react";
import type { IntroModalProps } from "../../types";
import { getContent } from "../../i18n";
import { CloseIcon, ArrowIcon } from "./icons";
import { useDialog } from "./useDialog";
import styles from "./IntroModal.module.css";

export interface IntroModalExtraProps {
  /** When provided, shows the "Express version" secondary button. */
  onExpress?: () => void;
}

/**
 * IntroModal - Welcome screen with controls explanation
 */
export function IntroModal({ onClose, language, onExpress }: IntroModalProps & IntroModalExtraProps) {
  const { ui, profile } = getContent(language);
  const { intro, settings } = ui;
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, onClose);

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.container}>
        <div
          ref={ref}
          className={styles.modal + " cut"}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label={settings.close}>
            <CloseIcon size={22} />
          </button>

          <p className={styles.kicker}>{profile.name}</p>
          <h2 id={titleId} className={styles.title}>{intro.title}</h2>
          <p className={styles.description}>{intro.description}</p>

          <h3 className={styles.controlsTitle}>{intro.controlsTitle}</h3>
          <ul className={styles.controlsList}>
            {intro.controls.map((item) => (
              <li key={item.key} className={styles.controlRow}>
                <span className={styles.keys}>
                  {item.key.split(" / ").map((part) => (
                    <kbd key={part} className={styles.kbd}>{part}</kbd>
                  ))}
                </span>
                <span className={styles.action}>{item.action}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button type="button" className={styles.startButton} onClick={onClose}>
              {intro.startButton}
              <ArrowIcon size={18} />
            </button>
            {onExpress && (
              <button type="button" className={styles.expressButton} onClick={onExpress}>
                {intro.expressButton}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
