import React, { Suspense, useMemo } from 'react';

import { NPCPreview } from '../../../npc/components/NPCPreview';
import { useBuildingStore } from '../../stores/buildingStore';
import { GridHelper } from '../GridHelper';
import { PreviewTile } from '../PreviewTile';
import { PreviewWall } from '../PreviewWall';
import { SakuraBatch, type SakuraTreeEntry } from '../mesh/sakura';
import { FlagBatch } from '../mesh/flag';
import Fire from '../mesh/fire';
import Billboard from '../mesh/billboard';
import { Snow } from '../mesh/snow';
import { TILE_CONSTANTS } from '../../types/constants';
import { TileSystem } from '../TileSystem';
import { WallSystem } from '../WallSystem';
import { BuildingSystemProps } from './types';

export const BuildingSystem = React.memo(function BuildingSystem({
  onWallClick,
  onTileClick,
  onWallDelete,
  onTileDelete,
}: BuildingSystemProps) {
  const {
    meshes,
    wallGroups,
    tileGroups,
    editMode,
    showGrid,
    gridSize,
    showSnow,
    objects,
  } = useBuildingStore();
  
  const wallGroupsArray = useMemo(() => Array.from(wallGroups.values()), [wallGroups]);
  const tileGroupsArray = useMemo(() => Array.from(tileGroups.values()), [tileGroups]);

  const sakuraObjects = useMemo(() => objects.filter(o => o.type === 'sakura'), [objects]);
  const sakuraEntries: SakuraTreeEntry[] = useMemo(
    () => sakuraObjects.map((o) => ({
      position: [o.position.x, o.position.y, o.position.z] as [number, number, number],
      size: o.config?.size ?? TILE_CONSTANTS.GRID_CELL_SIZE,
    })),
    [sakuraObjects],
  );
  const flagObjects = useMemo(() => objects.filter(o => o.type === 'flag'), [objects]);
  const fireObjects = useMemo(() => objects.filter(o => o.type === 'fire'), [objects]);
  const billboardObjects = useMemo(() => objects.filter(o => o.type === 'billboard'), [objects]);

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

        {fireObjects.map((obj) => (
          <group
            key={obj.id}
            position={[obj.position.x, obj.position.y, obj.position.z]}
            rotation={[0, obj.rotation ?? 0, 0]}
          >
            <Suspense fallback={null}>
              <Fire
                intensity={obj.config?.fireIntensity ?? 1.5}
                width={obj.config?.fireWidth ?? 1.0}
                height={obj.config?.fireHeight ?? 1.5}
                color={obj.config?.fireColor}
              />
            </Suspense>
          </group>
        ))}

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
