import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import type { Group } from 'three';

import { BuildingSystemProps } from './types';
import { NPCPreview } from '../../../npc/components/NPCPreview';
import { CompileGate } from '../../../rendering/CompileGate';
import { DynamicFog } from '../../../rendering/fog/DynamicFog';
import { GpuBatchBridge } from '../../../rendering/GpuBatchBridge';
import { WeatherEffect } from '../../../weather';
import { getDefaultBuildingObject } from '../../catalog/objects';
import { useBuildingStore } from '../../stores/buildingStore';
import { scatterDecor } from '../../terrain/scatter';
import type { BuildingBlockConfig, BuildingTreeKind, PlacedObject } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { useBuildingVisibilityStore } from '../../visibility/store';
import { BlockSystem } from '../BlockSystem';
import { BuildingBatches } from '../BuildingBatches';
import { BuildingColliders } from '../BuildingColliders';
import { EditOverlay } from '../EditOverlay';
import { buildingEditItems } from '../EditOverlay/items';
import { GridHelper } from '../GridHelper';
import { BillboardBatch } from '../mesh/billboard';
import { FireBatch, type FireBatchEntry } from '../mesh/fire';
import { FlagBatch } from '../mesh/flag';
import { GrassDriver } from '../mesh/grass/GrassDriver';
import ModelObject from '../mesh/model';
import { LampLightPool, LampRegistry, LampRegistryContext } from '../mesh/model/lampPool';
import { StaticModels, type StaticModelGroup } from '../mesh/model/static';
import { SakuraBatch, type SakuraTreeEntry } from '../mesh/sakura';
import { Snow } from '../mesh/snow';
import Ocean from '../mesh/water';
import { PreviewBlock } from '../PreviewBlock';
import { PreviewTile } from '../PreviewTile';
import { PreviewWall } from '../PreviewWall';
import { TileSystem } from '../TileSystem';
import { WallSystem } from '../WallSystem';

/** The ocean around an island world: below the ground tiles, wide enough to meet the fog, following the camera. */
const OCEAN_SIZE = 480;
const OCEAN_LEVEL = -0.3;

type ObjectBuckets = {
  sakura: SakuraTreeEntry[];
  flag: PlacedObject[];
  fire: FireBatchEntry[];
  billboard: PlacedObject[];
  model: PlacedObject[];
};

/** Models with a GLB, grouped by it for static drawing; the catalog item sets the shadow. */
function groupModels(objects: PlacedObject[]): StaticModelGroup[] {
  const groups = new Map<string, StaticModelGroup>();
  for (const object of objects) {
    const url = object.config?.modelUrl;
    if (!url) continue;
    let group = groups.get(url);
    if (!group) {
      const item = object.config?.modelId ? getDefaultBuildingObject(object.config.modelId) : undefined;
      group = { url, objects: [], shadow: item?.shadow ?? 'near' };
      groups.set(url, group);
    }
    group.objects.push(object);
  }
  return [...groups.values()];
}

function isTreeObject(object: PlacedObject): boolean {
  return object.type === 'tree' || object.type === 'sakura';
}

function resolveTreeKind(object: PlacedObject): BuildingTreeKind {
  return object.type === 'sakura' ? 'sakura' : object.config?.treeKind ?? 'oak';
}

const EMPTY_BLOCKS: readonly BuildingBlockConfig[] = [];
const EMPTY_OBJECTS: readonly PlacedObject[] = [];

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
  const [lampRegistry] = useState(() => new LampRegistry());
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
  // Painting and erasing act on the piece clicked; placing selects it.
  const acting = useBuildingStore((s) => s.buildingTool === 'paint' || s.buildingTool === 'erase');
  const erasing = useBuildingStore((s) => s.buildingTool === 'erase');
  const applyToolTo = useBuildingStore((s) => s.applyToolTo);
  const showGrid = useBuildingStore((s) => s.showGrid);
  const gridSize = useBuildingStore((s) => s.gridSize);
  const showSnow = useBuildingStore((s) => s.showSnow);
  const weatherEffect = useBuildingStore((s) => s.weatherEffect);
  const showFog = useBuildingStore((s) => s.showFog);
  const fogColor = useBuildingStore((s) => s.fogColor);
  const worldSurface = useBuildingStore((s) => s.worldSurface);
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
  // One overlay for every group the edit mode works on: two draws instead of one per tile, wall or block.
  // Objects join it for the eraser, the only tool that acts on a placed object.
  const editItems = useMemo(
    () => buildingEditItems(editMode, tileGroupsArray, wallGroupsArray, visibleBlocks, erasing ? objects : undefined),
    [editMode, tileGroupsArray, wallGroupsArray, visibleBlocks, erasing, objects],
  );
  const pickEdit = acting
    ? applyToolTo
    : editMode === 'tile' ? onTileClick : editMode === 'wall' ? onWallClick : editMode === 'object' ? undefined : onBlockClick ?? onBlockDelete;
  // Batched objects draw in a fixed number of calls however many there are, so they are built once from every
  // object and residency changes never rebuild them. Only per-object models follow residency.
  const buckets = useMemo(() => bucketObjects(objects), [objects]);
  const { sakura: sakuraEntries, flag: flagObjects, fire: fireEntries, billboard: billboardObjects } = buckets;
  const residentModels = useMemo(
    () => (visibilityReady ? buckets.model.filter((object) => visibleObjectIds.has(object.id)) : buckets.model),
    [buckets.model, visibilityReady, visibleObjectIds],
  );
  // Decoration the meshes scatter over the resident tiles; unchanged pieces keep their objects, so their cells hold.
  const scatterCache = useRef<ReadonlyMap<string, PlacedObject>>(new Map());
  const scattered = useMemo(
    () => scatterDecor(tileGroupsArray, meshes, objects ?? EMPTY_OBJECTS, scatterCache.current),
    [tileGroupsArray, meshes, objects],
  );
  useEffect(() => {
    scatterCache.current = new Map(scattered.map((object) => [object.id, object]));
  }, [scattered]);
  // GLB models draw as static geometry, merged or instanced, while editing too: entering or leaving edit mode rebuilds
  // nothing, and an edit re-merges only the cells it touched. The editor picks objects by their edit overlay boxes.
  // Only models without a URL, drawn as fallback shapes, stay single.
  const modelGroups = useMemo(() => groupModels([...residentModels, ...scattered]), [residentModels, scattered]);
  const modelObjects = useMemo(() => residentModels.filter((object) => !object.config?.modelUrl), [residentModels]);

  return (
    <Suspense fallback={null}>
      <LampRegistryContext.Provider value={lampRegistry}>
      <group name="building-system" ref={renderRoot}>
        <LampLightPool registry={lampRegistry} />
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
            colliders={false}
            {...(onBlockClick || onBlockDelete ? { onBlockClick: onBlockClick ?? onBlockDelete } : {})}
          />
        )}

        {editItems.length > 0 && (
          <EditOverlay
            kind={editMode === 'wall' ? 'marker' : 'wire'}
            items={editItems}
            selectedId={acting ? null : editMode === 'tile' ? selectedTileId : editMode === 'wall' ? selectedWallId : selectedBlockId}
            onSelect={pickEdit}
          />
        )}

        {sakuraEntries.length > 0 && (
          <Suspense fallback={null}>
            <CompileGate><SakuraBatch trees={sakuraEntries} /></CompileGate>
          </Suspense>
        )}

        {flagObjects.length > 0 && (
          <Suspense fallback={null}>
            <CompileGate><FlagBatch flags={flagObjects} /></CompileGate>
          </Suspense>
        )}

        {fireEntries.length > 0 && (
          <Suspense fallback={null}>
            <CompileGate><FireBatch fires={fireEntries} /></CompileGate>
          </Suspense>
        )}

        {billboardObjects.length > 0 && (
          <Suspense fallback={null}>
            <CompileGate><BillboardBatch billboards={billboardObjects} /></CompileGate>
          </Suspense>
        )}

        {modelGroups.length > 0 && <StaticModels groups={modelGroups} />}

        {modelObjects.map((obj) => (
          <group
            key={obj.id}
            position={[obj.position.x, obj.position.y, obj.position.z]}
            rotation={[0, obj.rotation ?? 0, 0]}
          >
            <Suspense fallback={null}>
              <CompileGate><ModelObject
                {...(obj.config?.modelUrl ? { url: obj.config.modelUrl } : {})}
                {...(obj.config?.modelLabel ? { label: obj.config.modelLabel } : {})}
                {...(obj.config?.modelFallbackKind ? { fallbackKind: obj.config.modelFallbackKind } : {})}
                {...(obj.config?.modelScale ? { scale: obj.config.modelScale } : {})}
                {...(obj.config?.modelColor ? { color: obj.config.modelColor } : {})}
                shadow={(obj.config?.modelId && getDefaultBuildingObject(obj.config.modelId)?.shadow) || 'near'}
              /></CompileGate>
            </Suspense>
          </group>
        ))}

        {weatherEffect !== 'none' && (
          <WeatherEffect kind={weatherEffect} count={weatherEffect === 'storm' ? 1800 : 1200} />
        )}
        {showSnow && weatherEffect !== 'snow' && <Snow gpu />}
        {showFog && <DynamicFog color={fogColor} />}
        {worldSurface === 'water' && (
          <group position={[0, OCEAN_LEVEL, 0]}><Ocean size={OCEAN_SIZE} followCamera /></group>
        )}
      </group>
      </LampRegistryContext.Provider>
    </Suspense>
  );
});
