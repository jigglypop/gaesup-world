import type { BuildingBlockConfig, MeshConfig } from '../../types';

export interface BlockSystemProps {
  blocks: BuildingBlockConfig[];
  meshes: Map<string, MeshConfig>;
  isEditMode?: boolean;
  onBlockClick?: (blockId: string) => void;
}
