import React, { useCallback, useState } from 'react';

import { Interactable, useInventoryStore } from '../../../src';
import { getItemRegistry } from '../../../src/core/items';

export type PickupProps = {
  id?: string;
  itemId: string;
  count?: number;
  position: [number, number, number];
  label?: string;
};

export function Pickup({ id, itemId, count = 1, position, label }: PickupProps) {
  const [taken, setTaken] = useState(false);
  const add = useInventoryStore((s) => s.add);
  const def = getItemRegistry().get(itemId);
  const color = def?.color ?? '#cccccc';

  const onActivate = useCallback(() => {
    if (taken) return;
    const remaining = add(itemId, count);
    if (remaining < count) setTaken(true);
  }, [add, itemId, count, taken]);

  if (taken) return null;
  return (
    <Interactable
      id={id}
      kind="pickup"
      label={label ?? `${def?.name ?? itemId} 줍기`}
      range={2.4}
      activationKey="e"
      position={position}
      onActivate={onActivate}
    >
      <mesh castShadow position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshToonMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.04, 0.12, 6]} />
        <meshToonMaterial color="#3a6b2a" />
      </mesh>
    </Interactable>
  );
}

export default Pickup;
