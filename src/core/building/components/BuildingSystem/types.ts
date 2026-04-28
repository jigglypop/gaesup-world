export type BuildingSystemProps = {
  onWallClick?: (wallId: string) => void;
  onTileClick?: (tileId: string) => void;
  onBlockClick?: (blockId: string) => void;
  onWallDelete?: (wallId: string) => void;
  onTileDelete?: (tileId: string) => void;
  onBlockDelete?: (blockId: string) => void;
};
