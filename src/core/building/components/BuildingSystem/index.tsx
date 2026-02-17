import React, { useMemo } from 'react';
import { Suspense } from 'react';

import { NPCPreview } from '../../../npc/components/NPCPreview';
import { useBuildingStore } from '../../stores/buildingStore';
import { GridHelper } from '../GridHelper';
import { PreviewTile } from '../PreviewTile';
import { PreviewWall } from '../PreviewWall';
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
  } = useBuildingStore();
  
  const wallGroupsArray = useMemo(() => Array.from(wallGroups.values()), [wallGroups]);
  const tileGroupsArray = useMemo(() => Array.from(tileGroups.values()), [tileGroups]);

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
      </group>
    </Suspense>
  );
}); 