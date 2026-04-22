import { useEffect } from 'react';

import { useRoomVisibilityStore } from '../../stores/roomVisibilityStore';
import type { SceneId } from '../../types';

export type RoomPortalProps = {
  id: string;
  sceneId: SceneId;
  fromRoomId: string;
  toRoomId: string;
  position: [number, number, number];
  radius?: number;
  revealDistance?: number;
};

export function RoomPortal({
  id,
  sceneId,
  fromRoomId,
  toRoomId,
  position,
  radius,
  revealDistance,
}: RoomPortalProps) {
  const registerPortal = useRoomVisibilityStore((s) => s.registerPortal);
  const unregisterPortal = useRoomVisibilityStore((s) => s.unregisterPortal);

  useEffect(() => {
    registerPortal({ id, sceneId, fromRoomId, toRoomId, position, radius, revealDistance });
    return () => unregisterPortal(id);
  }, [id, sceneId, fromRoomId, toRoomId, position, radius, revealDistance, registerPortal, unregisterPortal]);

  return null;
}

export default RoomPortal;
