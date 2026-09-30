import type { ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { FrameSchedulerHost, getSharedFrameEntryCount, useCanvasFrameScheduler, type FrameScheduler } from '../../../../runtime/frame';
import NodeTreeParticles from '../NodeTreeParticles';
import { SakuraBatch, type SakuraTreeEntry } from '../sakura';

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

test('떨어지는 나무 파티클만 공유 프레임 채널 하나에 등록한다', async () => {
  let scheduler: FrameScheduler | null = null;
  function Probe() {
    scheduler = useCanvasFrameScheduler();
    return null;
  }
  const falling = createParticleGeometry(true);
  const still = createParticleGeometry(false);
  const view = await ReactThreeTestRenderer.create(
    <>
      <Probe />
      {[0, 1, 2].map((i) => <NodeTreeParticles key={`falling-${i}`} geometry={falling} size={0.1} opacity={1} falling />)}
      {[0, 1].map((i) => <NodeTreeParticles key={`still-${i}`} geometry={still} size={0.1} opacity={1} />)}
    </>,
  );
  expect(getSharedFrameEntryCount(scheduler!, { phase: 'effects', label: 'building:tree-particles' })).toBe(3);
  await view.unmount();
});

test('a new particle set with the same inputs, size or opacity keeps the material, and so the pipeline', async () => {
  const view = await ReactThreeTestRenderer.create(
    <NodeTreeParticles geometry={createParticleGeometry(true)} size={1} opacity={0.88} falling />,
  );
  try {
    const sprite = view.scene.findByType('Sprite').instance as THREE.Sprite;
    const { material } = sprite;
    const version = material.version;
    await view.update(<NodeTreeParticles geometry={createParticleGeometry(true)} size={1.2} opacity={0.7} falling />);
    expect(view.scene.findByType('Sprite').instance).toBe(sprite);
    expect(sprite.material).toBe(material);
    expect(material.version).toBe(version);
    expect(sprite.count).toBe(2);
  } finally {
    await view.unmount();
  }
});

function WebGPUMode({ children }: { children: ReactNode }) {
  // The test renderer cannot build node shaders, so gates skip straight to showing their content.
  Object.assign(useThree((state) => state.gl), {
    isWebGPURenderer: true, backend: { isWebGPUBackend: true }, compileAsync: () => Promise.resolve(),
  });
  return <><FrameSchedulerHost />{children}</>;
}

const trees = (count: number): SakuraTreeEntry[] =>
  Array.from({ length: count }, (_, i) => ({ position: [i * 4, 0, 0], size: 1, treeKind: 'sakura' }));

function petals(root: THREE.Object3D) {
  const found: THREE.Object3D[] = [];
  root.traverse((object) => { if ((object as { isPoints?: boolean }).isPoints || (object as { isSprite?: boolean }).isSprite) found.push(object); });
  return found as THREE.Sprite[];
}

test('WebGPU draws sakura petals as sized sprites, and another tree keeps their materials', async () => {
  const lazyLoaded = () => ReactThreeTestRenderer.act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  const view = await ReactThreeTestRenderer.create(<WebGPUMode><SakuraBatch trees={trees(12)} /></WebGPUMode>);
  try {
    await lazyLoaded();
    const root = view.scene.instance as THREE.Object3D;
    // Points draw one pixel wide on WebGPU, and the GLSL falling petals do not run there at all.
    const before = petals(root);
    expect(before.map((object) => object.type)).toEqual(['Sprite', 'Sprite', 'Sprite']);
    const materials = before.map((sprite) => sprite.material);
    const counts = before.map((sprite) => sprite.count);
    await view.update(<WebGPUMode><SakuraBatch trees={trees(13)} /></WebGPUMode>);
    await lazyLoaded();
    petals(root).forEach((sprite, index) => {
      expect(sprite.material).toBe(materials[index]);
      expect(sprite.count).toBeGreaterThan(counts[index]!);
    });
  } finally {
    await view.unmount();
  }
});
