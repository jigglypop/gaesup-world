import { useEffect, useRef } from 'react';

import { useFrame } from '@react-three/fiber';

import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { computeVisibleRoomIds, findContainingRoomId, ROOM_VISIBILITY_UPDATE_INTERVAL } from '../../room/core';
import { useRoomVisibilityStore } from '../../stores/roomVisibilityStore';
import { useSceneStore } from '../../stores/sceneStore';

export function RoomVisibilityDriver() {
  const currentScene = useSceneStore((s) => s.current);
  const rooms = useRoomVisibilityStore((s) => s.rooms);
  const portals = useRoomVisibilityStore((s) => s.portals);
  const setVisibleRooms = useRoomVisibilityStore((s) => s.setVisibleRooms);
  const reset = useRoomVisibilityStore((s) => s.reset);
  const { position } = usePlayerPosition({ updateInterval: 50 });
  const accumRef = useRef(0);

  useEffect(() => reset, [reset]);

  useFrame((_, delta) => {
    accumRef.current += Math.max(0, delta);
    if (accumRef.current < ROOM_VISIBILITY_UPDATE_INTERVAL) return;
    accumRef.current = 0;

    const roomList = Array.from(rooms.values());
    const portalList = Array.from(portals.values());
    const currentRoomId = findContainingRoomId(currentScene, roomList, position);
    const visibleRoomIds = computeVisibleRoomIds({
      sceneId: currentScene,
      rooms: roomList,
      portals: portalList,
      position,
    });
    setVisibleRooms(currentScene, currentRoomId, visibleRoomIds);
  });

  return null;
}

export default RoomVisibilityDriver;
