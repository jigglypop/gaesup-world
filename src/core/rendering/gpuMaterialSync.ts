import type { Material } from 'three';

export function supportsGpuBatchMaterial(material: Material): boolean {
  return !material.transparent && !('isNodeMaterial' in material)
    && !('normalMap' in material && material.normalMap)
    && !('bumpMap' in material && material.bumpMap)
    && !('displacementMap' in material && material.displacementMap);
}

const ownedProperties = new Set(['id', 'uuid', 'type', 'version', 'userData', '_listeners']);

/** Keep uniforms/maps live while preserving the generated material's identity and TSL nodes. */
export function createMaterialSynchronizer(source: Material, target: Material): () => void {
  const original = source as unknown as Record<string, unknown>;
  const generated = target as unknown as Record<string, unknown>;
  const keys = Object.keys(source).filter(key => !ownedProperties.has(key)
    && !key.startsWith('is') && typeof original[key] !== 'function');
  const sync = () => {
    for (const key of keys) {
      // Share value objects such as Color/Vector2/Texture; rendering never mutates them.
      // Scalar replacement and replacement of a whole value object also propagate.
      if (generated[key] !== original[key]) generated[key] = original[key];
    }
  };
  sync();
  return sync;
}
