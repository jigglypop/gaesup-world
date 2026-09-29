import { Vector2, Vector4 } from 'three';
import { DataTexture, MeshStandardNodeMaterial, MeshToonNodeMaterial } from 'three/webgpu';

import { createCoverMaterial } from '../tsl/groundCover';

const shore = { texture: new DataTexture(new Uint8Array([128, 0, 0, 255]), 1, 1), transform: new Vector4(0, 0, 1, 1) };
const trail = { texture: new DataTexture(new Uint8Array([0]), 1, 1), center: new Vector2(), size: 24, texels: 512 };

test.each(['sand', 'snow'] as const)('a lit %s cover shades relief and glints in its own lighting', (kind) => {
  const material = createCoverMaterial({ kind, shore, trail });
  expect(material).toBeInstanceOf(MeshStandardNodeMaterial);
  const lit = material as MeshStandardNodeMaterial;
  expect(lit.vertexColors).toBe(true);
  expect(lit.colorNode).not.toBeNull();
  expect(lit.normalNode).not.toBeNull();
  expect(lit.roughnessNode).not.toBeNull();
  expect(lit.transparent).toBe(false);
  const model = lit.setupLightingModel();
  expect(Object.prototype.hasOwnProperty.call(model, 'direct')).toBe(true);
  // Only snow tints its ambient light.
  expect(Object.prototype.hasOwnProperty.call(model, 'indirect')).toBe(kind === 'snow');
  material.dispose();
});

test('a toon cover keeps its color detail on the toon steps; a fringe blends over the floor', () => {
  const toon = createCoverMaterial({ kind: 'snow', toon: true });
  expect(toon).toBeInstanceOf(MeshToonNodeMaterial);
  expect(toon.colorNode).not.toBeNull();
  expect(toon.normalNode).toBeNull();
  const fringe = createCoverMaterial({ kind: 'sand', fringe: true });
  expect(fringe.transparent).toBe(true);
  expect(fringe.depthWrite).toBe(false);
  expect(fringe.polygonOffset).toBe(true);
  expect(fringe.name).toBe('sand-cover-fringe');
  toon.dispose();
  fringe.dispose();
});
