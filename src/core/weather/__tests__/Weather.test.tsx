import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Color, DirectionalLight, HemisphereLight, Mesh, type Scene } from 'three';

import { FrameSchedulerHost } from '../../runtime/frame';
import { Weather } from '../components/Weather';
import { createWeatherLight, weatherLightOf } from '../components/Weather/lighting';
import { weatherField } from '../core/field';
import { useWeatherStore } from '../stores/weatherStore';

jest.mock('../../rendering/tsl/weather', () => ({
  createPrecipitationUniforms: jest.fn(),
  createPrecipitationNodeMaterial: jest.fn(),
}));
jest.mock('../../rendering/tsl/weatherSurface', () => ({ syncWeatherNodes: jest.fn() }));

afterEach(() => useWeatherStore.setState({ current: null, history: [] }));

test('the weather light dims and cools an overcast sky and lifts it for a flash', () => {
  const clear = weatherLightOf(weatherField, createWeatherLight());
  expect(clear).toMatchObject({ sun: 1, fill: 1, environment: 1, tintAmount: 0, skyAmount: 0 });
  const storm = weatherLightOf({ ...weatherField, overcast: 1, storm: 1, rain: 1 }, createWeatherLight());
  expect(storm.sun).toBeLessThan(0.4);
  expect(storm.fill).toBeLessThan(0.8);
  expect(storm.tintAmount).toBeGreaterThan(0.5);
  const flash = weatherLightOf({ ...weatherField, overcast: 1, storm: 1, rain: 1, lightning: 1 }, createWeatherLight());
  expect(flash.fill).toBeGreaterThan(storm.fill);
  expect(flash.environment).toBeGreaterThan(storm.environment);
  const snow = weatherLightOf({ ...weatherField, overcast: 0.6, snow: 1 }, createWeatherLight());
  expect(snow.tint.b).toBeGreaterThan(storm.tint.b);
});

test('Weather drives the field from the store, draws its layers, dims the lights and hands everything back', async () => {
  useWeatherStore.getState().setWeather('storm', 1);
  const world = (weather: boolean) => (
    <>
      <FrameSchedulerHost />
      <color attach="background" args={['#8fd3ee']} />
      <hemisphereLight args={['#ffffff', '#445566', 1.2]} />
      <directionalLight intensity={2} />
      {weather && <Weather lightning={false} />}
    </>
  );
  const view = await ReactThreeTestRenderer.create(world(true));
  const scene = view.scene.instance as unknown as Scene;
  const sun = view.scene.findByType('DirectionalLight').instance as DirectionalLight;
  const fill = view.scene.findByType('HemisphereLight').instance as HemisphereLight;
  const sky = (scene.background as Color).clone();
  try {
    await ReactThreeTestRenderer.act(async () => { await view.advanceFrames(5, 0.1); });
    expect(weatherField).toMatchObject({ rain: 1, storm: 1, wetness: 1, lightning: 0 });
    expect(sun.intensity).toBeLessThan(1);
    expect(fill.intensity).toBeLessThan(1.2);
    expect((scene.background as Color).equals(sky)).toBe(false);
    const layers = view.scene.findAll((node) => node.instance instanceof Mesh).map((node) => (node.instance as Mesh).material);
    expect(layers.map((material) => (material as { name: string }).name)).toEqual(['weather-rain', 'weather-splash', 'weather-leaves']);
    await view.update(world(false));
    expect(weatherField.rain).toBe(0);
    expect(sun.intensity).toBe(2);
    expect(fill.intensity).toBeCloseTo(1.2);
    expect((scene.background as Color).equals(sky)).toBe(true);
  } finally { await view.unmount(); }
});
