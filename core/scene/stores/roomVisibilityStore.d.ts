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
export declare const useRoomVisibilityStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RoomVisibilityState>>;
export {};
