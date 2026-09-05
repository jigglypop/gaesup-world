import type { ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { SnowNodeMaterial } from '../../../rendering/tsl/snow';
import { Snow } from '../mesh/snow';

jest.mock('three/webgpu', () => jest.requireActual('three'));
jest.mock('../../../rendering/tsl/snow', () => {
  const { SpriteMaterial, Vector3 } = jest.requireActual<typeof import('three')>('three');
  return { SnowNodeMaterial: jest.fn(() => Object.assign(new SpriteMaterial(), { time: 0, origin: new Vector3() })) };
});

function RendererMode({ nodes, children }: { nodes: boolean; children: ReactNode }) {
  const renderer = useThree((state) => state.gl);
  Object.assign(renderer, { isWebGPURenderer: nodes });
  return children;
}

beforeEach(() => jest.mocked(SnowNodeMaterial).mockClear());

test('WebGL keeps the point shader without constructing the node effect', async () => {
  const view = await ReactThreeTestRenderer.create(<RendererMode nodes={false}><Snow gpu /></RendererMode>);
  try {
    const points = view.scene.findByType('Points').instance as THREE.Points;
    expect(points.material).toBeInstanceOf(THREE.ShaderMaterial);
    expect(SnowNodeMaterial).not.toHaveBeenCalled();
  } finally { await view.unmount(); }
});

test('node renderer owns an instanced snow sprite and disposes its resources', async () => {
  const view = await ReactThreeTestRenderer.create(<RendererMode nodes><Snow gpu followCamera /></RendererMode>);
  try {
    const sprite = view.scene.findByType('Sprite').instance as THREE.Sprite;
    const material = sprite.material as unknown as SnowNodeMaterial;
    const disposeGeometry = jest.spyOn(sprite.geometry, 'dispose');
    const disposeMaterial = jest.spyOn(sprite.material, 'dispose');
    expect(sprite.count).toBe(2000);
    expect(sprite.geometry.getAttribute('snowParticle').count).toBe(2000);
    expect(sprite.geometry.getAttribute('snowDrift').count).toBe(2000);
    await view.advanceFrames(1, 1 / 60);
    expect(material.origin.toArray()).not.toEqual([0, 0, 0]);
    const first = sprite.geometry;
    await view.update(<RendererMode nodes><Snow gpu /></RendererMode>);
    expect(sprite.geometry).toBe(first);
    expect(SnowNodeMaterial).toHaveBeenCalledTimes(1);
    await view.update(<RendererMode nodes>{null}</RendererMode>);
    expect(disposeGeometry).toHaveBeenCalledTimes(1);
    expect(disposeMaterial).toHaveBeenCalledTimes(1);
  } finally { await view.unmount(); }
});
