/**
 * @fileoverview Minimap component showing car position and zone icons
 * Fixed position overlay - horizontal layout
 */

import type { MinimapProps } from "../../types";
import type { Language } from "../../i18n";
import { getContent } from "../../i18n";
import { ZONES, CONFIG } from "../../config";
import { projectToMinimap } from "../../lib/map";
import { ZoneIcon } from "./icons";
import styles from "./Minimap.module.css";

/**
 * Minimap - Real-time position indicator
 * Shows car position relative to zones (horizontal layout)
 */
export function Minimap({
  carPosition,
  activeZone,
  onZoneClick,
  language = "en",
}: MinimapProps & { language?: Language }) {
  const { navigation, ui } = getContent(language);
  const clamp = (v: number) => Math.max(6, Math.min(94, v));
  const car = projectToMinimap(carPosition.x, carPosition.z, CONFIG.world, 44, 44);

  return (
    <nav className={styles.minimap + " cut cut-sm"} aria-label={ui.hud.map}>
      <div className={styles.mapContent}>
        <div className={styles.track} aria-hidden="true" />
        {ZONES.map((zone) => {
          const pt = projectToMinimap(zone.position[0], zone.position[2], CONFIG.world, 42, 38);
          const label = navigation[zone.id as keyof typeof navigation] ?? zone.id;
          const active = activeZone === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              className={styles.zoneIcon + (active ? " " + styles.zoneActive : "")}
              style={{ left: pt.x + "%", top: pt.y + "%" }}
              onClick={() => onZoneClick(zone.id)}
              aria-label={label}
              title={label}
              aria-current={active ? "true" : undefined}
            >
              <ZoneIcon id={zone.id} size={22} />
            </button>
          );
        })}

        <div
          className={styles.carIndicator}
          aria-hidden="true"
          style={{
            left: clamp(car.x) + "%",
            top: clamp(car.y) + "%",
          }}
        />
      </div>
    </nav>
  );
}
