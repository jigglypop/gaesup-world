import type { RoomBounds, RoomDescriptor, RoomPortalDescriptor, SceneId } from '../types';

export const ROOM_VISIBILITY_UPDATE_INTERVAL = 0.12;

type Vec3 = { x: number; y: number; z: number };

export function pointInRoomBounds(position: Vec3, bounds: RoomBounds): boolean {
  return (
    position.x >= bounds.min[0] &&
    position.x <= bounds.max[0] &&
    position.y >= bounds.min[1] &&
    position.y <= bounds.max[1] &&
    position.z >= bounds.min[2] &&
    position.z <= bounds.max[2]
  );
}

export function findContainingRoomId(
  sceneId: SceneId,
  rooms: RoomDescriptor[],
  position: Vec3,
): string | null {
  for (const room of rooms) {
    if (room.sceneId !== sceneId) continue;
    if (pointInRoomBounds(position, room.bounds)) return room.id;
  }
  return null;
}

export function computeVisibleRoomIds(args: {
  sceneId: SceneId;
  rooms: RoomDescriptor[];
  portals: RoomPortalDescriptor[];
  position: Vec3;
}): Set<string> {
  const sceneRooms = args.rooms.filter((room) => room.sceneId === args.sceneId);
  if (sceneRooms.length === 0) return new Set<string>();

  const currentRoomId = findContainingRoomId(args.sceneId, sceneRooms, args.position);
  if (!currentRoomId) {
    return new Set(sceneRooms.map((room) => room.id));
  }

  const visible = new Set<string>([currentRoomId]);
  const scenePortals = args.portals.filter((portal) => portal.sceneId === args.sceneId);

  for (const portal of scenePortals) {
    const revealDistance = portal.revealDistance ?? 3.8;
    const dx = args.position.x - portal.position[0];
    const dy = args.position.y - portal.position[1];
    const dz = args.position.z - portal.position[2];
    const distanceSq = dx * dx + dy * dy + dz * dz;
    if (distanceSq > revealDistance * revealDistance) continue;

    if (portal.fromRoomId === currentRoomId) {
      visible.add(portal.toRoomId);
    } else if (portal.toRoomId === currentRoomId) {
      visible.add(portal.fromRoomId);
    }
  }

  return visible;
}
