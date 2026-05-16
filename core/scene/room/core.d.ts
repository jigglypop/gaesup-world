import type { RoomBounds, RoomDescriptor, RoomPortalDescriptor, SceneId } from '../types';
export declare const ROOM_VISIBILITY_UPDATE_INTERVAL = 0.12;
type Vec3 = {
    x: number;
    y: number;
    z: number;
};
export declare function pointInRoomBounds(position: Vec3, bounds: RoomBounds): boolean;
export declare function findContainingRoomId(sceneId: SceneId, rooms: RoomDescriptor[], position: Vec3): string | null;
export declare function computeVisibleRoomIds(args: {
    sceneId: SceneId;
    rooms: RoomDescriptor[];
    portals: RoomPortalDescriptor[];
    position: Vec3;
}): Set<string>;
export {};
