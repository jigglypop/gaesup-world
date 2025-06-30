import { useBuildingStore } from '../../stores/buildingStore';
import { TILE_CONSTANTS } from '../../types/constants';
import './styles.css';

export function PreviewWall() {
  const { editMode, hoverPosition, currentWallRotation, checkWallPosition } = useBuildingStore();
  const width = TILE_CONSTANTS.WALL_SIZES.WIDTH;
  const height = TILE_CONSTANTS.WALL_SIZES.HEIGHT;
  const depth = TILE_CONSTANTS.WALL_SIZES.THICKNESS;
  
  if (editMode !== 'wall' || !hoverPosition) {
    return null;
  }
  
  const isOccupied = checkWallPosition(hoverPosition, currentWallRotation);
  const color = isOccupied ? '#ff0000' : '#00ff00';
  
  return (
    <group position={[hoverPosition.x, hoverPosition.y + height / 2, hoverPosition.z]} rotation={[0, currentWallRotation, 0]}>
      <mesh position={[0, 0, width / 2]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.5}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
} 