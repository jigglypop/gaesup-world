import React, { useCallback, useMemo } from 'react';

import { Interactable, useDialogStore, useNpcSchedule } from '../../../src';

export type NPCBeaconProps = {
  id: string;
  name: string;
  position: [number, number, number];
  accentColor?: string;
  dialogTreeId: string;
  onInteract?: (id: string) => void;
};

export function NPCBeacon({
  id,
  name,
  position,
  accentColor = '#7fc6ff',
  dialogTreeId,
  onInteract,
}: NPCBeaconProps) {
  const start = useDialogStore((s) => s.start);
  const slot = useNpcSchedule(id);

  const liveDialogTreeId = slot?.dialogTreeId ?? dialogTreeId;

  const onActivate = useCallback(() => {
    onInteract?.(id);
    start(liveDialogTreeId, {
      context: { npcId: id },
    });
  }, [start, liveDialogTreeId, id, onInteract]);

  const livePos: [number, number, number] = useMemo(() => slot?.position ?? position, [slot?.position, position]);

  return (
    <Interactable
      id={`npc:${id}`}
      kind="npc"
      label={`${name} 대화`}
      range={2.6}
      activationKey="e"
      position={livePos}
      onActivate={onActivate}
    >
      <group position={[0, 0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.025, 8, 32]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.85} />
        </mesh>
        <mesh castShadow position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.58, 10]} />
          <meshToonMaterial color="#f6e7b8" />
        </mesh>
        <mesh castShadow position={[0, 0.82, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshToonMaterial color={accentColor} />
        </mesh>
      </group>
    </Interactable>
  );
}

export default NPCBeacon;
