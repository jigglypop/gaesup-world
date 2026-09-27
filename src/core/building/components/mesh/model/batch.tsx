import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { normalizeImportedMaterials } from '../../../../assets/materialPolicy';
import { castNearShadowOnly } from '../../../../rendering/sky/nearShadow';
import type { BuildingObjectCatalogItem } from '../../../catalog/objects';
import type { PlacedObject } from '../../../types';

export type ModelShadow = NonNullable<BuildingObjectCatalogItem['shadow']>;

type Part = { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[]; matrix: THREE.Matrix4 };

const UP = new THREE.Vector3(0, 1, 0);
const placement = new THREE.Matrix4();
const position = new THREE.Vector3();
const rotation = new THREE.Quaternion();
const scaling = new THREE.Vector3();

/** Room for `count` instances, grown in steps so placing a few more objects does not rebuild the mesh. */
function capacityFor(count: number): number {
  return Math.max(4, 2 ** Math.ceil(Math.log2(Math.max(1, count))));
}

function BatchPart({ part, objects, scale, shadow }: { part: Part; objects: PlacedObject[]; scale: number; shadow: ModelShadow }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const capacity = capacityFor(objects.length);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    objects.forEach((object, index) => {
      const size = object.config?.modelScale ?? scale;
      position.set(object.position.x, object.position.y, object.position.z);
      rotation.setFromAxisAngle(UP, object.rotation ?? 0);
      mesh.setMatrixAt(index, placement.compose(position, rotation, scaling.setScalar(size)).multiply(part.matrix));
    });
    mesh.count = objects.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [capacity, objects, part, scale]);
  useEffect(() => (shadow === 'near' && ref.current ? castNearShadowOnly(ref.current) : undefined), [capacity, shadow]);
  // The geometry and materials belong to the cached model, so R3F must not dispose them; the instanced mesh itself is
  // disposed here, which releases its render objects.
  useEffect(() => {
    const mesh = ref.current;
    return () => mesh?.dispose();
  }, [capacity]);
  return (
    <instancedMesh
      ref={ref}
      args={[part.geometry, part.material, capacity]}
      castShadow={shadow !== 'none'}
      receiveShadow
      dispose={null}
    />
  );
}

/**
 * Every placement of one GLB model drawn as one `InstancedMesh` per mesh part: a draw per part for the whole group
 * instead of one per object, in each pass (main and every shadow cascade).
 */
export function ModelBatch({ url, objects, scale = 1, shadow = 'near' }: {
  url: string;
  objects: PlacedObject[];
  /** Scale of objects without their own `modelScale`, as for a single `ModelObject`. */
  scale?: number;
  shadow?: ModelShadow;
}) {
  const { scene } = useGLTF(url) as { scene: THREE.Object3D };
  const parts = useMemo(() => {
    // A shallow clone shares geometry; its materials take the prop policy (no stray metal) like single models do.
    const owned = scene.clone(true);
    normalizeImportedMaterials(owned, 'prop');
    owned.updateMatrixWorld(true);
    const list: Part[] = [];
    owned.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || (mesh as THREE.SkinnedMesh).isSkinnedMesh) return;
      list.push({ geometry: mesh.geometry, material: mesh.material, matrix: mesh.matrixWorld.clone() });
    });
    return list;
  }, [scene]);
  return (
    <group name={`model-batch:${url.split('/').at(-1)}`}>
      {parts.map((part, index) => <BatchPart key={index} part={part} objects={objects} scale={scale} shadow={shadow} />)}
    </group>
  );
}
