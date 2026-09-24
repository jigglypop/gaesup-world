import type { BuildingBlockConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import type { BuildingColliderBox } from '../BuildingColliders/types';

export type BlockTransform = {
  position: [number, number, number];
  scale: [number, number, number];
};

function getBlockDimensions(block: BuildingBlockConfig): { width: number; height: number; depth: number } {
  return {
    width: Math.max(1, Math.round(block.size?.x ?? 1)) * TILE_CONSTANTS.GRID_CELL_SIZE,
    height: Math.max(1, Math.round(block.size?.y ?? 1)) * TILE_CONSTANTS.HEIGHT_STEP,
    depth: Math.max(1, Math.round(block.size?.z ?? 1)) * TILE_CONSTANTS.GRID_CELL_SIZE,
  };
}

export function getBlockTransform(block: BuildingBlockConfig): BlockTransform {
  const { width, height, depth } = getBlockDimensions(block);
  return {
    position: [
      block.position.x - TILE_CONSTANTS.GRID_CELL_SIZE * 0.5 + width * 0.5,
      block.position.y + height * 0.5,
      block.position.z - TILE_CONSTANTS.GRID_CELL_SIZE * 0.5 + depth * 0.5,
    ],
    scale: [width, height, depth],
  };
}

export function createBlockColliders(blocks: readonly BuildingBlockConfig[]): BuildingColliderBox[] {
  return blocks.map((block) => {
    const { position, scale } = getBlockTransform(block);
    return {
      key: block.id,
      position,
      rotation: [0, 0, 0],
      args: [scale[0] * 0.5, scale[1] * 0.5, scale[2] * 0.5],
    };
  });
}
