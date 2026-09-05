import ReactThreeTestRenderer, { act } from '@react-three/test-renderer';
import { Points, type BufferGeometry, type PointsMaterial } from 'three';

import { WeatherEffect } from '../components/WeatherEffect';
import { useWeatherStore } from '../stores/weatherStore';

afterEach(() => useWeatherStore.setState({ current: null, history: [] }));

test('weather intensity changes retain particles and a forced kind ignores unrelated weather', async () => {
  useWeatherStore.getState().setWeather('rain', 0.2);
  const renderer = await ReactThreeTestRenderer.create(<WeatherEffect count={8} />);
  const points = renderer.scene.find((node) => node.instance instanceof Points).instance as Points<BufferGeometry, PointsMaterial>;
  const geometry = points.geometry;
  const material = points.material;
  const position = geometry.getAttribute('position');
  position.setY(0, 5);
  await act(async () => { useWeatherStore.getState().setWeather('rain', 0.9); });
  expect(points.geometry).toBe(geometry);
  expect(points.material).toBe(material);
  expect(position.getY(0)).toBe(5);
  await renderer.update(<WeatherEffect kind="rain" count={8} />);
  await act(async () => { useWeatherStore.getState().setWeather('snow'); });
  expect(points.geometry).toBe(geometry);
  expect(points.material).toBe(material);
  await renderer.advanceFrames(1, 0.01);
  expect(position.getY(0)).toBeLessThan(5);
  await renderer.unmount();
});

test('replaced and removed weather effects dispose their owned GPU resources', async () => {
  const renderer = await ReactThreeTestRenderer.create(<WeatherEffect kind="rain" count={8} />);
  const findPoints = () => renderer.scene.find((node) => node.instance instanceof Points).instance as Points<BufferGeometry, PointsMaterial>;
  const first = findPoints();
  const firstGeometryDispose = jest.spyOn(first.geometry, 'dispose');
  const firstMaterialDispose = jest.spyOn(first.material, 'dispose');
  await renderer.update(<WeatherEffect kind="snow" count={16} />);
  expect(firstGeometryDispose).toHaveBeenCalledTimes(1);
  expect(firstMaterialDispose).toHaveBeenCalledTimes(1);
  const second = findPoints();
  const secondGeometryDispose = jest.spyOn(second.geometry, 'dispose');
  const secondMaterialDispose = jest.spyOn(second.material, 'dispose');
  await renderer.update(<WeatherEffect count={16} />);
  expect(renderer.scene.children).toHaveLength(0);
  expect(secondGeometryDispose).toHaveBeenCalledTimes(1);
  expect(secondMaterialDispose).toHaveBeenCalledTimes(1);
  await renderer.update(<WeatherEffect kind="wind" count={8} />);
  const third = findPoints();
  const thirdGeometryDispose = jest.spyOn(third.geometry, 'dispose');
  const thirdMaterialDispose = jest.spyOn(third.material, 'dispose');
  await renderer.unmount();
  expect(thirdGeometryDispose).toHaveBeenCalledTimes(1);
  expect(thirdMaterialDispose).toHaveBeenCalledTimes(1);
});
