import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { useTeleport } from '../../../hooks/useTeleport';

export type TeleportClickModifier = 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'none';

export type TeleportOnClickProps = {
  enabled?: boolean;
  modifierKey?: TeleportClickModifier;
  yOffset?: number;
  size?: number;
  position?: [number, number, number];
  onTeleport?: (position: THREE.Vector3, event: ThreeEvent<MouseEvent>) => void;
};

function isModifierSatisfied(event: ThreeEvent<MouseEvent>, modifierKey: TeleportClickModifier): boolean {
  if (modifierKey === 'none') return true;
  return event.nativeEvent[modifierKey] === true;
}

export function TeleportOnClick({
  enabled = true,
  modifierKey = 'altKey',
  yOffset = 0,
  size = 1000,
  position = [0, 0, 0],
  onTeleport,
}: TeleportOnClickProps) {
  const { teleport, canTeleport } = useTeleport();

  const handlePointerDown = (event: ThreeEvent<MouseEvent>) => {
    if (!enabled || !canTeleport || !isModifierSatisfied(event, modifierKey)) return;

    event.stopPropagation();
    const nextPosition = event.point.clone();
    nextPosition.y += yOffset;
    teleport(nextPosition);
    onTeleport?.(nextPosition, event);
  };

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={handlePointerDown}
      visible={enabled}
      userData={{ intangible: true, teleportOnClick: true }}
    >
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  );
}
