import { Color, MeshStandardMaterial, Texture } from 'three';

import { createMaterialSynchronizer, supportsGpuBatchMaterial } from '../gpuMaterialSync';

test('uniform edits propagate without changing generated identity/version or custom nodes', () => {
  const source = new MeshStandardMaterial({ color: 'red', roughness: 0.8 });
  const target = source.clone();
  const node = {};
  Object.assign(target, { positionNode: node });
  const uuid = target.uuid;
  const version = target.version;
  const sync = createMaterialSynchronizer(source, target);
  source.color.set('green'); source.roughness = 0.25; source.opacity = 0.5;
  sync();
  expect(target.color.getHex()).toBe(source.color.getHex());
  expect(target.roughness).toBe(0.25);
  expect(target.opacity).toBe(0.5);
  expect(target.uuid).toBe(uuid);
  expect(target.version).toBe(version);
  expect((target as unknown as { positionNode: object }).positionNode).toBe(node);
  source.color = new Color('blue'); source.map = new Texture();
  sync();
  expect(target.color).toBe(source.color);
  expect(target.map).toBe(source.map);
});

test('ordered transparency and unsupported normal deformation keep the original rendering path', () => {
  const material = new MeshStandardMaterial();
  expect(supportsGpuBatchMaterial(material)).toBe(true);
  material.transparent = true;
  expect(supportsGpuBatchMaterial(material)).toBe(false);
  material.transparent = false;
  expect(supportsGpuBatchMaterial(material)).toBe(true);
  material.normalMap = new Texture();
  expect(supportsGpuBatchMaterial(material)).toBe(false);
});

test('a source recompile marks the generated material for one pipeline rebuild', () => {
  const source = new MeshStandardMaterial();
  const target = source.clone();
  const sync = createMaterialSynchronizer(source, target);
  const version = target.version;
  source.map = new Texture(); source.needsUpdate = true;
  sync();
  expect(target.map).toBe(source.map);
  expect(target.version).toBe(version + 1);
  sync();
  expect(target.version).toBe(version + 1);
});
