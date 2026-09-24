import React, { Suspense, useMemo, useRef } from 'react';

import type { Group } from 'three';

import { BuildingSystemProps } from './types';
import { NPCPreview } from '../../../npc/components/NPCPreview';
import { GpuBatchBridge } from '../../../rendering/GpuBatchBridge';
import { WeatherEffect } from '../../../weather';
import { useBuildingStore } from '../../stores/buildingStore';
import type { BuildingBlockConfig, BuildingTreeKind, PlacedObject } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { useBuildingVisibilityStore } from '../../visibility/store';
import { BlockSystem } from '../BlockSystem';
import { BuildingBatches } from '../BuildingBatches';
import { BuildingColliders } from '../BuildingColliders';
import { GridHelper } from '../GridHelper';
import { BillboardBatch } from '../mesh/billboard';
import { FireBatch, type FireBatchEntry } from '../mesh/fire';
import { FlagBatch } from '../mesh/flag';
import { GrassDriver } from '../mesh/grass/GrassDriver';
import ModelObject from '../mesh/model';
import { SakuraBatch, type SakuraTreeEntry } from '../mesh/sakura';
import { Snow } from '../mesh/snow';
import { PreviewBlock } from '../PreviewBlock';
import { PreviewTile } from '../PreviewTile';
import { PreviewWall } from '../PreviewWall';
import { TileSystem } from '../TileSystem';
import { WallSystem } from '../WallSystem';

type ObjectBuckets = {
  sakura: SakuraTreeEntry[];
  flag: PlacedObject[];
  fire: FireBatchEntry[];
  billboard: PlacedObject[];
  model: PlacedObject[];
};

function isTreeObject(object: PlacedObject): boolean {
  return object.type === 'tree' || object.type === 'sakura';
}

function resolveTreeKind(object: PlacedObject): BuildingTreeKind {
  return object.type === 'sakura' ? 'sakura' : object.config?.treeKind ?? 'oak';
}

const EMPTY_BLOCKS: readonly BuildingBlockConfig[] = [];

const EMPTY_BUCKETS: ObjectBuckets = {
  sakura: [],
  flag: [],
  fire: [],
  billboard: [],
  model: [],
};

function bucketObjects(objects: PlacedObject[] | undefined): ObjectBuckets {
  if (!objects || objects.length === 0) return EMPTY_BUCKETS;

  const buckets: ObjectBuckets = { sakura: [], flag: [], fire: [], billboard: [], model: [] };
  for (const o of objects) {
    if (isTreeObject(o)) {
      buckets.sakura.push({
        position: [o.position.x, o.position.y, o.position.z],
        size: o.config?.size ?? TILE_CONSTANTS.GRID_CELL_SIZE,
        treeKind: resolveTreeKind(o),
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
    } else if (o.type === 'model') {
      buckets.model.push(o);
    }
  }
  return buckets;
}

export const BuildingSystem = React.memo(function BuildingSystem({
  gpuResident = false,
  showGrid: gridVisibility,
  onWallClick,
  onTileClick,
  onBlockClick,
  onWallDelete,
  onTileDelete,
  onBlockDelete,
}: BuildingSystemProps) {
  const renderRoot = useRef<Group>(null);
  // Field-level selectors so unrelated store updates (e.g. hoverPosition)
  // don't trigger a rerender of the entire scene tree.
  const meshes = useBuildingStore((s) => s.meshes);
  const wallGroups = useBuildingStore((s) => s.wallGroups);
  const tileGroups = useBuildingStore((s) => s.tileGroups);
  const blocks = useBuildingStore((s) => s.blocks);
  const editMode = useBuildingStore((s) => s.editMode);
  const selectedWallId = useBuildingStore((s) => s.selectedWallId);
  const selectedTileId = useBuildingStore((s) => s.selectedTileId);
  const selectedBlockId = useBuildingStore((s) => s.selectedBlockId);
  const showGrid = useBuildingStore((s) => s.showGrid);
  const gridSize = useBuildingStore((s) => s.gridSize);
  const showSnow = useBuildingStore((s) => s.showSnow);
  const weatherEffect = useBuildingStore((s) => s.weatherEffect);
  const objects = useBuildingStore((s) => s.objects);
  const visibilityReady = useBuildingVisibilityStore((s) => !gpuResident && s.initialized);
  const visibleWallGroupIds = useBuildingVisibilityStore((s) => s.visibleWallGroupIds);
  const visibleTileGroupIds = useBuildingVisibilityStore((s) => s.visibleTileGroupIds);
  const visibleBlockIds = useBuildingVisibilityStore((s) => s.visibleBlockIds);
  const visibleObjectIds = useBuildingVisibilityStore((s) => s.visibleObjectIds);

  const wallGroupsArray = useMemo(() => {
    const groups = Array.from(wallGroups.values());
    return visibilityReady ? groups.filter((group) => visibleWallGroupIds.has(group.id)) : groups;
  }, [wallGroups, visibilityReady, visibleWallGroupIds]);
  const tileGroupsArray = useMemo(() => {
    const groups = Array.from(tileGroups.values());
    return visibilityReady ? groups.filter((group) => visibleTileGroupIds.has(group.id)) : groups;
  }, [tileGroups, visibilityReady, visibleTileGroupIds]);
  const visibleBlocks = useMemo(() => {
    const list = blocks ?? [];
    return visibilityReady ? list.filter((block) => visibleBlockIds.has(block.id)) : list;
  }, [blocks, visibilityReady, visibleBlockIds]);
  // Batched objects draw in a fixed number of calls however many there are, so they are built once from every
  // object and residency changes never rebuild them. Only per-object models follow residency.
  const buckets = useMemo(() => bucketObjects(objects), [objects]);
  const { sakura: sakuraEntries, flag: flagObjects, fire: fireEntries, billboard: billboardObjects } = buckets;
  const modelObjects = useMemo(
    () => (visibilityReady ? buckets.model.filter((object) => visibleObjectIds.has(object.id)) : buckets.model),
    [buckets.model, visibilityReady, visibleObjectIds],
  );

  return (
    <Suspense fallback={null}>
      <group name="building-system" ref={renderRoot}>
        <GrassDriver />
        {gpuResident && <GpuBatchBridge root={renderRoot} />}
        {(gridVisibility ?? showGrid) && <GridHelper size={gridSize} />}
        
        <PreviewBlock />
        <PreviewTile />
        <PreviewWall />
        <NPCPreview />

        <BuildingColliders
          tileGroups={tileGroups}
          wallGroups={wallGroups}
          blocks={blocks ?? EMPTY_BLOCKS}
          wallEditMode={editMode === 'wall'}
          blockEditMode={editMode === 'block'}
        />
        
        <BuildingBatches
          tileGroups={tileGroupsArray}
          wallGroups={wallGroupsArray}
          wallGroupMap={wallGroups}
          meshes={meshes}
          {...(onWallClick ? { onWallClick } : {})}
        />

        {wallGroupsArray.map((wallGroup) => (
          <WallSystem
            key={wallGroup.id}
            wallGroup={wallGroup}
            wallGroups={wallGroups}
            meshes={meshes}
            isEditMode={editMode === 'wall'}
            selectedWallId={selectedWallId}
            colliders={false}
            batches={false}
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
            selectedTileId={selectedTileId}
            colliders={false}
            batches={false}
            {...(onTileClick ? { onTileClick } : {})}
            {...(onTileDelete ? { onTileDelete } : {})}
          />
        ))}

        {visibleBlocks.length > 0 && (
          <BlockSystem
            blocks={visibleBlocks}
            meshes={meshes}
            isEditMode={editMode === 'block'}
            selectedBlockId={selectedBlockId}
            colliders={false}
            {...(onBlockClick || onBlockDelete ? { onBlockClick: onBlockClick ?? onBlockDelete } : {})}
          />
        )}

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

        {billboardObjects.length > 0 && (
          <Suspense fallback={null}>
            <BillboardBatch billboards={billboardObjects} />
          </Suspense>
        )}

        {modelObjects.map((obj) => (
          <group
            key={obj.id}
            position={[obj.position.x, obj.position.y, obj.position.z]}
            rotation={[0, obj.rotation ?? 0, 0]}
          >
            <Suspense fallback={null}>
              <ModelObject
                {...(obj.config?.modelUrl ? { url: obj.config.modelUrl } : {})}
                {...(obj.config?.modelLabel ? { label: obj.config.modelLabel } : {})}
                {...(obj.config?.modelFallbackKind ? { fallbackKind: obj.config.modelFallbackKind } : {})}
                {...(obj.config?.modelScale ? { scale: obj.config.modelScale } : {})}
                {...(obj.config?.modelColor ? { color: obj.config.modelColor } : {})}
              />
            </Suspense>
          </group>
        ))}

        {weatherEffect !== 'none' && (
          <WeatherEffect kind={weatherEffect} count={weatherEffect === 'storm' ? 1800 : 1200} />
        )}
        {showSnow && weatherEffect !== 'snow' && <Snow gpu />}
      </group>
    </Suspense>
  );
});
