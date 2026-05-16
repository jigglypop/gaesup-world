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
export declare function RoomPortal({ id, sceneId, fromRoomId, toRoomId, position, radius, revealDistance, }: RoomPortalProps): null;
export default RoomPortal;
