/**
 * @fileoverview Portfolio title header component
 */

import type { PortfolioTitleProps } from "../../types";
import styles from "./PortfolioTitle.module.css";

/**
 * PortfolioTitle - Main header with gradient text
 */
export function PortfolioTitle({ title = "Tommy PREEL" }: PortfolioTitleProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
