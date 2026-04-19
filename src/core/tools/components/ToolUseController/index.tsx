import { useEffect, useRef } from 'react';

import * as THREE from 'three';

import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { getToolEvents } from '../../core/ToolEvents';
import type { ToolKind } from '../../types';

export type ToolUseControllerProps = {
  useKey?: string;
  range?: number;
  cooldownMs?: number;
};

export function ToolUseController({
  useKey = 'f',
  range = 2.4,
  cooldownMs = 350,
}: ToolUseControllerProps = {}): null {
  const { position, rotation } = usePlayerPosition({ updateInterval: 16 });
  const lastUseRef = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key.toLowerCase() !== useKey.toLowerCase()) return;

      const now = performance.now();
      if (now - lastUseRef.current < cooldownMs) return;

      const equipped = useInventoryStore.getState().getEquipped();
      if (!equipped) return;
      const def = getItemRegistry().get(equipped.itemId);
      if (!def?.toolKind) return;
      const kind = def.toolKind as ToolKind;

      const yaw = rotation?.y ?? 0;
      const dir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();

      lastUseRef.current = now;
      getToolEvents().emit({
        kind,
        origin: [position.x, position.y, position.z],
        direction: [dir.x, dir.y, dir.z],
        range,
        timestamp: now,
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [useKey, cooldownMs, range, position, rotation]);

  return null;
}

export default ToolUseController;
