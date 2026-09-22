import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';

import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { useGaesupRuntime } from '../../../runtime/runtimeContext';
import { computeVisibleRoomIds, findContainingRoomId, ROOM_VISIBILITY_UPDATE_INTERVAL } from '../../room/core';
import { useRoomVisibilityStore } from '../../stores/roomVisibilityStore';
import { useSceneStore } from '../../stores/sceneStore';

export function RoomVisibilityDriver() {
  const runtime = useGaesupRuntime();
  const currentScene = useSceneStore((s) => s.current);
  const rooms = useRoomVisibilityStore((s) => s.rooms);
  const portals = useRoomVisibilityStore((s) => s.portals);
  const roomList = useMemo(() => Array.from(rooms.values()), [rooms]);
  const portalList = useMemo(() => Array.from(portals.values()), [portals]);
  const setVisibleRooms = useRoomVisibilityStore((s) => s.setVisibleRooms);
  const reset = useRoomVisibilityStore((s) => s.reset);
  const { position } = usePlayerPosition({ updateInterval: 50, reactive: false });
  const accumRef = useRef(0);

  useEffect(() => reset, [reset]);

  useFrame((_, delta) => {
    if (runtime && !runtime.isActive()) { accumRef.current = 0; return; }
    accumRef.current += Math.max(0, delta);
    if (accumRef.current < ROOM_VISIBILITY_UPDATE_INTERVAL) return;
    accumRef.current = 0;

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
