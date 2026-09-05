import { type ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { createToonWaterMaterial } from '../../../rendering/tsl/toonWater';
import Ocean from '../mesh/water';

jest.mock('../../../rendering/tsl/toonWater', () => {
  const { MeshBasicMaterial } = jest.requireActual<typeof import('three')>('three');
  return { createToonWaterMaterial: jest.fn(() => ({
    material: new MeshBasicMaterial({ name: 'node-water-test' }), time: { value: 0 },
  })) };
});

function RendererMode({ nodes, children }: { nodes: boolean; children: ReactNode }) {
  const renderer = useThree((state) => state.gl);
  Object.assign(renderer, { isWebGPURenderer: nodes });
  return children;
}

beforeEach(() => jest.mocked(createToonWaterMaterial).mockClear());

test('legacy renderer keeps the GLSL material without loading a node material', async () => {
  const renderer = await ReactThreeTestRenderer.create(<RendererMode nodes={false}><Ocean toon /></RendererMode>);
  expect(renderer.scene.findAll((node) => node.instance instanceof THREE.Mesh
    && node.instance.material instanceof THREE.ShaderMaterial)).toHaveLength(1);
  expect(createToonWaterMaterial).not.toHaveBeenCalled();
  await renderer.unmount();
});

test('Ocean selects the lazy node material, retains it on resize and releases it on reentry', async () => {
  const renderer = await ReactThreeTestRenderer.create(<RendererMode nodes><Ocean toon size={8} /></RendererMode>);
  const factory = jest.mocked(createToonWaterMaterial);
  expect(factory).toHaveBeenCalledTimes(1);
  const first = factory.mock.results[0]!.value as ReturnType<typeof createToonWaterMaterial>;
  const dispose = jest.spyOn(first.material, 'dispose');
  expect(renderer.scene.findAll((node) => node.instance instanceof THREE.Mesh
    && node.instance.material === first.material)).toHaveLength(1);
  expect(renderer.scene.findAll((node) => node.instance instanceof THREE.Mesh
    && node.instance.material instanceof THREE.ShaderMaterial)).toHaveLength(0);
  await renderer.update(<RendererMode nodes><Ocean toon size={32} /></RendererMode>);
  expect(factory).toHaveBeenCalledTimes(1);
  expect(dispose).not.toHaveBeenCalled();
  await renderer.update(<RendererMode nodes>{null}</RendererMode>);
  expect(dispose).toHaveBeenCalledTimes(1);
  await renderer.update(<RendererMode nodes><Ocean toon /></RendererMode>);
  expect(factory).toHaveBeenCalledTimes(2);
  const second = factory.mock.results[1]!.value as ReturnType<typeof createToonWaterMaterial>;
  expect(second.material).not.toBe(first.material);
  const secondDispose = jest.spyOn(second.material, 'dispose');
  await renderer.unmount();
  expect(secondDispose).toHaveBeenCalledTimes(1);
  expect(dispose).toHaveBeenCalledTimes(1);
});

test('a removed suspended surface does not create a material when loading finishes', async () => {
  let finish!: () => void;
  const loading = new Promise<void>((resolve) => { finish = resolve; });
  const factory = jest.mocked(createToonWaterMaterial);
  let pending = true;
  const createMaterial = factory.getMockImplementation()!;
  factory.mockImplementation(() => {
    if (pending) throw loading;
    return createMaterial();
  });
  const renderer = await ReactThreeTestRenderer.create(<RendererMode nodes><Ocean toon /></RendererMode>);
  expect(factory.mock.results.every((result) => result.type === 'throw')).toBe(true);
  await renderer.update(<RendererMode nodes>{null}</RendererMode>);
  const attempts = factory.mock.calls.length;
  await ReactThreeTestRenderer.act(async () => {
    pending = false;
    finish();
    await loading;
  });
  expect(factory).toHaveBeenCalledTimes(attempts);
  await renderer.update(<RendererMode nodes><Ocean toon /></RendererMode>);
  const result = factory.mock.results.at(-1)!;
  expect(result.type).toBe('return');
  const resource = result.value as ReturnType<typeof createToonWaterMaterial>;
  const dispose = jest.spyOn(resource.material, 'dispose');
  await renderer.unmount();
  expect(dispose).toHaveBeenCalledTimes(1);
  factory.mockImplementation(createMaterial);
});
