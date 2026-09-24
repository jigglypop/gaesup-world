import { TileGroupConfig, MeshConfig } from '../../types';

export type TileSystemProps = {
  tileGroup: TileGroupConfig;
  meshes: Map<string, MeshConfig>;
  isEditMode?: boolean;
  selectedTileId?: string | null;
  onTileClick?: (tileId: string) => void;
  onTileDelete?: (tileId: string) => void;
  colliders?: boolean;
  /** Render box-tile batches here. `BuildingSystem` turns this off and batches box tiles for the whole world. */
  batches?: boolean;
} 