import { blockBox } from '../../model/footprint';
import type { BuildingBlockConfig } from '../../types';
import type { BuildingColliderBox } from '../BuildingColliders/types';

export type BlockTransform = {
  position: [number, number, number];
  scale: [number, number, number];
};

export function getBlockTransform(block: BuildingBlockConfig): BlockTransform {
  const { center, half } = blockBox(block);
  return { position: [...center], scale: [half[0] * 2, half[1] * 2, half[2] * 2] };
}

export function createBlockColliders(blocks: readonly BuildingBlockConfig[]): BuildingColliderBox[] {
  return blocks.map((block) => {
    const { center, half } = blockBox(block);
    return { key: block.id, position: [...center], rotation: [0, 0, 0], args: [...half] };
  });
}
