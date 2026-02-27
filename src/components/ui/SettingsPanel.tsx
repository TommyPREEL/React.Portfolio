/**
 * @fileoverview Settings panel with gear button trigger
 * Slide-in panel for user preferences (language, etc.)
 */

import { useState } from "react";
import type { SettingsPanelProps } from "../../types";
import { getContent, allLanguages } from "../../i18n";
import styles from "./SettingsPanel.module.css";

/**
 * SettingsPanel - Gear icon that opens a slide-in settings panel
 */
export function SettingsPanel({ language, onLanguageChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content = getContent(language);
  const { settings } = content.ui;

  return (
    <>
      {/* Gear trigger button */}
      <button
        className={`${styles.gearButton}${isOpen ? ` ${styles.open}` : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={settings.title}
        title={settings.title}
      >
        ⚙️
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
      )}

      {/* Modal */}
      {isOpen && (
        <div className={styles.modalContainer}>
          <div className={`${styles.panel} ${styles.visible}`}>
            {/* Close button */}
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label={settings.close}
            >
              ✕
            </button>

            {/* Title */}
            <h2 className={styles.panelTitle}>{settings.title}</h2>

            {/* Language section */}
            <div className={styles.section}>
              <p className={styles.sectionLabel}>{settings.languageLabel}</p>
              <div className={styles.langToggle}>
                {allLanguages.map(({ code }) => (
                  <button
                    key={code}
                    className={`${styles.langButton}${language === code ? ` ${styles.langActive}` : ""}`}
                    onClick={() => onLanguageChange(code)}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
