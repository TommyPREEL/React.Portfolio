/**
 * @fileoverview Escape Menu - tabbed pause modal
 * Opens when the user presses Escape; shows Home, Controls, Settings, Map tabs
 */

import { useId, useRef, useState, type CSSProperties } from "react";
import type { EscapeMenuProps } from "../../types";
import { getContent, allLanguages } from "../../i18n";
import { ZONES, CONFIG } from "../../config";
import { projectToMinimap } from "../../lib/map";

// One projection for zones and the car dot, so the dot sits where the icons say it is.
const MAP_SPAN_X = 36;
const MAP_SPAN_Y = 40;
import { VOLUME_CHANNELS, type SoundVolumes } from "../../lib/soundPref";
import { CloseIcon, SoundOnIcon, SoundOffIcon, ZoneIcon } from "./icons";
import { useDialog } from "./useDialog";
import styles from "./EscapeMenu.module.css";

type Tab = "home" | "controls" | "settings" | "map";
export type QualityMode = "auto" | "high" | "low";

export interface EscapeMenuExtraProps {
  /** Sound toggle row appears only if onSoundToggle is provided. */
  soundEnabled?: boolean;
  onSoundToggle?: () => void;
  /** Per-channel volume sliders appear only if onVolumeChange is provided. */
  volumes?: SoundVolumes;
  onVolumeChange?: (channel: keyof SoundVolumes, value: number) => void;
  /** Quality select appears only if onQualityChange is provided. */
  quality?: QualityMode;
  onQualityChange?: (quality: QualityMode) => void;
}

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
  soundEnabled = false,
  onSoundToggle,
  volumes,
  onVolumeChange,
  quality = "auto",
  onQualityChange,
}: EscapeMenuProps & EscapeMenuExtraProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const content = getContent(language);
  const { navigation } = content;
  const { settings, escapeMenu, intro } = content.ui;
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const baseId = useId();
  useDialog(ref, onClose);

  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: escapeMenu.tabHome },
    { id: "controls", label: escapeMenu.tabControls },
    { id: "settings", label: escapeMenu.tabSettings },
    { id: "map", label: escapeMenu.tabMap },
  ];

  // Map math: shared helper with the Minimap so every zone and the car stay inside the frame
  const clampPct = (v: number) => Math.max(6, Math.min(94, v));
  const car = projectToMinimap(carPosition.x, carPosition.z, CONFIG.world, MAP_SPAN_X, MAP_SPAN_Y);

  const zoneLabel = (id: string): string => navigation[id as keyof typeof navigation] ?? id;

  const handleZoneClick = (zoneId: string) => {
    onZoneClick(zoneId);
    onClose();
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else return;
    e.preventDefault();
    const target = tabs[next];
    if (!target) return;
    setActiveTab(target.id);
    document.getElementById(baseId + "-tab-" + target.id)?.focus();
  };

  const qualityOptions: { id: QualityMode; label: string }[] = [
    { id: "auto", label: settings.qualityAuto },
    { id: "high", label: settings.qualityHigh },
    { id: "low", label: settings.qualityLow },
  ];

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
          <h2 id={titleId} className="visually-hidden">{escapeMenu.menuTitle}</h2>

          <div className={styles.header}>
            <div className={styles.tabBar} role="tablist" aria-label={escapeMenu.menuTitle}>
              {tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={baseId + "-tab-" + tab.id}
                  aria-selected={activeTab === tab.id}
                  aria-controls={baseId + "-panel"}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  className={styles.tabButton + (activeTab === tab.id ? " " + styles.tabActive : "")}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label={settings.close}>
              <CloseIcon size={22} />
            </button>
          </div>

          <div
            className={styles.tabContent}
            role="tabpanel"
            id={baseId + "-panel"}
            aria-labelledby={baseId + "-tab-" + activeTab}
          >
            {activeTab === "home" && (
              <div className={styles.homeTab}>
                <h3 className={styles.homeTitle}>{intro.title}</h3>
                <p className={styles.homeDesc}>{intro.description}</p>
                <h4 className={styles.sectionLabel}>{intro.controlsTitle}</h4>
                <ul className={styles.homeList}>
                  {intro.controls.map((item) => (
                    <li key={item.key}>
                      <kbd className={styles.controlKbd}>{item.key}</kbd>
                      <span>{item.action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "controls" && (
              <div className={styles.controlsTab}>
                {escapeMenu.controls.map((ctrl) => (
                  <div key={ctrl.keys} className={styles.controlRow}>
                    <div className={styles.controlKeys}>
                      {ctrl.keys.split(" / ").map((part, j) => (
                        <span key={part}>
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

            {activeTab === "settings" && (
              <div className={styles.settingsTab}>
                <div className={styles.settingsSection}>
                  <p className={styles.settingsLabel} id={baseId + "-lang"}>{settings.languageLabel}</p>
                  <div className={styles.segment} role="group" aria-labelledby={baseId + "-lang"}>
                    {allLanguages.map(({ code, name }) => (
                      <button
                        key={code}
                        type="button"
                        lang={code}
                        aria-label={name}
                        aria-pressed={language === code}
                        className={styles.segmentButton + (language === code ? " " + styles.segmentActive : "")}
                        onClick={() => onLanguageChange(code)}
                      >
                        {code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {onSoundToggle && (
                  <div className={styles.settingsSection}>
                    <p className={styles.settingsLabel}>{settings.soundLabel}</p>
                    <button
                      type="button"
                      role="switch"
                      data-sound-toggle=""
                      aria-checked={soundEnabled}
                      className={styles.switchButton + (soundEnabled ? " " + styles.segmentActive : "")}
                      onClick={onSoundToggle}
                    >
                      {soundEnabled ? <SoundOnIcon size={22} /> : <SoundOffIcon size={22} />}
                      <span>{soundEnabled ? settings.soundOn : settings.soundOff}</span>
                    </button>
                  </div>
                )}

                {onVolumeChange && volumes && (
                  <div className={styles.settingsSection}>
                    <p className={styles.settingsLabel}>{settings.volumeLabel}</p>
                    <div className={styles.volumes}>
                      {VOLUME_CHANNELS.map((channel) => {
                        const id = baseId + "-vol-" + channel;
                        const pct = Math.round(volumes[channel] * 100);
                        return (
                          <div key={channel} className={styles.volumeRow}>
                            <label htmlFor={id} className={styles.volumeName}>
                              {settings.volumeChannels[channel]}
                            </label>
                            <input
                              id={id}
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={pct}
                              aria-valuetext={pct + " %"}
                              className={styles.volumeSlider}
                              style={{ "--fill": pct + "%" } as CSSProperties}
                              onChange={(e) => onVolumeChange(channel, Number(e.target.value) / 100)}
                            />
                            <output htmlFor={id} className={styles.volumeValue}>
                              {pct}%
                            </output>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {onQualityChange && (
                  <div className={styles.settingsSection}>
                    <p className={styles.settingsLabel} id={baseId + "-quality"}>{settings.qualityLabel}</p>
                    <div className={styles.segment} role="radiogroup" aria-labelledby={baseId + "-quality"}>
                      {qualityOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={quality === opt.id}
                          className={styles.segmentButton + (quality === opt.id ? " " + styles.segmentActive : "")}
                          onClick={() => onQualityChange(opt.id)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className={styles.hint}>{settings.qualityHint}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "map" && (
              <div className={styles.mapTab}>
                <div className={styles.mapCanvas}>
                  {ZONES.map((zone) => {
                    const pt = projectToMinimap(zone.position[0], zone.position[2], CONFIG.world, MAP_SPAN_X, MAP_SPAN_Y);
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        className={styles.mapZone + (activeZone === zone.id ? " " + styles.mapZoneActive : "")}
                        style={{ left: pt.x + "%", top: pt.y + "%" }}
                        onClick={() => handleZoneClick(zone.id)}
                        aria-label={zoneLabel(zone.id)}
                      >
                        <ZoneIcon id={zone.id} size={24} />
                        <span className={styles.mapZoneLabel}>{zoneLabel(zone.id)}</span>
                      </button>
                    );
                  })}
                  <div
                    className={styles.mapCar}
                    style={{
                      left: clampPct(car.x) + "%",
                      top: clampPct(car.y) + "%",
                    }}
                  />
                </div>
                <p className={styles.mapLegend}>
                  <span className={styles.mapCarDot} />
                  {escapeMenu.mapYourPosition}
                  <span className={styles.mapLegendSep}>/</span>
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
