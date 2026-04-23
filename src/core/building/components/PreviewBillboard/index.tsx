import { useBuildingStore } from '../../stores/buildingStore';
import Billboard from '../mesh/billboard';

export function PreviewBillboard() {
  const editMode = useBuildingStore((s) => s.editMode);
  const hoverPosition = useBuildingStore((s) => s.hoverPosition);
  const selectedPlacedObjectType = useBuildingStore((s) => s.selectedPlacedObjectType);
  const rotation = useBuildingStore((s) => s.currentObjectRotation);
  const text = useBuildingStore((s) => s.currentBillboardText);
  const imageUrl = useBuildingStore((s) => s.currentBillboardImageUrl);
  const color = useBuildingStore((s) => s.currentBillboardColor);

  if (editMode !== 'object' || selectedPlacedObjectType !== 'billboard' || !hoverPosition) return null;

  return (
    <group
      position={[hoverPosition.x, hoverPosition.y, hoverPosition.z]}
      rotation={[0, rotation, 0]}
    >
      <Billboard
        text={text}
        {...(imageUrl ? { imageUrl } : {})}
        color={color}
      />
    </group>
  );
}
