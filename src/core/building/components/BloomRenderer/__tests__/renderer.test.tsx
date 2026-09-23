import type { ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { BloomRenderer } from '..';

jest.mock('three/webgpu', () => jest.requireActual('three'));
jest.mock('../../../../rendering/tsl/fire', () => {
  const { SpriteMaterial } = jest.requireActual<typeof import('three')>('three');
  return {
    BloomSpriteNodeMaterial: jest.fn(() => new SpriteMaterial({ name: 'node-bloom' })),
  };
});

function RendererMode({ nodes, children }: { nodes: boolean; children: ReactNode }) {
  Object.assign(useThree((state) => state.gl), { isWebGPURenderer: nodes });
  return children;
}

const blooms = [
  { id: 'a', position: { x: 1, y: 2, z: 3 }, intensity: 2, color: '#00aaff' },
  { id: 'b', position: { x: 4, y: 5, z: 6 }, intensity: 3, color: '#00aaff' },
];

test('batched bloom selects a TSL sprite and owns its resources on WebGPU', async () => {
  const view = await ReactThreeTestRenderer.create(
    <RendererMode nodes><BloomRenderer blooms={blooms} isEditMode={false} /></RendererMode>,
  );
  const sprite = view.scene.findByType('Sprite').instance as THREE.Sprite;
  expect(sprite.count).toBe(2);
  expect(sprite.geometry.getAttribute('bloomPosition').count).toBe(2);
  expect(view.scene.findAll((node) => node.instance instanceof THREE.InstancedMesh
    && node.instance.material instanceof THREE.ShaderMaterial)).toHaveLength(0);
  const disposeGeometry = jest.spyOn(sprite.geometry, 'dispose');
  const disposeMaterial = jest.spyOn(sprite.material, 'dispose');
  await view.unmount();
  expect(disposeGeometry).toHaveBeenCalledTimes(1);
  expect(disposeMaterial).toHaveBeenCalledTimes(1);
});

test('batched bloom retains its GLSL billboard on WebGL', async () => {
  const view = await ReactThreeTestRenderer.create(
    <RendererMode nodes={false}><BloomRenderer blooms={blooms} isEditMode={false} /></RendererMode>,
  );
  expect(view.scene.findAllByType('Sprite')).toHaveLength(0);
  expect(view.scene.findAll((node) => node.instance instanceof THREE.InstancedMesh
    && node.instance.material instanceof THREE.ShaderMaterial)).toHaveLength(1);
  await view.unmount();
});
