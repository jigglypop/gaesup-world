import { act, type ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import Grass from '../Grass';
import { getGrassManager } from '../manager';
import type { GrassMaterialInstance } from '../type';

jest.mock('../../../../../rendering/tsl/grassMaterial', () => {
  const { Color, MeshBasicMaterial, Vector3 } = jest.requireActual<typeof import('three')>('three');
  return { GrassNodeMaterial: jest.fn(() => Object.assign(new MeshBasicMaterial({ name: 'grass-node-test' }), {
    uniforms: {
      time: { value: 0 }, windScale: { value: 1 }, trampleCenter: { value: new Vector3() },
      trampleStrength: { value: 0.85 }, uToon: { value: 0 }, uToonSteps: { value: 4 },
      tipColor: { value: new Color() }, bottomColor: { value: new Color() },
    },
  })) };
});
jest.mock('@core/wasm/loader', () => ({ loadCoreWasm: async () => null }));

function RendererMode({ nodes, children }: { nodes: boolean; children: ReactNode }) {
  Object.assign(useThree((state) => state.gl), { isWebGPURenderer: nodes });
  return children;
}

test.each([false, true])('grass preserves the shared manager update path (nodes: %s)', async (nodes) => {
  const loader = jest.spyOn(THREE.TextureLoader.prototype, 'load').mockImplementation(() => new THREE.Texture());
  const manager = getGrassManager();
  const initialSize = manager.size();
  const register = jest.spyOn(manager, 'register');
  const renderer = await ReactThreeTestRenderer.create(<RendererMode nodes={nodes}>
    <Grass instances={64} toon bladeTipColor="#aabbcc" />
  </RendererMode>);
  const mesh = renderer.scene.find((node) => node.instance instanceof THREE.Mesh
    && node.instance.geometry instanceof THREE.InstancedBufferGeometry).instance as THREE.Mesh<THREE.InstancedBufferGeometry>;
  const material = mesh.material as GrassMaterialInstance;
  expect(material.name === 'grass-node-test').toBe(nodes);
  expect(manager.size()).toBe(initialSize + 1);
  expect(mesh.geometry.instanceCount).toBeGreaterThan(0);
  expect(material.uniforms.uToon?.value).toBe(1);
  expect(material.uniforms.tipColor?.value).toEqual(new THREE.Color('#aabbcc').convertSRGBToLinear());
  const ground = renderer.scene.find((node) => node.instance instanceof THREE.Mesh
    && node.instance.geometry instanceof THREE.PlaneGeometry).instance as THREE.Mesh<THREE.PlaneGeometry>;
  ground.updateWorldMatrix(true, false);
  const bounds = new THREE.Box3().setFromObject(ground);
  const size = bounds.getSize(new THREE.Vector3());
  expect(size.x).toBeCloseTo(4);
  expect(size.z).toBeCloseTo(4);
  expect(size.y).toBeLessThanOrEqual(0.2);
  const normals = ground.geometry.getAttribute('normal');
  for (let index = 0; index < normals.count; index++) expect(normals.getY(index)).toBeGreaterThan(0.9);
  const apply = register.mock.calls.at(-1)![0].apply;
  const center = new THREE.Vector3(1, 0, 2);
  apply({ visible: false, instanceCount: 7, time: 4, windScale: 0.6, trampleCenter: center, trampleStrength: 0.4 });
  expect(mesh.visible).toBe(false);
  expect(mesh.geometry.instanceCount).toBe(7);
  expect(material.uniforms.time?.value).toBe(4);
  expect(material.uniforms.windScale?.value).toBe(0.6);
  expect(material.uniforms.trampleCenter?.value).toEqual(center);
  expect(material.uniforms.trampleCenter?.value).not.toBe(center);
  const dispose = jest.spyOn(material, 'dispose');
  await renderer.unmount();
  expect(manager.size()).toBe(initialSize);
  expect(dispose).toHaveBeenCalled();
  register.mockRestore();
  loader.mockRestore();
});

test.each([false, true])('grass releases replaced and late textures (nodes: %s)', async (nodes) => {
  const pending: Array<() => void> = [];
  const disposals: jest.SpyInstance[] = [];
  const loader = jest.spyOn(THREE.TextureLoader.prototype, 'load').mockImplementation((_url, onLoad) => {
    const texture = new THREE.Texture();
    disposals.push(jest.spyOn(texture, 'dispose'));
    pending.push(() => onLoad?.(texture));
    return texture;
  });
  const renderGrass = (url: string) => <RendererMode nodes={nodes}><Grass instances={4} bladeDiffuseUrl={url} /></RendererMode>;
  const renderer = await ReactThreeTestRenderer.create(renderGrass('first.png'));
  await act(async () => { pending.splice(0).forEach((resolve) => resolve()); });
  expect(disposals).toHaveLength(2);
  disposals.forEach((dispose) => expect(dispose).not.toHaveBeenCalled());
  await renderer.update(renderGrass('second.png'));
  disposals.slice(0, 2).forEach((dispose) => expect(dispose).not.toHaveBeenCalled());
  await act(async () => { pending.splice(0).forEach((resolve) => resolve()); });
  disposals.slice(0, 2).forEach((dispose) => expect(dispose).toHaveBeenCalledTimes(1));
  disposals.slice(2).forEach((dispose) => expect(dispose).not.toHaveBeenCalled());
  await renderer.update(renderGrass('late.png'));
  await renderer.unmount();
  disposals.slice(0, 4).forEach((dispose) => expect(dispose).toHaveBeenCalledTimes(1));
  await act(async () => { pending.splice(0).forEach((resolve) => resolve()); });
  expect(disposals).toHaveLength(6);
  disposals.forEach((dispose) => expect(dispose).toHaveBeenCalledTimes(1));
  loader.mockRestore();
});
