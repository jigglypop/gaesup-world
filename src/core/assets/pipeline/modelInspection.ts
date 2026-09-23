import * as THREE from 'three';

import type { AssetImportIssue, AssetImportLimits, AssetModelStats } from './types';

export const DEFAULT_ASSET_IMPORT_LIMITS: AssetImportLimits = {
  maxTriangles: 50_000,
  maxMaterials: 16,
  maxTextureSize: 2048,
  maxBones: 128,
  maxBoundingSize: 50,
};

const MIN_REASONABLE_SIZE = 0.01;
const TEXTURE_KEYS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'alphaMap'] as const;

function textureSize(texture: THREE.Texture): number {
  const image = texture.image as { width?: number; height?: number } | undefined;
  return Math.max(image?.width ?? 0, image?.height ?? 0);
}

export function inspectModel(root: THREE.Object3D, animations: readonly THREE.AnimationClip[] = []): AssetModelStats {
  let meshes = 0;
  let triangles = 0;
  let bones = 0;
  let maxTextureSize = 0;
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (object instanceof THREE.Bone) bones++;
    if (!(object instanceof THREE.Mesh)) return;
    meshes++;
    const geometry = object.geometry as THREE.BufferGeometry;
    const indexCount = geometry.index?.count ?? geometry.getAttribute('position')?.count ?? 0;
    triangles += Math.floor(indexCount / 3);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list) {
      if (!material) continue;
      materials.add(material);
      const record = material as unknown as Record<string, unknown>;
      for (const key of TEXTURE_KEYS) {
        const texture = record[key];
        if (texture instanceof THREE.Texture) {
          textures.add(texture);
          maxTextureSize = Math.max(maxTextureSize, textureSize(texture));
        }
      }
    }
  });

  const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
  return {
    meshes,
    triangles,
    materials: materials.size,
    textures: textures.size,
    maxTextureSize,
    bones,
    animationClips: animations.map((clip) => clip.name),
    boundingSize: [size.x, size.y, size.z],
  };
}

export function validateModelStats(
  stats: AssetModelStats,
  limits: AssetImportLimits = DEFAULT_ASSET_IMPORT_LIMITS,
): AssetImportIssue[] {
  const issues: AssetImportIssue[] = [];
  if (stats.meshes === 0) {
    issues.push({ code: 'empty-model', severity: 'error', message: '메시가 없는 모델입니다' });
  }
  if (stats.triangles > limits.maxTriangles) {
    issues.push({
      code: 'too-many-triangles',
      severity: stats.triangles > limits.maxTriangles * 2 ? 'error' : 'warning',
      message: `삼각형 ${stats.triangles}개가 한도 ${limits.maxTriangles}를 넘습니다`,
    });
  }
  if (stats.materials > limits.maxMaterials) {
    issues.push({ code: 'too-many-materials', severity: 'warning', message: `머티리얼 ${stats.materials}개가 한도 ${limits.maxMaterials}를 넘습니다` });
  }
  if (stats.maxTextureSize > limits.maxTextureSize) {
    issues.push({ code: 'texture-too-large', severity: 'warning', message: `텍스처 ${stats.maxTextureSize}px가 한도 ${limits.maxTextureSize}px를 넘습니다` });
  }
  if (stats.bones > limits.maxBones) {
    issues.push({ code: 'too-many-bones', severity: 'error', message: `본 ${stats.bones}개가 한도 ${limits.maxBones}를 넘습니다` });
  }
  const largest = Math.max(...stats.boundingSize);
  if (stats.meshes > 0 && (largest > limits.maxBoundingSize || largest < MIN_REASONABLE_SIZE)) {
    issues.push({ code: 'unexpected-scale', severity: 'warning', message: `모델 크기 ${largest.toFixed(3)}m가 일반적인 범위를 벗어났습니다` });
  }
  return issues;
}
