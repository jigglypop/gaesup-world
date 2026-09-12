import type { ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import Fire, { FireBatch } from '..';

jest.mock('three/webgpu', () => jest.requireActual('three'));
jest.mock('../../../../../rendering/tsl/fire', () => {
  const { SpriteMaterial } = jest.requireActual<typeof import('three')>('three');
  return {
    EmberSpriteNodeMaterial: jest.fn(() => Object.assign(new SpriteMaterial({ name: 'node-ember' }), { time: 0 })),
    FireSpriteNodeMaterial: jest.fn(() => Object.assign(new SpriteMaterial({ name: 'node-fire' }), { time: 0 })),
  };
});

function RendererMode({ nodes, children }: { nodes: boolean; children: ReactNode }) {
  Object.assign(useThree((state) => state.gl), { isWebGPURenderer: nodes });
  return children;
}

test('standalone fire uses instanced node sprites for flames and embers on WebGPU', async () => {
  const view = await ReactThreeTestRenderer.create(<RendererMode nodes><Fire /></RendererMode>);
  try {
    const sprites = view.scene.findAllByType('Sprite').map((node) => node.instance as THREE.Sprite);
    expect(sprites.map((sprite) => sprite.count).sort((a, b) => a - b)).toEqual([3, 18]);
    expect(view.scene.findAllByType('Points')).toHaveLength(0);
    const flame = sprites.find((sprite) => sprite.count === 3)!;
    const flameAttributes = [
      'firePosition', 'fireScale', 'fireSeed', 'fireLean', 'fireFlare',
      'fireIntensity', 'fireSpeed', 'fireTimeOffset', 'fireTint',
    ].map((name) => flame.geometry.getAttribute(name) as THREE.InterleavedBufferAttribute);
    expect(new Set(flameAttributes.map((attribute) => attribute.data)).size).toBe(1);
    expect(flameAttributes[0]?.data).toBeInstanceOf(THREE.InstancedInterleavedBuffer);
    const disposals = sprites.map((sprite) => jest.spyOn(sprite.material, 'dispose'));
    await view.unmount();
    disposals.forEach((dispose) => expect(dispose).toHaveBeenCalledTimes(1));
  } finally {
    await view.unmount();
  }
});

test('batched fire keeps GLSL points on WebGL and selects node sprites on WebGPU', async () => {
  const fires = [{
    position: [2, 0, 4] as [number, number, number],
    rotation: 0,
    intensity: 2,
    width: 1.2,
    height: 1.6,
    color: '#ff8844',
  }];
  const view = await ReactThreeTestRenderer.create(
    <RendererMode nodes={false}><FireBatch fires={fires} /></RendererMode>,
  );
  expect(view.scene.findAllByType('Points')).toHaveLength(1);
  expect(view.scene.findAllByType('Sprite')).toHaveLength(0);
  await view.unmount();

  const nodeView = await ReactThreeTestRenderer.create(
    <RendererMode nodes><FireBatch fires={fires} /></RendererMode>,
  );
  expect(nodeView.scene.findAllByType('Points')).toHaveLength(0);
  const sprites = nodeView.scene.findAllByType('Sprite').map((node) => node.instance as THREE.Sprite);
  expect(sprites.map((sprite) => sprite.count).sort((a, b) => a - b)).toEqual([3, 18]);
  await nodeView.unmount();
});
