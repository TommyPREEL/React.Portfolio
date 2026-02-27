/**
 * @fileoverview Introduction modal component
 * Welcome screen with navigation instructions
 */

import type { IntroModalProps } from "../../types";
import { getContent } from "../../i18n";
import styles from "./IntroModal.module.css";

/**
 * IntroModal - Welcome screen with controls explanation
 */
export function IntroModal({ onClose, language }: IntroModalProps) {
  const { ui } = getContent(language);
  const { intro } = ui;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Modal container */}
      <div className={styles.container}>
        <div className={styles.modal}>
          {/* Close button */}
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
          
          {/* Title */}
          <h2 className={styles.title}>{intro.title}</h2>
          
          {/* Description */}
          <p className={styles.description}>{intro.description}</p>
          
          {/* Controls section */}
          <div className={styles.controlsSection}>
            <h3 className={styles.controlsTitle}>{intro.controlsTitle}</h3>
            <ul className={styles.controlsList}>
              {intro.controls.map((line, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: line }} />
              ))}
            </ul>
          </div>
          
          {/* Start button */}
          <button 
            className={styles.startButton}
            onClick={onClose}
          >
            {intro.startButton}
          </button>
        </div>
      </div>
    </>
  );
}
