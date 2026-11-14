/**
 * @fileoverview Settings gear button (+ optional permanent Express link)
 * Opens the escape menu on the Settings tab
 */

import type { ReactNode } from "react";
import type { SettingsPanelProps } from "../../types";
import type { Language } from "../../i18n";
import { getContent } from "../../i18n";
import { GearIcon } from "./icons";
import styles from "./SettingsPanel.module.css";

export interface SettingsPanelExtraProps {
  language?: Language;
  /** When provided, a permanent "Express version" link sits next to the gear. */
  onExpress?: () => void;
  /** Extra HUD controls (e.g. SoundToggle) laid out in the same row, between gear and Express link. */
  children?: ReactNode;
}

/**
 * SettingsPanel - Gear icon button that opens the EscapeMenu
 */
export function SettingsPanel({
  onOpenEscapeMenu,
  language = "en",
  onExpress,
  children,
}: SettingsPanelProps & SettingsPanelExtraProps) {
  const { settings } = getContent(language).ui;
  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.gearButton}
        onClick={onOpenEscapeMenu}
        aria-label={settings.openSettings}
        title={settings.title}
      >
        <GearIcon size={24} />
      </button>
      {children}
      {onExpress && (
        <button type="button" className={styles.expressButton} onClick={onExpress}>
          <span className={styles.labelFull}>{settings.expressLink}</span>
          <span className={styles.labelShort} aria-hidden="true">{settings.expressLinkShort}</span>
        </button>
      )}
    </div>
  );
}
