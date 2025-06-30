import { useBuildingStore } from '../../stores/buildingStore';
import { TILE_CONSTANTS } from '../../types/constants';
import './styles.css';

export function PreviewTile() {
  const { editMode, hoverPosition, checkTilePosition, currentTileMultiplier } = useBuildingStore();
  const tileSize = TILE_CONSTANTS.GRID_CELL_SIZE * currentTileMultiplier;
  
  if (editMode !== 'tile' || !hoverPosition) {
    return null;
  }
  
  const isOccupied = checkTilePosition(hoverPosition);
  const color = isOccupied ? '#ff0000' : '#00ff00';
  
  return (
    <mesh position={[hoverPosition.x, hoverPosition.y + 0.05, hoverPosition.z]}>
      <boxGeometry args={[tileSize, 0.1, tileSize]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.5}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
} 