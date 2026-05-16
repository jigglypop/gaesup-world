import { type ReactNode } from 'react';
import type { RoomBounds, SceneId } from '../../types';
export type RoomRootProps = {
    sceneId: SceneId;
    roomId: string;
    bounds: RoomBounds;
    children: ReactNode;
};
export declare function RoomRoot({ sceneId, roomId, bounds, children }: RoomRootProps): import("react").JSX.Element | null;
export default RoomRoot;
