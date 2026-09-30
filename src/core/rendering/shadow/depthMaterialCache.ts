import * as THREE from 'three';

type ShadowCaster = THREE.Mesh & {
  isInstancedMesh?: boolean;
  isSkinnedMesh?: boolean;
  isBatchedMesh?: boolean;
  instanceColor?: THREE.InstancedBufferAttribute | null;
  morphTexture?: THREE.DataTexture | null;
  colorTexture?: THREE.DataTexture | null;
};

export type ShadowDepthMaterialCache = {
  assign: (root: THREE.Object3D) => void;
  release: (root: THREE.Object3D) => void;
  dispose: () => void;
};

function flag(value: unknown): string {
  return value ? '1' : '0';
}

function needsDepthVariant(material: THREE.Material): boolean {
  const source = material as THREE.MeshStandardMaterial;
  return (
    (source.clipShadows && (source.clippingPlanes?.length ?? 0) > 0) ||
    (Boolean(source.displacementMap) && source.displacementScale !== 0) ||
    (Boolean(source.alphaMap) && source.alphaTest > 0) ||
    (Boolean(source.map) && source.alphaTest > 0) ||
    source.alphaToCoverage
  );
}

export function getShadowDepthFamily(object: THREE.Object3D): string | null {
  const mesh = object as ShadowCaster;
  if (!mesh.isMesh || !mesh.castShadow) return null;
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  if (materials.some(needsDepthVariant)) return null;
  const morphs = mesh.geometry.morphAttributes['position']?.length ?? 0;
  const parts: string[] = [];
  if (mesh.isInstancedMesh) parts.push(`i${flag(mesh.instanceColor)}${flag(mesh.morphTexture)}`);
  if (mesh.isSkinnedMesh) parts.push('s');
  if (mesh.isBatchedMesh) parts.push(`b${flag(mesh.colorTexture)}`);
  if (morphs > 0) parts.push(`m${morphs}`);
  return parts.length > 0 ? parts.join('') : null;
}

export function createShadowDepthMaterialCache(): ShadowDepthMaterialCache {
  const materials = new Map<string, THREE.MeshDepthMaterial>();
  const owned = new Set<THREE.Material>();
  const materialFor = (family: string) => {
    let material = materials.get(family);
    if (!material) {
      material = new THREE.MeshDepthMaterial();
      materials.set(family, material);
      owned.add(material);
    }
    return material;
  };
  const isAssignable = (object: THREE.Object3D) =>
    object.customDepthMaterial === undefined || owned.has(object.customDepthMaterial);

  return {
    assign: (root) => {
      root.traverse((object) => {
        if (!isAssignable(object)) return;
        const family = getShadowDepthFamily(object);
        if (family) object.customDepthMaterial = materialFor(family);
        else if (object.customDepthMaterial) object.customDepthMaterial = undefined;
      });
    },
    release: (root) => {
      root.traverse((object) => {
        if (object.customDepthMaterial && owned.has(object.customDepthMaterial)) object.customDepthMaterial = undefined;
      });
    },
    dispose: () => {
      materials.forEach((material) => material.dispose());
      materials.clear();
      owned.clear();
    },
  };
}
