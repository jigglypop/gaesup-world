import { memo, useMemo } from 'react';

import { CuboidCollider, RigidBody } from '@react-three/rapier';

import type {
  BlockCollidersProps,
  BuildingColliderBodyProps,
  BuildingCollidersProps,
  TileGroupCollidersProps,
  WallGroupCollidersProps,
} from './types';
import { createBlockColliders } from '../BlockSystem/layout';
import { createTileColliders } from '../TileSystem/layout';
import { createWallColliders } from '../WallSystem/colliders';

export function BuildingColliderBody({ boxes }: BuildingColliderBodyProps) {
  if (boxes.length === 0) return null;
  return (
    <RigidBody type="fixed" colliders={false}>
      {boxes.map((box) => (
        <CuboidCollider key={box.key} position={box.position} rotation={box.rotation} args={box.args} />
      ))}
    </RigidBody>
  );
}

const TileGroupColliders = memo(function TileGroupColliders({ tiles }: TileGroupCollidersProps) {
  const boxes = useMemo(() => createTileColliders(tiles), [tiles]);
  return <BuildingColliderBody boxes={boxes} />;
});

const WallGroupColliders = memo(function WallGroupColliders({ walls }: WallGroupCollidersProps) {
  const boxes = useMemo(() => createWallColliders(walls), [walls]);
  return <BuildingColliderBody boxes={boxes} />;
});

const BlockColliders = memo(function BlockColliders({ blocks }: BlockCollidersProps) {
  const boxes = useMemo(() => createBlockColliders(blocks), [blocks]);
  return <BuildingColliderBody boxes={boxes} />;
});

/**
 * Canonical owner of building physics. Colliders follow persistent building data,
 * not render visibility, so culled groups keep blocking bodies outside the camera view.
 */
export const BuildingColliders = memo(function BuildingColliders({
  tileGroups,
  wallGroups,
  blocks,
  wallEditMode,
  blockEditMode,
}: BuildingCollidersProps) {
  const tileGroupList = useMemo(() => Array.from(tileGroups.values()), [tileGroups]);
  const wallGroupList = useMemo(() => Array.from(wallGroups.values()), [wallGroups]);
  return (
    <>
      {tileGroupList.map((group) => (
        <TileGroupColliders key={group.id} tiles={group.tiles} />
      ))}
      {!wallEditMode && wallGroupList.map((group) => (
        <WallGroupColliders key={group.id} walls={group.walls} />
      ))}
      {!blockEditMode && <BlockColliders blocks={blocks} />}
    </>
  );
});
