import * as THREE from 'three';

import { useBuildingStore } from '../../stores/buildingStore';

export function PreviewBloom() {
  const editMode = useBuildingStore((s) => s.editMode);
  const hoverPosition = useBuildingStore((s) => s.hoverPosition);
  const color = useBuildingStore((s) => s.currentBloomColor);

  if (editMode !== 'bloom' || !hoverPosition) return null;

  return (
    <group position={[hoverPosition.x, hoverPosition.y + 0.6, hoverPosition.z]}>
      <mesh>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.5}
          emissive={new THREE.Color(color)}
          emissiveIntensity={1.0}
        />
      </mesh>
    </group>
  );
}
