import * as THREE from 'three';

export type TeleportDestinationInput = {
  id: string;
  name: string;
  position: [number, number, number] | THREE.Vector3 | { x: number; y: number; z: number };
  radius?: number;
  markerColor?: string;
};

export type TeleportDestination = {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  markerColor: string;
};

function normalizePosition(
  position: TeleportDestinationInput['position'],
): [number, number, number] {
  if (position instanceof THREE.Vector3) {
    return [position.x, position.y, position.z];
  }
  if (Array.isArray(position)) {
    return [position[0], position[1], position[2]];
  }
  return [position.x, position.y, position.z];
}

export function createTeleportDestination(input: TeleportDestinationInput): TeleportDestination {
  return {
    id: input.id,
    name: input.name,
    position: normalizePosition(input.position),
    radius: input.radius ?? 1.4,
    markerColor: input.markerColor ?? '#61dafb',
  };
}

export function teleportDestinationToVector3(destination: TeleportDestination): THREE.Vector3 {
  const [x, y, z] = destination.position;
  return new THREE.Vector3(x, y, z);
}

export function findTeleportDestination(
  destinations: TeleportDestination[],
  id: string,
): TeleportDestination | undefined {
  return destinations.find((destination) => destination.id === id);
}
