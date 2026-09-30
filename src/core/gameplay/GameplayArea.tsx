import { useEffect } from 'react';

import type { GameplayAreaConfig } from './events/areas';
import { useGaesupRuntime } from '../runtime/runtimeContext';

/**
 * A trigger box in the nearest world: when the player enters it, the rule engine receives
 * `{ type: 'enterArea', areaId: id }`. Renders nothing, and does nothing outside a runtime.
 */
export function GameplayArea({ id, center, size }: GameplayAreaConfig) {
  const areas = useGaesupRuntime()?.gameplayAreas;
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size;
  useEffect(() => areas?.register({ id, center: [cx, cy, cz], size: [sx, sy, sz] }), [areas, id, cx, cy, cz, sx, sy, sz]);
  return null;
}
