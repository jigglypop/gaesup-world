import React, { useCallback, useMemo } from 'react';

import { Interactable, useDialogStore, useNpcSchedule } from '../../../src';

export type NPCBeaconProps = {
  id: string;
  name: string;
  position: [number, number, number];
  color?: string;
  hatColor?: string;
  dialogTreeId: string;
  onOpenShop?: () => void;
  onCustomEffect?: (key: string, payload?: unknown) => void;
  onInteract?: (id: string) => void;
};

export function NPCBeacon({
  id,
  name,
  position,
  color = '#f5d199',
  hatColor = '#a85a5a',
  dialogTreeId,
  onOpenShop,
  onCustomEffect,
  onInteract,
}: NPCBeaconProps) {
  const start = useDialogStore((s) => s.start);
  const slot = useNpcSchedule(id);

  const liveDialogTreeId = slot?.dialogTreeId ?? dialogTreeId;

  const onActivate = useCallback(() => {
    onInteract?.(id);
    start(liveDialogTreeId, {
      context: { npcId: id },
      onOpenShop: () => onOpenShop?.(),
      onCustomEffect: (eff) => onCustomEffect?.(eff.key, eff.payload),
    });
  }, [start, liveDialogTreeId, id, onOpenShop, onCustomEffect, onInteract]);

  const livePos: [number, number, number] = useMemo(() => slot?.position ?? position, [slot?.position, position]);

  return (
    <Interactable
      id={`npc:${id}`}
      kind="dialog"
      label={`${name}와 대화`}
      range={2.6}
      activationKey="e"
      position={livePos}
      onActivate={onActivate}
    >
      <group position={[0, 0.55, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.32, 0.34, 1.1, 14]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh castShadow position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.28, 18, 18]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh position={[0, 1.06, 0]}>
          <coneGeometry args={[0.32, 0.22, 14]} />
          <meshToonMaterial color={hatColor} />
        </mesh>
      </group>
    </Interactable>
  );
}

export default NPCBeacon;
