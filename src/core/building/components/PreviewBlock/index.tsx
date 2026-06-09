import { useBuildingStore } from '../../stores/buildingStore';
import { TILE_CONSTANTS } from '../../types/constants';

const AVAILABLE_COLOR = '#7dd3fc';
const OCCUPIED_COLOR = '#f3b95f';
const AVAILABLE_OPACITY = 0.38;
const OCCUPIED_OPACITY = 0.3;
const AVAILABLE_EMISSIVE_INTENSITY = 0.12;
const OCCUPIED_EMISSIVE_INTENSITY = 0.08;

export function PreviewBlock() {
  const editMode = useBuildingStore((s) => s.editMode);
  const hoverPosition = useBuildingStore((s) => s.hoverPosition);
  const checkBlockPosition = useBuildingStore((s) => s.checkBlockPosition);
  const currentTileMultiplier = useBuildingStore((s) => s.currentTileMultiplier);
  const currentTileHeight = useBuildingStore((s) => s.currentTileHeight);
  if (editMode !== 'block' || !hoverPosition) return null;
  const sizeCells = Math.max(1, Math.round(currentTileMultiplier));
  const width = TILE_CONSTANTS.GRID_CELL_SIZE * sizeCells;
  const height = TILE_CONSTANTS.HEIGHT_STEP;
  const placementY = hoverPosition.y + currentTileHeight * TILE_CONSTANTS.HEIGHT_STEP;
  const isOccupied = checkBlockPosition({
    position: { x: hoverPosition.x, y: placementY, z: hoverPosition.z },
    size: { x: sizeCells, y: 1, z: sizeCells },
  });
  const color = isOccupied ? OCCUPIED_COLOR : AVAILABLE_COLOR;
  const opacity = isOccupied ? OCCUPIED_OPACITY : AVAILABLE_OPACITY;
  const emissiveIntensity = isOccupied ? OCCUPIED_EMISSIVE_INTENSITY : AVAILABLE_EMISSIVE_INTENSITY;
  return (
    <group
      name="preview-block"
      position={[
        hoverPosition.x - TILE_CONSTANTS.GRID_CELL_SIZE * 0.5 + width * 0.5,
        placementY + height * 0.5,
        hoverPosition.z - TILE_CONSTANTS.GRID_CELL_SIZE * 0.5 + width * 0.5,
      ]}
    >
      <mesh>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
