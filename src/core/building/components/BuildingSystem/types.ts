export type BuildingSystemProps = {
  onWallClick?: (wallId: string) => void;
  onTileClick?: (tileId: string) => void;
  onWallDelete?: (wallId: string) => void;
  onTileDelete?: (tileId: string) => void;
} 