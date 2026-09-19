import { useEffect } from 'react';

import { useWorldInputActions } from '../../../input/useWorldInputActions';
import { useInventoryStoreApi } from '../../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { useToolEvents } from '../../hooks/useToolUse';

export type ToolUseControllerProps = { useKey?: string; range?: number; cooldownMs?: number };

export function ToolUseController({ useKey = 'f', range = 2.4, cooldownMs = 350 }: ToolUseControllerProps = {}): null {
  const actions = useWorldInputActions();
  const inventoryStore = useInventoryStoreApi();
  const toolEvents = useToolEvents();
  const { position, rotation } = usePlayerPosition({ reactive: false });

  useEffect(() => actions.register('tool.use', {
    key: useKey,
    cooldownMs,
    execute: ({ timestamp }) => {
      const equipped = inventoryStore.getState().getEquipped();
      if (!equipped) return false;
      const kind = getItemRegistry().get(equipped.itemId)?.toolKind;
      if (!kind) return false;
      const yaw = rotation?.y ?? 0;
      toolEvents.emit({ kind, origin: [position.x, position.y, position.z], direction: [Math.sin(yaw), 0, Math.cos(yaw)], range, timestamp });
      return true;
    },
  }), [actions, useKey, cooldownMs, range, position, rotation, inventoryStore, toolEvents]);
  return null;
}

export default ToolUseController;
