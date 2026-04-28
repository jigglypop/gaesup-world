import { TileGroupConfig, MeshConfig } from '../../types';

export type TileSystemProps = {
  tileGroup: TileGroupConfig;
  meshes: Map<string, MeshConfig>;
  isEditMode?: boolean;
  selectedTileId?: string | null;
  onTileClick?: (tileId: string) => void;
  onTileDelete?: (tileId: string) => void;
} 