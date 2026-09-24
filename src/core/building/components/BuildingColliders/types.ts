import type { BuildingBlockConfig, TileConfig, TileGroupConfig, WallConfig, WallGroupConfig } from '../../types';

export type BuildingColliderBox = {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  args: [number, number, number];
};

export type BuildingColliderBodyProps = {
  boxes: readonly BuildingColliderBox[];
};

export type TileGroupCollidersProps = {
  tiles: readonly TileConfig[];
};

export type WallGroupCollidersProps = {
  walls: readonly WallConfig[];
};

export type BlockCollidersProps = {
  blocks: readonly BuildingBlockConfig[];
};

export type BuildingCollidersProps = {
  tileGroups: Map<string, TileGroupConfig>;
  wallGroups: Map<string, WallGroupConfig>;
  blocks: readonly BuildingBlockConfig[];
  wallEditMode: boolean;
  blockEditMode: boolean;
};
