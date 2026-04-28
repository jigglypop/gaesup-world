import { WallGroupConfig, MeshConfig } from '../../types';

export type WallSystemProps = {
  wallGroup: WallGroupConfig;
  meshes: Map<string, MeshConfig>;
  isEditMode?: boolean;
  selectedWallId?: string | null;
  onWallClick?: (wallId: string) => void;
  onWallDelete?: (wallId: string) => void;
} 