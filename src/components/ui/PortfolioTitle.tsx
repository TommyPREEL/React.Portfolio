/**
 * @fileoverview Portfolio title header component
 */

import type { PortfolioTitleProps } from "../../types";
import { getContent } from "../../i18n";
import styles from "./PortfolioTitle.module.css";

const DEFAULT_NAME = getContent("en").profile.name;

/**
 * PortfolioTitle - HUD nameplate
 */
export function PortfolioTitle({ title = DEFAULT_NAME }: PortfolioTitleProps) {
  return (
    <div className={styles.container + " cut cut-sm"}>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
