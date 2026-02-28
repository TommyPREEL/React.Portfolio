/**
 * @fileoverview Minimap component showing car position and zone icons
 * Fixed position overlay - horizontal layout
 */

import type { MinimapProps } from "../../types";
import { ZONES, CONFIG } from "../../config";
import styles from "./Minimap.module.css";

/**
 * Minimap - Real-time position indicator
 * Shows car position relative to zones (horizontal layout)
 */
export function Minimap({ carPosition, activeZone, onZoneClick }: MinimapProps) {
  // Calculate car position percentage for horizontal world (width=80, depth=30)
  // X: -40 to 40 -> 5% to 95%
  // Z: -15 to 15 -> 20% to 80%
  const halfWidth = CONFIG.world.width / 2;
  const halfDepth = CONFIG.world.depth / 2;
  const carX = 50 + (carPosition.x / halfWidth) * 45;
  const carY = 50 + (carPosition.z / halfDepth) * 30;

  return (
    <div className={styles.minimap}>
      <div className={styles.mapContent}>
        {/* Zone icons - positioned based on actual zone positions */}
        {ZONES.map((zone) => {
          // Calculate position based on zone's actual X position
          // Zone positions: -24, -8, 8, 24 -> map to 10%-90%
          const xPos = 50 + (zone.position[0] / halfWidth) * 40;
          
          return (
            <button 
              key={zone.id}
              className={styles.zoneIcon}
              style={{
                left: `${xPos}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: activeZone === zone.id ? 1 : 0.5
              }}
              onClick={() => onZoneClick(zone.id)}
              title={zone.label}
            >
              {zone.icon}
            </button>
          );
        })}
        
        {/* Horizontal path indicator */}
        
        {/* Car position indicator */}
        <div 
          className={styles.carIndicator}
          style={{
            left: `${Math.max(5, Math.min(95, carX))}%`,
            top: `${Math.max(20, Math.min(80, carY))}%`,
          }}
        />
      </div>
    </div>
  );
}
