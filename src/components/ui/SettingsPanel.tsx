/**
 * @fileoverview Settings gear button
 * Opens the escape menu on the Settings tab
 */

import type { SettingsPanelProps } from "../../types";
import styles from "./SettingsPanel.module.css";

/**
 * SettingsPanel - Gear icon button that opens the EscapeMenu
 */
export function SettingsPanel({ onOpenEscapeMenu }: SettingsPanelProps) {
  return (
    <button
      className={styles.gearButton}
      onClick={onOpenEscapeMenu}
      aria-label="Settings"
      title="Settings"
    >
      ⚙️
    </button>
  );
}
