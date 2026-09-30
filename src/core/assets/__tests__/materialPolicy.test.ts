import * as THREE from 'three';

import { normalizeImportedMaterials } from '../materialPolicy';

function figure(material: THREE.Material) {
  const root = new THREE.Group();
  root.add(new THREE.Mesh(new THREE.BoxGeometry(), material));
  return { root, mesh: root.children[0] as THREE.Mesh };
}

test('the figure policy draws matte and keeps colour and relief maps', () => {
  const map = new THREE.Texture();
  const normalMap = new THREE.Texture();
  const source = new THREE.MeshPhysicalMaterial({
    color: '#ff8800', map, normalMap, roughness: 0.3, metalness: 1, roughnessMap: new THREE.Texture(), specularIntensity: 0.8,
  });
  const { root, mesh } = figure(source);
  const undo = normalizeImportedMaterials(root, 'figure');
  const matte = mesh.material as THREE.MeshStandardMaterial;
  expect(matte).not.toBe(source);
  expect((matte as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial).toBeUndefined();
  expect(matte.roughness).toBe(1);
  expect(matte.metalness).toBe(0);
  expect(matte.roughnessMap).toBeNull();
  expect(matte.map).toBe(map);
  expect(matte.normalMap).toBe(normalMap);
  expect(matte.color.getHexString()).toBe('ff8800');
  undo();
  expect(mesh.material).toBe(source);
});

test('clones of one model share each converted material, and disposing the source disposes them', () => {
  const source = new THREE.MeshStandardMaterial({ roughness: 0.2 });
  const first = figure(source);
  const second = figure(source);
  normalizeImportedMaterials(first.root, 'figure');
  normalizeImportedMaterials(second.root, 'figure');
  expect(first.mesh.material).toBe(second.mesh.material);
  const dispose = jest.fn();
  (first.mesh.material as THREE.Material).addEventListener('dispose', dispose);
  source.dispose();
  expect(dispose).toHaveBeenCalledTimes(1);
});

test('the prop policy only fixes a metallic factor without a map and needless physical materials', () => {
  const plain = new THREE.MeshStandardMaterial({ metalness: 0, roughness: 0.4 });
  const metal = new THREE.MeshStandardMaterial({ metalness: 1 });
  const mapped = new THREE.MeshStandardMaterial({ metalness: 1, metalnessMap: new THREE.Texture() });
  const physical = new THREE.MeshPhysicalMaterial({ metalness: 0, transmission: 0 });
  const glass = new THREE.MeshPhysicalMaterial({ transmission: 1 });
  const [a, b, c, d, e] = [plain, metal, mapped, physical, glass].map((material) => {
    const { root, mesh } = figure(material);
    normalizeImportedMaterials(root, 'prop');
    return mesh.material as THREE.MeshStandardMaterial;
  });
  expect(a).toBe(plain);
  expect(b!.metalness).toBe(0);
  expect(c).toBe(mapped);
  expect((d as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial).toBeUndefined();
  expect(e).toBe(glass);
});

test('keep changes nothing', () => {
  const source = new THREE.MeshStandardMaterial({ metalness: 1 });
  const { root, mesh } = figure(source);
  normalizeImportedMaterials(root, 'keep')();
  expect(mesh.material).toBe(source);
});
