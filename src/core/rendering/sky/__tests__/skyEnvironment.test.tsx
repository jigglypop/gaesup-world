import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { createSkyEnvironmentTexture, SkyEnvironment } from '../SkyEnvironment';

const pixel = (texture: THREE.DataTexture, row: number) => {
  const data = texture.image.data as Float32Array;
  const i = row * texture.image.width * 4;
  return new THREE.Color(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
};

test('the sky texture fades from ground below the horizon to sky overhead', () => {
  const texture = createSkyEnvironmentTexture('#0000ff', '#ffffff', '#00ff00');
  const top = pixel(texture, texture.image.height - 1);
  const bottom = pixel(texture, 0);
  const horizon = pixel(texture, texture.image.height / 2);
  expect(top.b).toBeGreaterThan(0.9);
  expect(top.r).toBeLessThan(0.1);
  expect(bottom.g).toBeGreaterThan(0.9);
  expect(bottom.r).toBeLessThan(0.1);
  expect(horizon.r).toBeGreaterThan(0.8);
  expect(texture.mapping).toBe(THREE.EquirectangularReflectionMapping);
  texture.dispose();
});

test('SkyEnvironment lights the scene while mounted and restores it after', async () => {
  const renderer = await ReactThreeTestRenderer.create(<SkyEnvironment intensity={0.4} />);
  const scene = renderer.scene.instance as THREE.Scene;
  expect(scene.environment).toBeInstanceOf(THREE.DataTexture);
  expect(scene.environmentIntensity).toBe(0.4);
  await renderer.unmount();
  expect(scene.environment).toBeNull();
  expect(scene.environmentIntensity).toBe(1);
});
