import type { ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { BufferAttribute, Points, Sprite } from 'three';

import { WeatherNodeMaterial } from '../../rendering/tsl/weather';
import { FrameSchedulerHost } from '../../runtime/frame';
import { WeatherEffect } from '../components/WeatherEffect';

jest.mock('three/webgpu', () => jest.requireActual('three'));
jest.mock('../../rendering/tsl/weather', () => {
  const { SpriteMaterial } = jest.requireActual<typeof import('three')>('three');
  return { WeatherNodeMaterial: jest.fn(() => Object.assign(new SpriteMaterial(), { setMotion: jest.fn() })) };
});

function RendererMode({ nodes, children }: { nodes: boolean; children: ReactNode }) {
  const renderer = useThree((state) => state.gl);
  Object.assign(renderer, { isWebGPURenderer: nodes });
  return children;
}

beforeEach(() => jest.mocked(WeatherNodeMaterial).mockClear());

test('legacy weather keeps Points and does not construct node materials', async () => {
  const view = await ReactThreeTestRenderer.create(<RendererMode nodes={false}><WeatherEffect kind="rain" count={8} /></RendererMode>);
  try {
    expect(view.scene.findByType('Points').instance).toBeInstanceOf(Points);
    expect(WeatherNodeMaterial).not.toHaveBeenCalled();
  } finally { await view.unmount(); }
});

test('node weather animates on the renderer time node without rewriting particle attributes or rebuilding for wind', async () => {
  const view = await ReactThreeTestRenderer.create(<RendererMode nodes><FrameSchedulerHost /><WeatherEffect kind="rain" count={8} followCamera /></RendererMode>);
  try {
    const sprite = view.scene.findByType('Sprite').instance as Sprite;
    const positions = sprite.geometry.getAttribute('weatherPosition') as BufferAttribute;
    const storage = positions.array;
    const geometry = sprite.geometry;
    const geometryDispose = jest.spyOn(geometry, 'dispose');
    const materialDispose = jest.spyOn(sprite.material, 'dispose');
    expect(sprite.count).toBe(8);
    expect(positions.count).toBe(8);
    positions.setY(0, 5);
    await view.advanceFrames(1, 0.01);
    expect(positions.getY(0)).toBe(5);
    expect(positions.version).toBe(0);
    expect(sprite.geometry.getAttribute('weatherSpeed').count).toBe(8);
    expect(sprite.position.toArray()).not.toEqual([0, 0, 0]);
    await view.update(<RendererMode nodes><FrameSchedulerHost /><WeatherEffect kind="rain" count={8} /></RendererMode>);
    expect(sprite.geometry).toBe(geometry);
    expect(positions.array).toBe(storage);
    expect(WeatherNodeMaterial).toHaveBeenCalledTimes(1);
    await view.update(<RendererMode nodes><FrameSchedulerHost /><WeatherEffect kind="rain" count={8} wind={3} /></RendererMode>);
    expect(WeatherNodeMaterial).toHaveBeenCalledTimes(1);
    expect((sprite.material as unknown as { setMotion: jest.Mock }).setMotion).toHaveBeenLastCalledWith({ area: 80, height: 18, wind: 3 });
    await view.update(<RendererMode nodes>{null}</RendererMode>);
    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
  } finally { await view.unmount(); }
});
