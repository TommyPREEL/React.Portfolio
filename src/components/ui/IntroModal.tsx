/**
 * @fileoverview Introduction modal component
 * Welcome screen with navigation instructions
 */

import type { IntroModalProps } from "../../types";
import styles from "./IntroModal.module.css";

/**
 * IntroModal - Welcome screen with controls explanation
 */
export function IntroModal({ onClose }: IntroModalProps) {
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
          <h2 className={styles.title}>Bienvenue ! 🚀</h2>
          
          {/* Description */}
          <p className={styles.description}>
            Bienvenue sur mon portfolio interactif en 3D ! Explorez mon univers 
            de développeur Full Stack à travers une expérience immersive.
          </p>
          
          {/* Controls section */}
          <div className={styles.controlsSection}>
            <h3 className={styles.controlsTitle}>🎮 Comment naviguer ?</h3>
            <ul className={styles.controlsList}>
              <li>
                <strong>ZQSD / WASD</strong> : Conduire la voiture
              </li>
              <li>
                <strong>Shift</strong> : Activer le boost 🔥
              </li>
              <li>
                <strong>Enter</strong> : Ouvrir une zone (About, Projects, Skills, Contact)
              </li>
              <li>
                Conduisez jusqu'aux zones illuminées pour découvrir mon parcours !
              </li>
            </ul>
          </div>
          
          {/* Start button */}
          <button 
            className={styles.startButton}
            onClick={onClose}
          >
            C'est parti ! 🎮
          </button>
        </div>
      </div>
    </>
  );
}
