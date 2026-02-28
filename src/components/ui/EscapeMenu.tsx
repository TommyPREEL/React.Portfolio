/**
 * @fileoverview Escape Menu — tabbed pause modal
 * Opens when the user presses Escape; shows Home, Controls, Settings, Map tabs
 */

import { useState } from "react";
import type { EscapeMenuProps } from "../../types";
import { getContent, allLanguages } from "../../i18n";
import { ZONES, CONFIG } from "../../config";
import styles from "./EscapeMenu.module.css";

type Tab = "home" | "controls" | "settings" | "map";

/**
 * EscapeMenu - Tabbed modal accessible via the Escape key
 */
export function EscapeMenu({
  language,
  onLanguageChange,
  carPosition,
  activeZone,
  onClose,
  onZoneClick,
  initialTab = "home",
}: EscapeMenuProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const content = getContent(language);
  const { navigation } = content;
  const { settings, escapeMenu, intro } = content.ui;

  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: escapeMenu.tabHome },
    { id: "controls", label: escapeMenu.tabControls },
    { id: "settings", label: escapeMenu.tabSettings },
    { id: "map", label: escapeMenu.tabMap },
  ];

  // Map math (same as Minimap)
  const halfWidth = CONFIG.world.width / 2;
  const halfDepth = CONFIG.world.depth / 2;
  const carX = 50 + (carPosition.x / halfWidth) * 45;
  const carY = 50 + (carPosition.z / halfDepth) * 30;

  // Zone id → translated label lookup
  const zoneLabel = (id: string): string =>
    navigation[id as keyof typeof navigation] ?? id;

  const handleZoneClick = (zoneId: string) => {
    onZoneClick(zoneId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div className={styles.container}>
        <div className={styles.modal}>
          {/* Close button (absolute, matching IntroModal) */}
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={settings.close}
          >
            ✕
          </button>

          {/* Header: tabs */}
          <div className={styles.header}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.tabButton}${activeTab === tab.id ? ` ${styles.tabActive}` : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
          </div>

          {/* Tab content */}
          <div className={styles.tabContent}>

            {/* HOME */}
            {activeTab === "home" && (
              <div className={styles.homeTab}>
                <h2 className={styles.homeTitle}>{intro.title}</h2>
                <p className={styles.homeDesc}>{intro.description}</p>
                <div className={styles.homeControls}>
                  <h3 className={styles.homeControlsTitle}>{intro.controlsTitle}</h3>
                  <ul className={styles.homeControlsList}>
                    {intro.controls.map((line, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: line }} />
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* CONTROLS */}
            {activeTab === "controls" && (
              <div className={styles.controlsTab}>
                {escapeMenu.controls.map((ctrl, i) => (
                  <div key={i} className={styles.controlRow}>
                    <div className={styles.controlKeys}>
                      {ctrl.keys.split(" / ").map((part, j) => (
                        <span key={j}>
                          {j > 0 && <span className={styles.controlOr}>{escapeMenu.controlOr}</span>}
                          <kbd className={styles.controlKbd}>{part}</kbd>
                        </span>
                      ))}
                    </div>
                    <span className={styles.controlAction}>{ctrl.action}</span>
                  </div>
                ))}
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === "settings" && (
              <div className={styles.settingsTab}>
                <div className={styles.settingsSection}>
                  <p className={styles.settingsLabel}>{settings.languageLabel}</p>
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
            )}

            {/* MAP */}
            {activeTab === "map" && (
              <div className={styles.mapTab}>
                <div className={styles.mapCanvas}>
                  {/* Zone icons */}
                  {ZONES.map((zone) => {
                    const xPos = 50 + (zone.position[0] / halfWidth) * 40;
                    return (
                      <button
                        key={zone.id}
                        className={styles.mapZone}
                        style={{
                          left: `${xPos}%`,
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          opacity: activeZone === zone.id ? 1 : 0.6,
                        }}
                        onClick={() => handleZoneClick(zone.id)}
                        title={zoneLabel(zone.id)}
                      >
                        <span className={styles.mapZoneIcon}>{zone.icon}</span>
                        <span className={styles.mapZoneLabel}>{zoneLabel(zone.id)}</span>
                      </button>
                    );
                  })}
                  {/* Car */}
                  <div
                    className={styles.mapCar}
                    style={{
                      left: `${Math.max(5, Math.min(95, carX))}%`,
                      top: `${Math.max(20, Math.min(80, carY))}%`,
                    }}
                  />
                </div>
                <p className={styles.mapLegend}>
                  <span className={styles.mapCarDot} /> {escapeMenu.mapYourPosition}
                  <span className={styles.mapLegendSep}>·</span>
                  {escapeMenu.mapTeleportHint}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
