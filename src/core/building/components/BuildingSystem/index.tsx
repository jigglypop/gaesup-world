import React, { Suspense, useMemo } from 'react';

import { NPCPreview } from '../../../npc/components/NPCPreview';
import { useBuildingStore } from '../../stores/buildingStore';
import { GridHelper } from '../GridHelper';
import { PreviewTile } from '../PreviewTile';
import { PreviewWall } from '../PreviewWall';
import { SakuraBatch, type SakuraTreeEntry } from '../mesh/sakura';
import { FlagBatch } from '../mesh/flag';
import { FireBatch, type FireBatchEntry } from '../mesh/fire';
import Billboard from '../mesh/billboard';
import { Snow } from '../mesh/snow';
import type { PlacedObject } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { TileSystem } from '../TileSystem';
import { WallSystem } from '../WallSystem';
import { BuildingSystemProps } from './types';

type ObjectBuckets = {
  sakura: SakuraTreeEntry[];
  flag: PlacedObject[];
  fire: FireBatchEntry[];
  billboard: PlacedObject[];
};

const EMPTY_BUCKETS: ObjectBuckets = {
  sakura: [],
  flag: [],
  fire: [],
  billboard: [],
};

function bucketObjects(objects: PlacedObject[] | undefined): ObjectBuckets {
  if (!objects || objects.length === 0) return EMPTY_BUCKETS;

  const buckets: ObjectBuckets = { sakura: [], flag: [], fire: [], billboard: [] };
  for (const o of objects) {
    if (o.type === 'sakura') {
      buckets.sakura.push({
        position: [o.position.x, o.position.y, o.position.z],
        size: o.config?.size ?? TILE_CONSTANTS.GRID_CELL_SIZE,
        ...(o.config?.primaryColor ? { blossomColor: o.config.primaryColor } : {}),
        ...(o.config?.secondaryColor ? { barkColor: o.config.secondaryColor } : {}),
      });
    } else if (o.type === 'flag') {
      buckets.flag.push(o);
    } else if (o.type === 'fire') {
      buckets.fire.push({
        position: [o.position.x, o.position.y, o.position.z],
        rotation: o.rotation ?? 0,
        intensity: o.config?.fireIntensity ?? 1.5,
        width: o.config?.fireWidth ?? 1.0,
        height: o.config?.fireHeight ?? 1.5,
        color: o.config?.fireColor ?? '#ffffff',
      });
    } else if (o.type === 'billboard') {
      buckets.billboard.push(o);
    }
  }
  return buckets;
}

export const BuildingSystem = React.memo(function BuildingSystem({
  onWallClick,
  onTileClick,
  onWallDelete,
  onTileDelete,
}: BuildingSystemProps) {
  // Field-level selectors so unrelated store updates (e.g. hoverPosition)
  // don't trigger a rerender of the entire scene tree.
  const meshes = useBuildingStore((s) => s.meshes);
  const wallGroups = useBuildingStore((s) => s.wallGroups);
  const tileGroups = useBuildingStore((s) => s.tileGroups);
  const editMode = useBuildingStore((s) => s.editMode);
  const showGrid = useBuildingStore((s) => s.showGrid);
  const gridSize = useBuildingStore((s) => s.gridSize);
  const showSnow = useBuildingStore((s) => s.showSnow);
  const objects = useBuildingStore((s) => s.objects);

  const wallGroupsArray = useMemo(() => Array.from(wallGroups.values()), [wallGroups]);
  const tileGroupsArray = useMemo(() => Array.from(tileGroups.values()), [tileGroups]);

  const buckets = useMemo(() => bucketObjects(objects), [objects]);
  const sakuraEntries = buckets.sakura;
  const flagObjects = buckets.flag;
  const fireEntries = buckets.fire;
  const billboardObjects = buckets.billboard;

  return (
    <Suspense fallback={null}>
      <group name="building-system">
        {showGrid && <GridHelper size={gridSize} />}
        
        <PreviewTile />
        <PreviewWall />
        <NPCPreview />
        
        {wallGroupsArray.map((wallGroup) => (
          <WallSystem
            key={wallGroup.id}
            wallGroup={wallGroup}
            meshes={meshes}
            isEditMode={editMode === 'wall'}
            {...(onWallClick ? { onWallClick } : {})}
            {...(onWallDelete ? { onWallDelete } : {})}
          />
        ))}
        
        {tileGroupsArray.map((tileGroup) => (
          <TileSystem
            key={tileGroup.id}
            tileGroup={tileGroup}
            meshes={meshes}
            isEditMode={editMode === 'tile'}
            {...(onTileClick ? { onTileClick } : {})}
            {...(onTileDelete ? { onTileDelete } : {})}
          />
        ))}

        {sakuraEntries.length > 0 && (
          <Suspense fallback={null}>
            <SakuraBatch trees={sakuraEntries} />
          </Suspense>
        )}

        {flagObjects.length > 0 && (
          <Suspense fallback={null}>
            <FlagBatch flags={flagObjects} />
          </Suspense>
        )}

        {fireEntries.length > 0 && (
          <Suspense fallback={null}>
            <FireBatch fires={fireEntries} />
          </Suspense>
        )}

        {billboardObjects.map((obj) => (
          <group
            key={obj.id}
            position={[obj.position.x, obj.position.y, obj.position.z]}
            rotation={[0, obj.rotation ?? 0, 0]}
          >
            <Suspense fallback={null}>
              <Billboard
                {...(obj.config?.billboardText ? { text: obj.config.billboardText } : {})}
                {...(obj.config?.billboardImageUrl ? { imageUrl: obj.config.billboardImageUrl } : {})}
                {...(obj.config?.billboardColor ? { color: obj.config.billboardColor } : {})}
              />
            </Suspense>
          </group>
        ))}

        {showSnow && <Snow />}
      </group>
    </Suspense>
  );
});
