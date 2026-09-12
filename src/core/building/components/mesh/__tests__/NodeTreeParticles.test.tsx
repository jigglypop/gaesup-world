import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import NodeTreeParticles from '../NodeTreeParticles';

function createParticleGeometry(falling: boolean) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([1, 2, 3, 4, 5, 6], 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute([1, 0.5, 0.2, 0.9, 0.4, 0.3], 3));
  if (falling) {
    geometry.setAttribute('aParams1', new THREE.Float32BufferAttribute([0.2, 0.1, 0.3, 1, 0.3, 0.2, 0.4, 1.2], 4));
    geometry.setAttribute('aParams2', new THREE.Float32BufferAttribute([0.1, 0.2, 0.2, 0.3], 2));
    geometry.setAttribute('aTreePos', new THREE.Float32BufferAttribute([10, 0, 20, 10, 0, 20], 3));
    geometry.setAttribute('aPointScale', new THREE.Float32BufferAttribute([0.8, 1.2], 1));
  }
  return geometry;
}

test('builds sprite instances from the source particle geometry and owns cloned GPU resources', async () => {
  const source = createParticleGeometry(false);
  const view = await ReactThreeTestRenderer.create(
    <NodeTreeParticles geometry={source} size={0.08} opacity={0.82} />,
  );
  const sprite = view.scene.findByType('Sprite').instance as THREE.Sprite;
  expect(sprite.count).toBe(2);
  expect(sprite.frustumCulled).toBe(false);
  expect(sprite.geometry).not.toBe(source);
  expect(sprite.geometry.getAttribute('particlePosition').count).toBe(2);
  expect(sprite.geometry.getAttribute('particleColor').count).toBe(2);

  const disposeGeometry = jest.spyOn(sprite.geometry, 'dispose');
  const disposeMaterial = jest.spyOn(sprite.material, 'dispose');
  await view.unmount();
  expect(disposeGeometry).toHaveBeenCalledTimes(1);
  expect(disposeMaterial).toHaveBeenCalledTimes(1);
  expect(source.getAttribute('position').count).toBe(2);
});

test('keeps falling offsets and per-particle size on the instanced sprite path', async () => {
  const source = createParticleGeometry(true);
  const view = await ReactThreeTestRenderer.create(
    <NodeTreeParticles geometry={source} size={0.11} opacity={0.88} falling />,
  );
  const sprite = view.scene.findByType('Sprite').instance as THREE.Sprite;
  expect(sprite.count).toBe(2);
  expect(sprite.geometry.getAttribute('aTreePos').count).toBe(2);
  expect(sprite.geometry.getAttribute('aPointScale').count).toBe(2);
  expect((sprite.material as THREE.Material & { sizeNode?: unknown }).sizeNode).toBeDefined();
  await view.unmount();
});
