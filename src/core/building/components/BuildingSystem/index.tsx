import { Suspense } from 'react';
import { WallSystem } from '../WallSystem';
import { TileSystem } from '../TileSystem';
import { GridHelper } from '../GridHelper';
import { useBuildingStore } from '../../stores/buildingStore';

interface BuildingSystemProps {
  onWallClick?: (wallId: string) => void;
  onTileClick?: (tileId: string) => void;
  onWallDelete?: (wallId: string) => void;
  onTileDelete?: (tileId: string) => void;
}

export function BuildingSystem({
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

  return (
    <Suspense fallback={null}>
      <group name="building-system">
        {showGrid && <GridHelper size={gridSize} />}
        
        {Array.from(wallGroups.values()).map((wallGroup) => (
          <WallSystem
            key={wallGroup.id}
            wallGroup={wallGroup}
            meshes={meshes}
            isEditMode={editMode === 'wall'}
            onWallClick={onWallClick}
            onWallDelete={onWallDelete}
          />
        ))}
        
        {Array.from(tileGroups.values()).map((tileGroup) => (
          <TileSystem
            key={tileGroup.id}
            tileGroup={tileGroup}
            meshes={meshes}
            isEditMode={editMode === 'tile'}
            onTileClick={onTileClick}
            onTileDelete={onTileDelete}
          />
        ))}
      </group>
    </Suspense>
  );
} 