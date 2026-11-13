/**
 * @fileoverview Player car: wires pure physics (lib/carPhysics, lib/collision) to the
 * scene graph and writes the pose into the store. No React state, no per-frame allocation.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAR_BOUNDS, COLLIDERS, CONFIG, SPAWN } from "../../config";
import { IDLE_INPUT, stepCar, type CarInput, type CarState } from "../../lib/carPhysics";
import { constrainToPolygon, resolveCircleCollisions } from "../../lib/collision";
import { useGameStore } from "../../store/gameStore";
import { CarModel } from "./CarModel";
import { LightTrail } from "./LightTrail";
import { getBlobMaterial } from "./materials";

export function Car() {
  const group = useRef<THREE.Group>(null);
  const curRef = useRef<CarState>({ x: SPAWN.x, z: SPAWN.z, rotation: SPAWN.rotation, speed: 0 });
  const nextRef = useRef<CarState>({ x: SPAWN.x, z: SPAWN.z, rotation: SPAWN.rotation, speed: 0 });
  const inputRef = useRef<CarInput>({ ...IDLE_INPUT });
  const blobGeo = useMemo(() => new THREE.PlaneGeometry(2.6, 3.8).rotateX(-Math.PI / 2), []);
  useEffect(() => () => blobGeo.dispose(), [blobGeo]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 20);
    const cur = curRef.current;
    const next = nextRef.current;
    const input = inputRef.current;
    const store = useGameStore.getState();
    const pose = store.pose;

    const target = store.teleportTarget;
    if (target) {
      const k = 1 - Math.exp(-dt * 7);
      cur.x += (target.x - cur.x) * k;
      cur.z += (target.z - cur.z) * k;
      cur.speed = 0;
      if (Math.hypot(target.x - cur.x, target.z - cur.z) < 0.3) {
        cur.x = target.x;
        cur.z = target.z;
        store.clearTeleport();
      }
    } else {
      const keys = window.keys;
      const locked = store.inputLocked;
      input.forward = !locked && !!keys.forward;
      input.backward = !locked && !!keys.backward;
      input.left = !locked && !!keys.left;
      input.right = !locked && !!keys.right;
      input.boost = !locked && !!keys.boost;
      input.joystickX = !locked && typeof keys.joystickX === "number" ? keys.joystickX : 0;
      input.joystickZ = !locked && typeof keys.joystickZ === "number" ? keys.joystickZ : 0;

      stepCar(cur, input, CONFIG.car, dt, next);
      resolveCircleCollisions(next, CONFIG.car.radius, COLLIDERS);
      constrainToPolygon(next, cur.x, cur.z, CAR_BOUNDS);
      cur.x = next.x;
      cur.z = next.z;
      cur.rotation = next.rotation;
      cur.speed = next.speed;
    }

    g.position.set(cur.x, 0, cur.z);
    g.rotation.y = cur.rotation;
    pose.x = cur.x;
    pose.z = cur.z;
    pose.rotation = cur.rotation;
    pose.speed = cur.speed;
    pose.boosting = input.boost && Math.abs(cur.speed) > 1;
  });

  return (
    <>
      <LightTrail />
      <group ref={group} position={[SPAWN.x, 0, SPAWN.z]} rotation-y={SPAWN.rotation}>
        <CarModel />
        <mesh geometry={blobGeo} material={getBlobMaterial()} position={[0, 0.11, 0]} />
      </group>
    </>
  );
}
