import type {
  BuildingBlockConfig,
  MeshConfig,
  PlacedObject,
  TileGroupConfig,
  WallGroupConfig,
} from '../../building/types';

export type BuildingVoxelSource = {
  meshes: ReadonlyMap<string, MeshConfig>;
  tileGroups: ReadonlyMap<string, TileGroupConfig>;
  wallGroups: ReadonlyMap<string, WallGroupConfig>;
  blocks: readonly BuildingBlockConfig[];
  objects: readonly PlacedObject[];
};

export type WallPiece = {
  center: readonly [number, number, number];
  size: readonly [number, number, number];
};
