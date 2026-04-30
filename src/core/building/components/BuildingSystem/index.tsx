import React, { Suspense, useMemo } from 'react';

import { BuildingSystemProps } from './types';
import { NPCPreview } from '../../../npc/components/NPCPreview';
import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import {
  DRAW_CLUSTER_BILLBOARD,
  DRAW_CLUSTER_BLOCK,
  DRAW_CLUSTER_FIRE,
  DRAW_CLUSTER_FLAG,
  DRAW_CLUSTER_MODEL,
  DRAW_CLUSTER_SAKURA,
  DRAW_CLUSTER_SAND,
  DRAW_CLUSTER_SNOWFIELD,
  DRAW_CLUSTER_TILE,
  DRAW_CLUSTER_WALL,
  DRAW_CLUSTER_WATER,
  getIndirectInstanceCount,
} from '../../render/draw';
import { useBuildingRenderStateStore } from '../../render/store';
import { useBuildingStore } from '../../stores/buildingStore';
import type { PlacedObject } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { useBuildingVisibilityStore } from '../../visibility/store';
import { BlockSystem } from '../BlockSystem';
import { GridHelper } from '../GridHelper';
import { BillboardBatch } from '../mesh/billboard';
import { FireBatch, type FireBatchEntry } from '../mesh/fire';
import { FlagBatch } from '../mesh/flag';
import ModelObject from '../mesh/model';
import { SakuraBatch, type SakuraTreeEntry } from '../mesh/sakura';
import { Snow } from '../mesh/snow';
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

const EMPTY_BUCKETS: ObjectBuckets = {
  sakura: [],
  flag: [],
  fire: [],
  billboard: [],
  model: [],
};

function clampList<T>(items: T[], limit: number): T[] {
  if (limit <= 0) return [];
  if (items.length <= limit) return items;
  return items.slice(0, limit);
}

function getTileClusterId(group: { tiles: Array<{ objectType?: string }> }): number {
  const objectType = group.tiles.find((tile) => tile.objectType && tile.objectType !== 'none')?.objectType ?? 'none';
  if (objectType === 'water') return DRAW_CLUSTER_WATER;
  if (objectType === 'sand') return DRAW_CLUSTER_SAND;
  if (objectType === 'snowfield') return DRAW_CLUSTER_SNOWFIELD;
  // Grass tiles still render through TileSystem today, so until the grass batch
  // renderer consumes its own indirect path we budget them through tile cluster.
  return DRAW_CLUSTER_TILE;
}

function bucketObjects(objects: PlacedObject[] | undefined): ObjectBuckets {
  if (!objects || objects.length === 0) return EMPTY_BUCKETS;

  const buckets: ObjectBuckets = { sakura: [], flag: [], fire: [], billboard: [], model: [] };
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
    } else if (o.type === 'model') {
      buckets.model.push(o);
    }
  }
  return buckets;
}

export const BuildingSystem = React.memo(function BuildingSystem({
  onWallClick,
  onTileClick,
  onBlockClick,
  onWallDelete,
  onTileDelete,
  onBlockDelete,
}: BuildingSystemProps) {
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
  const objects = useBuildingStore((s) => s.objects);
  const drawMirror = useBuildingRenderStateStore((s) => s.drawMirror);
  const gpuCullingActive = useBuildingGpuCullingStore((s) => s.active);
  const gpuCullingVersion = useBuildingGpuCullingStore((s) => s.version);
  const visibilityReady = useBuildingVisibilityStore((s) => s.initialized);
  const visibleWallGroupIds = useBuildingVisibilityStore((s) => s.visibleWallGroupIds);
  const visibleTileGroupIds = useBuildingVisibilityStore((s) => s.visibleTileGroupIds);
  const visibleBlockIds = useBuildingVisibilityStore((s) => s.visibleBlockIds);
  const visibleObjectIds = useBuildingVisibilityStore((s) => s.visibleObjectIds);

  const drawReady = gpuCullingActive && drawMirror.version > 0 && drawMirror.version === gpuCullingVersion;
  const wallBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_WALL) : Number.MAX_SAFE_INTEGER;
  const tileBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_TILE) : Number.MAX_SAFE_INTEGER;
  const waterBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_WATER) : Number.MAX_SAFE_INTEGER;
  const sandBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_SAND) : Number.MAX_SAFE_INTEGER;
  const snowfieldBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_SNOWFIELD) : Number.MAX_SAFE_INTEGER;
  const sakuraBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_SAKURA) : Number.MAX_SAFE_INTEGER;
  const flagBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_FLAG) : Number.MAX_SAFE_INTEGER;
  const fireBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_FIRE) : Number.MAX_SAFE_INTEGER;
  const billboardBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_BILLBOARD) : Number.MAX_SAFE_INTEGER;
  const modelBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_MODEL) : Number.MAX_SAFE_INTEGER;
  const blockBudget = drawReady ? getIndirectInstanceCount(drawMirror, DRAW_CLUSTER_BLOCK) : Number.MAX_SAFE_INTEGER;

  const wallGroupsArray = useMemo(() => {
    const groups = Array.from(wallGroups.values());
    const filtered = !visibilityReady ? groups : groups.filter((group) => visibleWallGroupIds.has(group.id));
    return clampList(filtered, wallBudget);
  }, [wallGroups, visibilityReady, visibleWallGroupIds, wallBudget]);
  const tileGroupsArray = useMemo(() => {
    const groups = Array.from(tileGroups.values());
    const filtered = !visibilityReady ? groups : groups.filter((group) => visibleTileGroupIds.has(group.id));
    const generic: typeof filtered = [];
    const water: typeof filtered = [];
    const sand: typeof filtered = [];
    const snowfield: typeof filtered = [];
    for (const group of filtered) {
      const cluster = getTileClusterId(group);
      if (cluster === DRAW_CLUSTER_WATER) water.push(group);
      else if (cluster === DRAW_CLUSTER_SAND) sand.push(group);
      else if (cluster === DRAW_CLUSTER_SNOWFIELD) snowfield.push(group);
      else generic.push(group);
    }
    return [
      ...clampList(generic, tileBudget),
      ...clampList(water, waterBudget),
      ...clampList(sand, sandBudget),
      ...clampList(snowfield, snowfieldBudget),
    ];
  }, [tileGroups, visibilityReady, visibleTileGroupIds, tileBudget, waterBudget, sandBudget, snowfieldBudget]);
  const visibleObjects = useMemo(() => {
    const filtered = !visibilityReady ? objects : objects.filter((object) => visibleObjectIds.has(object.id));
    const sakura: typeof filtered = [];
    const flag: typeof filtered = [];
    const fire: typeof filtered = [];
    const billboard: typeof filtered = [];
    const model: typeof filtered = [];
    for (const object of filtered) {
      if (object.type === 'sakura') sakura.push(object);
      else if (object.type === 'flag') flag.push(object);
      else if (object.type === 'fire') fire.push(object);
      else if (object.type === 'billboard') billboard.push(object);
      else if (object.type === 'model') model.push(object);
    }
    return [
      ...clampList(sakura, sakuraBudget),
      ...clampList(flag, flagBudget),
      ...clampList(fire, fireBudget),
      ...clampList(billboard, billboardBudget),
      ...clampList(model, modelBudget),
    ];
  }, [
    objects,
    visibilityReady,
    visibleObjectIds,
    sakuraBudget,
    flagBudget,
    fireBudget,
    billboardBudget,
    modelBudget,
  ]);
  const visibleBlocks = useMemo(() => {
    const list = blocks ?? [];
    const filtered = !visibilityReady ? list : list.filter((block) => visibleBlockIds.has(block.id));
    return clampList(filtered, blockBudget);
  }, [blocks, visibilityReady, visibleBlockIds, blockBudget]);

  const buckets = useMemo(() => bucketObjects(visibleObjects), [visibleObjects]);
  const sakuraEntries = clampList(buckets.sakura, sakuraBudget);
  const flagObjects = clampList(buckets.flag, flagBudget);
  const fireEntries = clampList(buckets.fire, fireBudget);
  const billboardObjects = clampList(buckets.billboard, billboardBudget);
  const modelObjects = clampList(buckets.model, modelBudget);

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
            wallGroups={wallGroups}
            meshes={meshes}
            isEditMode={editMode === 'wall'}
            selectedWallId={selectedWallId}
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

        {showSnow && <Snow />}
      </group>
    </Suspense>
  );
});
