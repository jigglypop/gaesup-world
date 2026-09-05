import { useEffect } from 'react';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { getToolEvents } from '../core/ToolEvents';
import type { ToolKind, ToolUseHandler } from '../types';

export function useToolUse(kind: ToolKind, handler: ToolUseHandler, enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const off = getToolEvents().on(kind, handler);
    return off;
  }, [kind, handler, enabled]);
}

export function useEquippedToolKind(): ToolKind | null {
  const equipped = useInventoryStore((s) => s.getEquipped());
  if (!equipped) return null;
  const def = getItemRegistry().get(equipped.itemId);
  return def?.toolKind ?? null;
}
