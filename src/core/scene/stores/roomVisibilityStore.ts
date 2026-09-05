import { create } from 'zustand';

import type { RoomDescriptor, RoomPortalDescriptor, SceneId } from '../types';

type RoomVisibilityState = {
  rooms: Map<string, RoomDescriptor>;
  portals: Map<string, RoomPortalDescriptor>;
  currentRoomId: string | null;
  visibleRoomIds: Set<string>;
  initializedSceneId: SceneId | null;

  registerRoom: (room: RoomDescriptor) => void;
  unregisterRoom: (roomId: string) => void;
  registerPortal: (portal: RoomPortalDescriptor) => void;
  unregisterPortal: (portalId: string) => void;
  setVisibleRooms: (sceneId: SceneId, currentRoomId: string | null, visibleRoomIds: Set<string>) => void;
  reset: () => void;
};

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

export const useRoomVisibilityStore = create<RoomVisibilityState>((set) => ({
  rooms: new Map(),
  portals: new Map(),
  currentRoomId: null,
  visibleRoomIds: new Set(),
  initializedSceneId: null,

  registerRoom: (room) =>
    set((state) => {
      const next = new Map(state.rooms);
      next.set(room.id, room);
      return { rooms: next };
    }),

  unregisterRoom: (roomId) =>
    set((state) => {
      if (!state.rooms.has(roomId)) return state;
      const next = new Map(state.rooms);
      next.delete(roomId);
      return {
        rooms: next,
        currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
      };
    }),

  registerPortal: (portal) =>
    set((state) => {
      const next = new Map(state.portals);
      next.set(portal.id, portal);
      return { portals: next };
    }),

  unregisterPortal: (portalId) =>
    set((state) => {
      if (!state.portals.has(portalId)) return state;
      const next = new Map(state.portals);
      next.delete(portalId);
      return { portals: next };
    }),

  setVisibleRooms: (sceneId, currentRoomId, visibleRoomIds) =>
    set((state) => {
      if (
        state.initializedSceneId === sceneId &&
        state.currentRoomId === currentRoomId &&
        sameSet(state.visibleRoomIds, visibleRoomIds)
      ) {
        return state;
      }
      return {
        initializedSceneId: sceneId,
        currentRoomId,
        visibleRoomIds,
      };
    }),

  reset: () =>
    set({
      currentRoomId: null,
      visibleRoomIds: new Set(),
      initializedSceneId: null,
    }),
}));
