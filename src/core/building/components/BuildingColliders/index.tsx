import { memo, useEffect, useMemo } from 'react';

import { useRapier } from '@react-three/rapier';
import { Euler, Quaternion } from 'three';

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

const euler = new Euler();
const quaternion = new Quaternion();

/**
 * Static world colliders without a parent body or scene-graph object: nothing is traversed per frame or
 * iterated after each step, and a changed box list replaces exactly this list's colliders.
 */
export function BuildingColliderBody({ boxes }: BuildingColliderBodyProps) {
  const { world, rapier } = useRapier();
  useEffect(() => {
    const colliders = boxes.map((box) => {
      quaternion.setFromEuler(euler.set(box.rotation[0], box.rotation[1], box.rotation[2]));
      return world.createCollider(
        rapier.ColliderDesc.cuboid(box.args[0], box.args[1], box.args[2])
          .setTranslation(box.position[0], box.position[1], box.position[2])
          .setRotation(quaternion),
      );
    });
    return () => {
      for (const collider of colliders) {
        if (world.getCollider(collider.handle)) world.removeCollider(collider, true);
      }
    };
  }, [boxes, rapier, world]);
  return null;
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
