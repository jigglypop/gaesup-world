import * as THREE from 'three';

import { createMeshRendererComponent } from '../../../scene-object/components';
import { createSceneComponent, createSceneObject } from '../../../scene-object/core';
import { buildAssetDependencyGraph, findMissingAssetReferences } from '../dependencies';
import { inspectModel, validateModelStats } from '../modelInspection';

describe('에셋 의존성 그래프', () => {
  test('컴포넌트 데이터 안의 에셋 참조를 수집하고 누락 에셋을 찾는다', () => {
    const scene = [
      createSceneObject({ id: 'tree', components: [createMeshRendererComponent({ assetId: 'model.tree' })] }),
      createSceneObject({
        id: 'npc',
        components: [
          createSceneComponent({ type: 'gaesup.script', data: { scriptId: 'x', props: { modelAssetId: 'model.npc' } } }),
        ],
      }),
    ];
    const prefab = [createSceneObject({ id: 'lamp', components: [createMeshRendererComponent({ assetId: 'model.tree' })] })];
    const graph = buildAssetDependencyGraph([
      { id: 'scene:town', objects: scene },
      { id: 'prefab:lamp', objects: prefab },
    ]);
    expect(Array.from(graph.usersByAsset.get('model.tree') ?? [])).toEqual(['scene:town', 'prefab:lamp']);
    expect(Array.from(graph.assetsByOwner.get('scene:town') ?? [])).toEqual(['model.tree', 'model.npc']);
    const missing = findMissingAssetReferences(graph.references, new Set(['model.tree']));
    expect(missing.map((reference) => [reference.assetId, reference.path])).toEqual([['model.npc', 'props.modelAssetId']]);
  });
});

describe('모델 검사', () => {
  test('삼각형, 머티리얼, 본 수와 크기를 세고 한도 위반을 보고한다', () => {
    const root = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial();
    root.add(new THREE.Mesh(geometry, material));
    root.add(new THREE.Bone());
    const stats = inspectModel(root, [new THREE.AnimationClip('idle', 1, [])]);
    expect(stats).toMatchObject({ meshes: 1, triangles: 12, materials: 1, bones: 1, animationClips: ['idle'] });
    expect(stats.boundingSize[1]).toBeCloseTo(2);
    const issues = validateModelStats(stats, {
      maxTriangles: 6,
      maxMaterials: 4,
      maxTextureSize: 1024,
      maxBones: 0,
      maxBoundingSize: 50,
    });
    expect(issues.map((issue) => [issue.code, issue.severity])).toEqual([
      ['too-many-triangles', 'warning'],
      ['too-many-bones', 'error'],
    ]);
    geometry.dispose();
    material.dispose();
  });
});
