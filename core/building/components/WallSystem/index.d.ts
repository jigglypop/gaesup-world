import { WallSystemProps } from './types';
import { WallConfig } from '../../types';
export declare function getWallMaterialKey(wall: WallConfig): string;
export declare function WallSystem({ wallGroup, wallGroups, meshes, isEditMode, selectedWallId, onWallClick, }: WallSystemProps): import("react").JSX.Element;
