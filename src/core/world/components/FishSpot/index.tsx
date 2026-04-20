import React, { useCallback, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useEventsStore } from '../../../events/stores/eventsStore';
import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { notify } from '../../../ui/components/Toast/toastStore';
import { useToolUse } from '../../../tools/hooks/useToolUse';
import type { ToolUseEvent } from '../../../tools/types';
import { useWeatherStore } from '../../../weather/stores/weatherStore';

export type CatchEntry = { itemId: string; weight: number };

export type FishSpotProps = {
  position: [number, number, number];
  radius?: number;
  pool?: CatchEntry[];
  cooldownMs?: number;
  successChance?: number;
  showRipple?: boolean;
  rippleColor?: string;
};

const DEFAULT_FISH_POOL: CatchEntry[] = [
  { itemId: 'fish-bass', weight: 60 },
  { itemId: 'fish-tuna', weight: 25 },
  { itemId: 'fish-koi',  weight: 10 },
];

function filterByTags(pool: CatchEntry[], tagPrefix: string, tags: Set<string>): CatchEntry[] {
  const allowed: string[] = [];
  for (const t of tags) if (t.startsWith(tagPrefix)) allowed.push(t.slice(tagPrefix.length));
  if (allowed.length === 0) return pool;
  const set = new Set(allowed);
  const filtered = pool.filter((p) => set.has(p.itemId));
  return filtered.length > 0 ? filtered : pool;
}

function pickWeighted(pool: CatchEntry[]): string | null {
  if (pool.length === 0) return null;
  const total = pool.reduce((n, p) => n + Math.max(0, p.weight), 0);
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const p of pool) {
    r -= Math.max(0, p.weight);
    if (r <= 0) return p.itemId;
  }
  return pool[pool.length - 1]!.itemId;
}

export function FishSpot({
  position,
  radius = 3.0,
  pool = DEFAULT_FISH_POOL,
  cooldownMs = 600,
  successChance = 0.6,
  showRipple = true,
  rippleColor = '#9ad9ff',
}: FishSpotProps) {
  const lastUseRef = useRef(-Infinity);
  const rippleRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef(-Infinity);

  const onRod = useCallback((evt: ToolUseEvent): boolean | void => {
    const dx = evt.origin[0] - position[0];
    const dz = evt.origin[2] - position[2];
    if (dx * dx + dz * dz > radius * radius) return;
    const now = performance.now();
    if (now - lastUseRef.current < cooldownMs) return true;
    lastUseRef.current = now;
    flashRef.current = now;

    const bonus = useWeatherStore.getState().fishingBonus();
    if (Math.random() > Math.min(0.95, successChance + bonus)) {
      notify('warn', '놓쳤다…');
      return true;
    }
    const seasonalPool = filterByTags(pool, 'fish:', useEventsStore.getState().tags);
    const itemId = pickWeighted(seasonalPool);
    if (!itemId) return true;
    const def = getItemRegistry().get(itemId);
    const left = useInventoryStore.getState().add(itemId, 1);
    if (left > 0) notify('warn', '인벤토리가 가득 찼습니다');
    else notify('reward', `${def?.name ?? itemId} 낚음!`);
    return true;
  }, [position, radius, cooldownMs, pool, successChance]);

  useToolUse('rod', onRod);

  useFrame(() => {
    const m = rippleRef.current;
    if (!m) return;
    const since = (performance.now() - flashRef.current) / 1000;
    if (since < 0.6) {
      const t = since / 0.6;
      m.scale.setScalar(0.4 + t * 1.4);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 * (1 - t);
    } else {
      m.scale.setScalar(0);
    }
  });

  return (
    <group position={position}>
      {showRipple && (
        <mesh ref={rippleRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.4, 0.6, 32]} />
          <meshBasicMaterial color={rippleColor} transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export default FishSpot;
