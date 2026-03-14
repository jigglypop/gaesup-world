import { useBuildingStore } from '../../stores/buildingStore';
import { TILE_CONSTANTS } from '../../types/constants';

export function PreviewBillboard() {
  const editMode = useBuildingStore((s) => s.editMode);
  const hoverPosition = useBuildingStore((s) => s.hoverPosition);
  const width = useBuildingStore((s) => s.currentBillboardWidth);
  const height = useBuildingStore((s) => s.currentBillboardHeight);
  const rotation = useBuildingStore((s) => s.currentBillboardRotation);

  if (editMode !== 'billboard' || !hoverPosition) return null;

  const depth = TILE_CONSTANTS.WALL_SIZES.THICKNESS;

  return (
    <group
      position={[hoverPosition.x, hoverPosition.y + height / 2, hoverPosition.z]}
      rotation={[0, rotation, 0]}
    >
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#00ff00"
          transparent
          opacity={0.4}
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}
