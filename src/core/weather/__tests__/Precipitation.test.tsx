import type { ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer, { act } from '@react-three/test-renderer';
import { InstancedBufferGeometry, Mesh, ShaderMaterial, type BufferAttribute } from 'three';

import { createPrecipitationNodeMaterial } from '../../rendering/tsl/weather';
import { FrameSchedulerHost } from '../../runtime/frame';
import { Precipitation, precipitationAmount } from '../components/Precipitation';
import { WeatherEffect } from '../components/WeatherEffect';
import { weatherField } from '../core/field';
import { useWeatherStore } from '../stores/weatherStore';

jest.mock('../../rendering/tsl/weather', () => {
  const { Color, MeshBasicMaterial, Vector2 } = jest.requireActual<typeof import('three')>('three');
  const value = <T,>(initial: T) => ({ value: initial });
  return {
    createPrecipitationUniforms: () => ({
      radius: value(0), height: value(0), ground: value(0), offset: value(new Vector2()), velocity: value(new Vector2()),
      tint: value(new Color()), tintAlt: value(new Color()),
    }),
    createPrecipitationNodeMaterial: jest.fn(() => new MeshBasicMaterial()),
  };
});

type View = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>;

function RendererMode({ nodes, children }: { nodes: boolean; children: ReactNode }) {
  const renderer = useThree((state) => state.gl);
  Object.assign(renderer, { isWebGPURenderer: nodes });
  return children;
}

const meshes = (view: View) => view.scene.findAll((node) => node.instance instanceof Mesh).map((node) => node.instance as Mesh<InstancedBufferGeometry>);

beforeEach(() => jest.mocked(createPrecipitationNodeMaterial).mockClear());
afterEach(() => useWeatherStore.setState({ current: null, history: [] }));

test('the classic path moves particles in GLSL: only the drawn count and uniforms change each frame', async () => {
  const view = await ReactThreeTestRenderer.create(<><FrameSchedulerHost /><Precipitation kind="rain" count={8} amount={0.5} /></>);
  try {
    const [mesh] = meshes(view);
    const material = mesh!.material as ShaderMaterial;
    const seeds = mesh!.geometry.getAttribute('weatherSeed') as BufferAttribute;
    expect(material).toBeInstanceOf(ShaderMaterial);
    expect(mesh!.geometry).toBeInstanceOf(InstancedBufferGeometry);
    await view.advanceFrames(2, 0.016);
    expect(mesh!.geometry.instanceCount).toBe(4);
    expect(seeds.version).toBe(0);
    expect(material.uniforms['uTime']!.value).toBeGreaterThan(0);
    expect(createPrecipitationNodeMaterial).not.toHaveBeenCalled();

    await view.update(<><FrameSchedulerHost /><Precipitation kind="rain" count={8} amount={0} /></>);
    await view.advanceFrames(1, 0.016);
    expect(mesh!.geometry.instanceCount).toBe(0);
    await view.update(<><FrameSchedulerHost /><Precipitation kind="rain" count={8} amount={1} /></>);
    await view.advanceFrames(1, 0.016);
    expect(meshes(view)[0]!.geometry).toBe(mesh!.geometry);
    expect(meshes(view)[0]!.material).toBe(material);
    expect(mesh!.geometry.instanceCount).toBe(8);
  } finally { await view.unmount(); }
});

test('the node path builds its material once and releases what it owns', async () => {
  const layer = (count: number, amount: number) => (
    <RendererMode nodes><FrameSchedulerHost /><Precipitation kind="snow" count={count} amount={amount} /></RendererMode>
  );
  const view = await ReactThreeTestRenderer.create(layer(8, 0.25));
  const [mesh] = meshes(view);
  const material = mesh!.material as ShaderMaterial;
  const materialDispose = jest.spyOn(material, 'dispose');
  const geometryDispose = jest.spyOn(mesh!.geometry, 'dispose');
  await view.advanceFrames(1, 0.016);
  expect(mesh!.geometry.instanceCount).toBe(2);
  await view.update(layer(8, 1));
  expect(createPrecipitationNodeMaterial).toHaveBeenCalledTimes(1);
  await view.update(layer(16, 1));
  expect(geometryDispose).toHaveBeenCalledTimes(1);
  expect(materialDispose).not.toHaveBeenCalled();
  await view.unmount();
  expect(materialDispose).toHaveBeenCalledTimes(1);
});

test('layers draw the share of the live weather that belongs to them', () => {
  const field = { ...weatherField, rain: 0.6, snow: 0.3, windStrength: 1.1 };
  expect(precipitationAmount('rain', field)).toBe(0.6);
  expect(precipitationAmount('splash', field)).toBe(0.6);
  expect(precipitationAmount('splash', { ...field, rain: 0.05 })).toBe(0);
  expect(precipitationAmount('snow', field)).toBe(0.3);
  expect(precipitationAmount('leaves', field)).toBe(1);
  expect(precipitationAmount('leaves', { ...field, windStrength: 0.3 })).toBe(0);
});

test('WeatherEffect draws a forced weather at full strength, or the store weather at its intensity', async () => {
  const view = await ReactThreeTestRenderer.create(<><FrameSchedulerHost /><WeatherEffect kind="rain" count={16} /></>);
  try {
    await view.advanceFrames(1, 0.016);
    expect(meshes(view).map((mesh) => mesh.geometry.instanceCount)).toEqual([16, 2]);
    await view.update(<><FrameSchedulerHost /><WeatherEffect count={16} /></>);
    expect(meshes(view)).toHaveLength(0);
    await act(async () => { useWeatherStore.getState().setWeather('snow', 0.2); });
    await view.advanceFrames(1, 0.016);
    const [snow] = meshes(view);
    expect(snow!.geometry.instanceCount).toBeGreaterThan(0);
    expect(snow!.geometry.instanceCount).toBeLessThan(16);
    await act(async () => { useWeatherStore.getState().setWeather('sunny'); });
    expect(meshes(view)).toHaveLength(0);
  } finally { await view.unmount(); }
});
