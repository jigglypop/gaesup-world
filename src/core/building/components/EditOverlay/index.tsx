import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import type { EditOverlayItem } from './items';
import { getDefaultToonMode, getToonGradient } from '../../../rendering/toon';

/** Wire boxes over tiles and blocks, floating markers over walls. */
export type EditOverlayKind = 'wire' | 'marker';

export type EditOverlayProps = {
  kind: EditOverlayKind;
  items: readonly EditOverlayItem[];
  selectedId?: string | null | undefined;
  onSelect?: ((id: string) => void) | undefined;
};

/** `[unselected, selected]` looks of each kind. */
const LOOKS = {
  wire: [
    { color: '#60a5fa', opacity: 0.14, emissive: '#2563eb', emissiveIntensity: 0.08 },
    { color: '#bae6fd', opacity: 0.28, emissive: '#60a5fa', emissiveIntensity: 0.18 },
  ],
  marker: [
    { color: '#7dd3fc', opacity: 0.78, emissive: '#2f8dbd', emissiveIntensity: 0.22 },
    { color: '#bae6fd', opacity: 0.94, emissive: '#60a5fa', emissiveIntensity: 0.5 },
  ],
} as const;
const SELECTED_SCALE = { wire: 1, marker: 1.28 } as const;
/** Editor helpers are not scenery: the camera's collision passes through them. */
const EDITOR_HELPER = { intangible: true };

function createMaterial(kind: EditOverlayKind, selected: boolean): THREE.Material {
  const look = LOOKS[kind][selected ? 1 : 0];
  const params = { ...look, transparent: true, ...(kind === 'wire' ? { wireframe: true, depthWrite: false } : {}) };
  return kind === 'wire' && getDefaultToonMode()
    ? new THREE.MeshToonMaterial({ ...params, gradientMap: getToonGradient(3) })
    : new THREE.MeshStandardMaterial(params);
}

/** Instance slots grow in powers of two, so adding items rarely rebuilds the mesh. */
const capacityFor = (count: number) => 2 ** Math.ceil(Math.log2(Math.max(1, count)));
const scratch = { matrix: new THREE.Matrix4(), position: new THREE.Vector3(), scale: new THREE.Vector3(), rotation: new THREE.Quaternion() };

/**
 * The editing overlay of one kind in two draws, however many items there are: every item but the selected one in one
 * InstancedMesh, the selected one in its own mesh. A click selects the nearest item under the pointer.
 */
export function EditOverlay({ kind, items, selectedId = null, onSelect }: EditOverlayProps) {
  const geometry = useMemo(() => (kind === 'wire' ? new THREE.BoxGeometry(1, 1, 1) : new THREE.SphereGeometry(0.22, 16, 16)), [kind]);
  const materials = useMemo(() => [createMaterial(kind, false), createMaterial(kind, true)] as const, [kind]);
  useEffect(() => () => {
    geometry.dispose();
    materials.forEach((material) => material.dispose());
  }, [geometry, materials]);

  const others = useMemo(() => items.filter((item) => item.id !== selectedId), [items, selectedId]);
  const selected = useMemo(() => items.find((item) => item.id === selectedId), [items, selectedId]);
  const capacity = capacityFor(others.length);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    others.forEach((item, index) => {
      scratch.matrix.compose(scratch.position.fromArray(item.position), scratch.rotation, scratch.scale.fromArray(item.scale));
      mesh.setMatrixAt(index, scratch.matrix);
    });
    mesh.count = others.length;
    mesh.instanceMatrix.needsUpdate = true;
    // Culling and picking read the bounds of the instances, not of the unit box.
    mesh.computeBoundingSphere();
  }, [others, capacity]);

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const item = event.instanceId === undefined ? undefined : others[event.instanceId];
    if (item) onSelect?.(item.id);
  };
  const selectedScale = SELECTED_SCALE[kind];

  return (
    <group name="building-edit-overlay" userData={EDITOR_HELPER}>
      {others.length > 0 && (
        <instancedMesh key={capacity} ref={meshRef} args={[geometry, materials[0], capacity]} onClick={pick} />
      )}
      {selected && (
        <mesh
          geometry={geometry}
          material={materials[1]}
          position={selected.position}
          scale={[selected.scale[0] * selectedScale, selected.scale[1] * selectedScale, selected.scale[2] * selectedScale]}
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(selected.id);
          }}
        />
      )}
    </group>
  );
}
