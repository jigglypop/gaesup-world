import { useLayoutEffect } from 'react';

import * as THREE from 'three';

/**
 * How imported glTF materials are adjusted for a stylized daylight world:
 * - `keep`: as authored.
 * - `prop`: a metallic factor without a metalness map becomes 0 (glTF defaults it to 1, which reads as black under soft
 *   sky light), and physical materials without transmission become standard ones.
 * - `figure`: fully rough and non-metallic, keeping colour, relief and emission. Generated figures ship glossy
 *   roughness maps whose highlights catch the sky and the sun as white patches.
 */
export type ImportedMaterialPolicy = 'keep' | 'prop' | 'figure';

type Converted = Partial<Record<ImportedMaterialPolicy, THREE.Material>>;

// Clones share their source's materials, so each source converts once per policy and clones share the result.
const conversions = new WeakMap<THREE.Material, Converted>();

function isStandard(material: THREE.Material): material is THREE.MeshStandardMaterial {
  return (material as THREE.MeshStandardMaterial).isMeshStandardMaterial === true;
}

function isPhysical(material: THREE.Material): material is THREE.MeshPhysicalMaterial {
  return (material as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial === true;
}

/** A standard copy of `source`; `copy` takes only the standard fields of a physical material. */
function standardCopy(source: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial();
  THREE.MeshStandardMaterial.prototype.copy.call(material, source);
  material.name = source.name;
  return material;
}

function convert(source: THREE.Material, policy: Exclude<ImportedMaterialPolicy, 'keep'>): THREE.Material {
  if (!isStandard(source)) return source;
  if (policy === 'prop') {
    const metalWithoutMap = source.metalness > 0 && !source.metalnessMap;
    const needless = isPhysical(source) && source.transmission === 0;
    if (!metalWithoutMap && !needless) return source;
    const material = needless ? standardCopy(source) : source.clone();
    if (metalWithoutMap) material.metalness = 0;
    return material;
  }
  const material = standardCopy(source);
  material.roughness = 1;
  material.roughnessMap = null;
  material.metalness = 0;
  material.metalnessMap = null;
  return material;
}

function policyMaterial(source: THREE.Material, policy: Exclude<ImportedMaterialPolicy, 'keep'>): THREE.Material {
  let entry = conversions.get(source);
  if (!entry) {
    const created: Converted = {};
    conversions.set(source, created);
    // The model cache disposes the source when it evicts the model; its conversions go with it.
    source.addEventListener('dispose', () => {
      for (const material of Object.values(created)) if (material !== source) material.dispose();
      conversions.delete(source);
    });
    entry = created;
  }
  return (entry[policy] ??= convert(source, policy));
}

/**
 * Swaps the materials of every mesh under `root` for their `policy` versions. Use it on an owned clone, before toon
 * conversion. Returns the undo, which puts the authored materials back.
 */
export function normalizeImportedMaterials(root: THREE.Object3D, policy: ImportedMaterialPolicy): () => void {
  if (policy === 'keep') return () => undefined;
  const swapped: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const original = mesh.material;
    const next = Array.isArray(original) ? original.map((material) => policyMaterial(material, policy)) : policyMaterial(original, policy);
    if (Array.isArray(next) ? next.every((material, index) => material === (original as THREE.Material[])[index]) : next === original) return;
    swapped.push([mesh, original]);
    mesh.material = next;
  });
  return () => {
    for (const [mesh, original] of swapped) mesh.material = original;
  };
}

/** {@link normalizeImportedMaterials} for the lifetime of `root`; runs before later layout effects such as toon. */
export function useImportedMaterials(root: THREE.Object3D | null | undefined, policy: ImportedMaterialPolicy = 'keep'): void {
  useLayoutEffect(() => (root ? normalizeImportedMaterials(root, policy) : undefined), [root, policy]);
}
