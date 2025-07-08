import { WallGroupConfig, MeshConfig } from '../../types';

export type WallSystemProps = {
  wallGroup: WallGroupConfig;
  meshes: Map<string, MeshConfig>;
  isEditMode?: boolean;
  onWallClick?: (wallId: string) => void;
  onWallDelete?: (wallId: string) => void;
} 