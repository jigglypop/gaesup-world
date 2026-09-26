import type { BuildingBlockConfig, TileConfig, TileGroupConfig, WallGroupConfig } from '../../types';

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
  group: WallGroupConfig;
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
