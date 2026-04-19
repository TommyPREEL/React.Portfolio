/**
 * @fileoverview Virtual joystick + action buttons for mobile
 * Sets window.keys just like the keyboard handler, so the car
 * physics loop picks it up without any extra wiring.
 */

import { useEffect, useRef } from "react";
import styles from "./MobileControls.module.css";

interface MobileControlsProps {}

const RADIUS = 44;       // max thumb travel in px
const DEAD_ZONE = 0.22;  // fraction of RADIUS below which no input

export function MobileControls(_props: MobileControlsProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  const resetKeys = () => {
    window.keys.joystickX = 0;
    window.keys.joystickZ = 0;
  };

  const applyKeys = (rawDx: number, rawDy: number) => {
    const mag = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    if (mag < RADIUS * DEAD_ZONE) {
      window.keys.joystickX = 0;
      window.keys.joystickZ = 0;
    } else {
      // Normalise by RADIUS (clamped so max = 1)
      window.keys.joystickX = Math.max(-1, Math.min(1, rawDx / RADIUS));
      window.keys.joystickZ = Math.max(-1, Math.min(1, rawDy / RADIUS));
    }
  };

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const onTouchStart = (e: TouchEvent) => {
      if (touchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      touchIdRef.current = touch.identifier;
      const rect = base.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier !== touchIdRef.current) continue;

        const rawDx = touch.clientX - centerRef.current.x;
        const rawDy = touch.clientY - centerRef.current.y;
        const dist  = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
        const clamp = Math.min(dist, RADIUS);
        const angle = Math.atan2(rawDy, rawDx);
        const cx = Math.cos(angle) * clamp;
        const cy = Math.sin(angle) * clamp;

        if (thumbRef.current) {
          thumbRef.current.style.transform =
            `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
        }

        applyKeys(rawDx, rawDy);
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier !== touchIdRef.current) continue;
        touchIdRef.current = null;
        if (thumbRef.current) {
          thumbRef.current.style.transform = "translate(-50%, -50%)";
        }
        resetKeys();
      }
    };

    base.addEventListener("touchstart",  onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove,  { passive: false });
    window.addEventListener("touchend",  onTouchEnd);

    return () => {
      base.removeEventListener("touchstart",  onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
      resetKeys();
    };
  }, []);

  return (
    <div className={styles.controls}>
      {/* Left — joystick */}
      <div className={styles.joystickWrapper}>
        <div ref={baseRef} className={styles.joystickBase}>
          <div ref={thumbRef} className={styles.joystickThumb} />
        </div>
      </div>

      {/* Right — boost button only */}
      <div className={styles.actionButtons}>
        <button
          className={`${styles.actionBtn} ${styles.boostBtn}`}
          onTouchStart={(e) => { e.preventDefault(); window.keys.boost = true; }}
          onTouchEnd={(e)   => { e.preventDefault(); window.keys.boost = false; }}
          aria-label="Boost"
        >
          🔥
        </button>
      </div>
    </div>
  );
}
