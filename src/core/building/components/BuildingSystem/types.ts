export type BuildingSystemProps = {
  /** Keep material batches resident on native WebGPU; original meshes handle picking/shadows. */
  gpuResident?: boolean;
  showGrid?: boolean | undefined;
  onWallClick?: (wallId: string) => void;
  onTileClick?: (tileId: string) => void;
  onBlockClick?: (blockId: string) => void;
  onWallDelete?: (wallId: string) => void;
  onTileDelete?: (tileId: string) => void;
  onBlockDelete?: (blockId: string) => void;
};
