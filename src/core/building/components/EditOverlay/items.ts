import type * as THREE from 'three';

import { tileWorldSize } from '../../model/footprint';
import type { BuildingBlockConfig, TileConfig, TileGroupConfig, WallConfig, WallGroupConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { getBlockTransform } from '../BlockSystem/layout';

export type EditOverlayItem = { id: string; position: THREE.Vector3Tuple; scale: THREE.Vector3Tuple };
export type EditOverlayMode = 'tile' | 'wall' | 'block';

/** A wire box a little inside the tile, tall enough to see on flat ground. */
export function tileEditItem(tile: TileConfig): EditOverlayItem {
  const size = tileWorldSize(tile) * 0.82;
  const height = Math.max(0.22, tile.position.y + 0.22);
  return { id: tile.id, position: [tile.position.x, height / 2, tile.position.z], scale: [size, height, size] };
}

/** A marker floating half a meter above the wall. */
export function wallEditItem(wall: WallConfig): EditOverlayItem {
  const y = wall.position.y + TILE_CONSTANTS.WALL_SIZES.HEIGHT + 0.5;
  return { id: wall.id, position: [wall.position.x, y, wall.position.z], scale: [1, 1, 1] };
}

/** A wire box a little inside the block. */
export function blockEditItem(block: BuildingBlockConfig): EditOverlayItem {
  const { position, scale } = getBlockTransform(block);
  return { id: block.id, position, scale: [scale[0] * 0.82, scale[1] * 0.82, scale[2] * 0.82] };
}

/** The overlay items of every group the edit mode works on; none outside tile, wall and block editing. */
export function buildingEditItems(
  mode: string,
  tileGroups: readonly TileGroupConfig[],
  wallGroups: readonly WallGroupConfig[],
  blocks: readonly BuildingBlockConfig[],
): EditOverlayItem[] {
  if (mode === 'tile') return tileGroups.flatMap((group) => group.tiles.map(tileEditItem));
  if (mode === 'wall') return wallGroups.flatMap((group) => group.walls.map(wallEditItem));
  if (mode === 'block') return blocks.map(blockEditItem);
  return [];
}
