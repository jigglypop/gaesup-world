import * as THREE from 'three';

import { createShadowDepthMaterialCache, getShadowDepthFamily } from '../depthMaterialCache';

function caster<T extends THREE.Mesh>(mesh: T): T {
  mesh.castShadow = true;
  return mesh;
}

describe('그림자 깊이 재질 캐시', () => {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial();

  test('인스턴스·스킨 캐스터는 종류별 깊이 재질을 공유하고 일반·비캐스터·알파 테스트·사용자 지정 재질은 그대로 둔다', () => {
    const scene = new THREE.Scene();
    const plain = caster(new THREE.Mesh(geometry, material));
    const grass = caster(new THREE.InstancedMesh(geometry, material, 2));
    const trees = caster(new THREE.InstancedMesh(geometry, material, 2));
    const tinted = caster(new THREE.InstancedMesh(geometry, material, 2));
    tinted.setColorAt(0, new THREE.Color('red'));
    const body = caster(new THREE.SkinnedMesh(geometry, material));
    const ghost = new THREE.InstancedMesh(geometry, material, 1);
    const custom = caster(new THREE.InstancedMesh(geometry, material, 1));
    const userDepth = new THREE.MeshDepthMaterial();
    custom.customDepthMaterial = userDepth;
    const leaves = caster(new THREE.InstancedMesh(
      geometry,
      new THREE.MeshStandardMaterial({ map: new THREE.Texture(), alphaTest: 0.5 }),
      2,
    ));
    scene.add(plain, grass, trees, tinted, body, ghost, custom, leaves);
    const cache = createShadowDepthMaterialCache();

    cache.assign(scene);

    expect(plain.customDepthMaterial).toBeUndefined();
    expect(ghost.customDepthMaterial).toBeUndefined();
    expect(custom.customDepthMaterial).toBe(userDepth);
    expect(leaves.customDepthMaterial).toBeUndefined();
    expect(grass.customDepthMaterial).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(trees.customDepthMaterial).toBe(grass.customDepthMaterial);
    expect(tinted.customDepthMaterial).not.toBe(grass.customDepthMaterial);
    expect(body.customDepthMaterial).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(body.customDepthMaterial).not.toBe(grass.customDepthMaterial);
    cache.dispose();
  });

  test('종류가 바뀌면 다시 할당하고 release는 캐시가 붙인 재질만 떼어 낸다', () => {
    const scene = new THREE.Scene();
    const grass = caster(new THREE.InstancedMesh(geometry, material, 2));
    const custom = caster(new THREE.InstancedMesh(geometry, material, 1));
    const userDepth = new THREE.MeshDepthMaterial();
    custom.customDepthMaterial = userDepth;
    scene.add(grass, custom);
    const cache = createShadowDepthMaterialCache();
    cache.assign(scene);
    const untinted = grass.customDepthMaterial;

    grass.setColorAt(1, new THREE.Color('green'));
    expect(getShadowDepthFamily(grass)).toBe('i10');
    cache.assign(scene);
    expect(grass.customDepthMaterial).not.toBe(untinted);

    grass.castShadow = false;
    cache.assign(scene);
    expect(grass.customDepthMaterial).toBeUndefined();

    grass.castShadow = true;
    cache.assign(scene);
    cache.release(scene);
    expect(grass.customDepthMaterial).toBeUndefined();
    expect(custom.customDepthMaterial).toBe(userDepth);
    cache.dispose();
  });
});
