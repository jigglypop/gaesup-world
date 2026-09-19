import { useEffect } from 'react';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime/runtimeContext';
import { getToolEvents } from '../core/ToolEvents';
import type { ToolKind, ToolUseHandler } from '../types';

export function useToolUse(kind: ToolKind, handler: ToolUseHandler, enabled: boolean = true): void {
  const runtime = useGaesupRuntime();
  const revision = useGaesupRuntimeRevision();
  const events = useToolEvents();
  useEffect(() => {
    if (!enabled || (runtime && !runtime.isActive())) return;
    const off = events.on(kind, handler);
    return off;
  }, [kind, handler, enabled, events, runtime, revision]);
}

export function useToolEvents() {
  return useGaesupRuntime()?.toolEvents ?? getToolEvents();
}

export function useEquippedToolKind(): ToolKind | null {
  const equipped = useInventoryStore((s) => s.getEquipped());
  if (!equipped) return null;
  const def = getItemRegistry().get(equipped.itemId);
  return def?.toolKind ?? null;
}
