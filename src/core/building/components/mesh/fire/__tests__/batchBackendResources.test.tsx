import type { ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { FrameSchedulerHost } from '../../../../../runtime/frame';
import { FireBatch } from '..';

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
  return <><FrameSchedulerHost />{children}</>;
}

const fires = [{
  position: [0, 0, 0] as [number, number, number],
  rotation: 0,
  intensity: 1.5,
  width: 1,
  height: 1.4,
  color: '#ff9955',
}];

function collect(scene: THREE.Object3D) {
  const shaderMaterials: THREE.ShaderMaterial[] = [];
  let billboardGeometries = 0;
  scene.traverse((object) => {
    const withMaterial = object as THREE.Object3D & { material?: THREE.Material | THREE.Material[]; geometry?: THREE.BufferGeometry };
    const materials = Array.isArray(withMaterial.material) ? withMaterial.material : withMaterial.material ? [withMaterial.material] : [];
    for (const material of materials) if (material instanceof THREE.ShaderMaterial) shaderMaterials.push(material);
    if (withMaterial.geometry?.getAttribute('aSeed')) billboardGeometries++;
  });
  return { shaderMaterials, billboardGeometries };
}

test('WebGPU fire batches build no GLSL billboard or ember resources', async () => {
  const view = await ReactThreeTestRenderer.create(<RendererMode nodes><FireBatch fires={fires} /></RendererMode>);
  try {
    await view.advanceFrames(3, 1 / 60);
    const root = view.scene.instance as THREE.Object3D;
    const { shaderMaterials, billboardGeometries } = collect(root);
    expect(shaderMaterials).toEqual([]);
    expect(billboardGeometries).toBe(0);
    expect(view.scene.findAllByType('Sprite').length).toBeGreaterThan(0);
  } finally {
    await view.unmount();
  }
});

test('WebGL fire batches keep the animated GLSL billboard and ember path', async () => {
  const view = await ReactThreeTestRenderer.create(<RendererMode nodes={false}><FireBatch fires={fires} /></RendererMode>);
  try {
    const root = view.scene.instance as THREE.Object3D;
    const before = collect(root);
    expect(before.billboardGeometries).toBe(1);
    expect(before.shaderMaterials.length).toBe(2);
    // The test renderer does not advance its clock, so check that each frame rewrites the uniform.
    for (const material of before.shaderMaterials) material.uniforms['uTime']!.value = -1;
    await view.advanceFrames(1, 1 / 60);
    for (const material of before.shaderMaterials) expect(material.uniforms['uTime']!.value).not.toBe(-1);
  } finally {
    await view.unmount();
  }
});
