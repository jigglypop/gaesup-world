import { useEffect, type ReactNode } from 'react';

import { useSceneStore } from '../../stores/sceneStore';
import { useRoomVisibilityStore } from '../../stores/roomVisibilityStore';
import type { RoomBounds, SceneId } from '../../types';

export type RoomRootProps = {
  sceneId: SceneId;
  roomId: string;
  bounds: RoomBounds;
  children: ReactNode;
};

export function RoomRoot({ sceneId, roomId, bounds, children }: RoomRootProps) {
  const currentScene = useSceneStore((s) => s.current);
  const registerRoom = useRoomVisibilityStore((s) => s.registerRoom);
  const unregisterRoom = useRoomVisibilityStore((s) => s.unregisterRoom);
  const initializedSceneId = useRoomVisibilityStore((s) => s.initializedSceneId);
  const visibleRoomIds = useRoomVisibilityStore((s) => s.visibleRoomIds);

  useEffect(() => {
    registerRoom({ id: roomId, sceneId, bounds });
    return () => unregisterRoom(roomId);
  }, [roomId, sceneId, bounds, registerRoom, unregisterRoom]);

  if (currentScene !== sceneId) return null;
  if (initializedSceneId !== sceneId) return <>{children}</>;
  if (!visibleRoomIds.has(roomId)) return null;
  return <>{children}</>;
}

export default RoomRoot;
