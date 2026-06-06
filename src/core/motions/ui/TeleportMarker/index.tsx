import { ThreeEvent } from '@react-three/fiber';

import { useTeleport } from '../../../hooks/useTeleport';
import {
  teleportDestinationToVector3,
  type TeleportDestination,
} from '../../teleportDestinations';

export type TeleportMarkerProps = {
  destination: TeleportDestination;
  enabled?: boolean;
  yOffset?: number;
  onTeleport?: (destination: TeleportDestination, event: ThreeEvent<PointerEvent>) => void;
};

export function TeleportMarker({
  destination,
  enabled = true,
  yOffset = 0,
  onTeleport,
}: TeleportMarkerProps) {
  const { teleport, canTeleport } = useTeleport();
  const position = teleportDestinationToVector3(destination);
  position.y += yOffset;

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!enabled || !canTeleport) return;
    event.stopPropagation();
    teleport(position);
    onTeleport?.(destination, event);
  };

  return (
    <group position={position} userData={{ teleportMarker: true, destinationId: destination.id }}>
      <mesh
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        castShadow
      >
        <ringGeometry args={[destination.radius * 0.58, destination.radius, 32]} />
        <meshBasicMaterial color={destination.markerColor} transparent opacity={0.52} />
      </mesh>
      <mesh position={[0, 0.34, 0]} onPointerDown={handlePointerDown} castShadow>
        <cylinderGeometry args={[0.12, 0.24, 0.55, 16]} />
        <meshStandardMaterial color={destination.markerColor} roughness={0.45} metalness={0.1} />
      </mesh>
    </group>
  );
}
