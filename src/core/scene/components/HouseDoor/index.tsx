import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { useTeleport } from '../../../hooks/useTeleport';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { AFTER_MOTION_FRAME_ORDER, useEngineFrame } from '../../../runtime/frame';
import { useSceneStore } from '../../stores/sceneStore';
import type { SceneEntry, SceneId } from '../../types';

export type HouseDoorProps = {
  /** World position of the door pad. */
  position: [number, number, number];
  /** Scene id to enter when the player walks onto the pad. */
  sceneId: SceneId;
  /** Where to spawn the player inside the target scene. */
  entry: SceneEntry;
  /**
   * Where to spawn the player when they leave through the same door (defaults
   * to `position` shifted slightly outward).
   */
  exitOverride?: SceneEntry;
  /** Trigger radius in metres; default 1.4. */
  radius?: number;
  /** Cooldown in ms after a transition before it can re-trigger. */
  cooldownMs?: number;
  /** Visual color of the door pad. */
  color?: string;
  /** Optional label shown via gpEventBus toast (kept simple — no UI here). */
  label?: string;
};

/**
 * A volumetric trigger that swaps scenes when the player enters its radius.
 *
 * Implementation note: we do not rely on Rapier sensors here because the
 * outdoor scene is unmounted when entering an interior, which would tear down
 * a sensor mid-event. Polling the player's position with a small radius is
 * cheap and survives scene swaps.
 */
export function HouseDoor({
  position,
  sceneId,
  entry,
  exitOverride,
  radius = 1.4,
  cooldownMs = 800,
  color = '#5a8acf',
  label,
}: HouseDoorProps) {
  const goTo = useSceneStore((s) => s.goTo);
  const current = useSceneStore((s) => s.current);
  const { teleport } = useTeleport();
  const { position: playerPos } = usePlayerPosition({ updateInterval: 50, reactive: false });
  const lastTriggerRef = useRef(Number.NEGATIVE_INFINITY);

  const padGeometry = useMemo(() => new THREE.CylinderGeometry(radius, radius, 0.08, 28), [radius]);

  useEffect(() => () => padGeometry.dispose(), [padGeometry]);

  useEngineFrame('postPhysics', () => {
    const now = performance.now();
    if (now - lastTriggerRef.current < cooldownMs) return;

    const dx = playerPos.x - position[0];
    const dz = playerPos.z - position[2];
    const distSq = dx * dx + dz * dz;
    if (distSq > radius * radius) return;

    lastTriggerRef.current = now;

    if (current === sceneId) return;
    void enterScene();
  }, { order: AFTER_MOTION_FRAME_ORDER, label: 'scene:house-door' });

  async function enterScene() {
    // Save where the player came from so the exit door knows where to drop them.
    const saveReturn = exitOverride ?? {
      position: [position[0], position[1], position[2]] as [number, number, number],
    };

    await goTo(sceneId, {
      entry, saveReturn,
      onEntered: () => teleport(new THREE.Vector3(...entry.position)),
    });
  }

  return (
    <group position={position}>
      <mesh rotation={[0, 0, 0]} geometry={padGeometry}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          transparent
          opacity={0.6}
        />
      </mesh>
      {label && (
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.04, 0.6, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      )}
    </group>
  );
}
