import type { BuildingBlockConfig, MeshConfig } from '../../types';

export interface BlockSystemProps {
  blocks: BuildingBlockConfig[];
  meshes: Map<string, MeshConfig>;
  isEditMode?: boolean;
  selectedBlockId?: string | null;
  onBlockClick?: (blockId: string) => void;
}
