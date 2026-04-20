import React, { useCallback, useRef, useState } from 'react';

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

export type BugSpotProps = {
  position: [number, number, number];
  radius?: number;
  pool?: CatchEntry[];
  cooldownMs?: number;
  successChance?: number;
  bugColor?: string;
  hoverHeight?: number;
};

const DEFAULT_BUG_POOL: CatchEntry[] = [
  { itemId: 'bug-butterfly', weight: 70 },
  { itemId: 'bug-beetle',    weight: 22 },
  { itemId: 'bug-stag',      weight: 8 },
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

export function BugSpot({
  position,
  radius = 2.4,
  pool = DEFAULT_BUG_POOL,
  cooldownMs = 600,
  successChance = 0.7,
  bugColor = '#ffd0e0',
  hoverHeight = 1.2,
}: BugSpotProps) {
  const lastUseRef = useRef(-Infinity);
  const bugRef = useRef<THREE.Mesh>(null);
  const [present, setPresent] = useState(true);
  const respawnAtRef = useRef(-Infinity);

  const onNet = useCallback((evt: ToolUseEvent): boolean | void => {
    if (!present) return;
    const dx = evt.origin[0] - position[0];
    const dz = evt.origin[2] - position[2];
    if (dx * dx + dz * dz > radius * radius) return;
    const now = performance.now();
    if (now - lastUseRef.current < cooldownMs) return true;
    lastUseRef.current = now;

    const bonus = useWeatherStore.getState().bugBonus();
    if (Math.random() > Math.min(0.95, Math.max(0.05, successChance + bonus))) {
      notify('warn', '날아갔다…');
      setPresent(false);
      respawnAtRef.current = now + 8000;
      return true;
    }
    const seasonalPool = filterByTags(pool, 'bug:', useEventsStore.getState().tags);
    const itemId = pickWeighted(seasonalPool);
    if (!itemId) return true;
    const def = getItemRegistry().get(itemId);
    const left = useInventoryStore.getState().add(itemId, 1);
    if (left > 0) notify('warn', '인벤토리가 가득 찼습니다');
    else notify('reward', `${def?.name ?? itemId} 잡았다!`);
    setPresent(false);
    respawnAtRef.current = now + 12000;
    return true;
  }, [position, radius, cooldownMs, pool, successChance, present]);

  useToolUse('net', onNet);

  useFrame(({ clock }) => {
    const now = performance.now();
    if (!present && now >= respawnAtRef.current) setPresent(true);
    const b = bugRef.current;
    if (!b || !present) return;
    const t = clock.elapsedTime;
    b.position.x = Math.sin(t * 1.2) * 0.6;
    b.position.z = Math.cos(t * 0.9) * 0.6;
    b.position.y = hoverHeight + Math.sin(t * 2.6) * 0.15;
    b.rotation.y = t * 1.4;
  });

  if (!present) return <group position={position} />;
  return (
    <group position={position}>
      <mesh ref={bugRef}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial color={bugColor} />
      </mesh>
    </group>
  );
}

export default BugSpot;
