import { Vector4 } from 'three';
import { DataTexture } from 'three/webgpu';

import { createGlslWaterMaterial } from '../../building/components/mesh/water/glsl';
import { WATER_BED_MARK } from '../../building/components/mesh/water/shading';
import { weatherGlUniforms } from '../../weather/core/glsl';
import { createToonWaterMaterial } from '../tsl/toonWater';
import { createWaterBedMaterial } from '../tsl/waterBed';

const field = { texture: new DataTexture(new Uint8Array([255, 255, 0, 255]), 1, 1), transform: new Vector4(0, 0, 1, 1) };

test.each([
  { toon: true, open: true },
  { toon: false, open: true },
  { toon: true, open: false },
  { toon: false, open: false },
])('water surface (toon $toon, open $open) shows the frame behind it and draws after the opaque scene', ({ toon, open }) => {
  const { material } = createToonWaterMaterial(undefined, { toon, open, field });
  expect(material.transparent).toBe(true);
  expect(material.depthWrite).toBe(false);
  expect(material.backdropNode).not.toBeNull();
  expect(material.backdropAlphaNode).not.toBeNull();
  // Only a pond fades out across its bank; the open sea is solid where it is not see-through.
  expect(material.opacityNode !== null).toBe(!open);
  material.dispose();
});

test('a water floor marks the frame, and a pond floor ends at its bank over the tile it lies on', () => {
  const sea = createWaterBedMaterial(field, true);
  expect(sea.outputNode).not.toBeNull();
  expect(sea.transparent).toBe(false);
  expect(sea.polygonOffset).toBe(false);
  const pond = createWaterBedMaterial(null, false);
  expect(pond.alphaTest).toBeGreaterThan(0);
  expect(pond.polygonOffset).toBe(true);
  expect(WATER_BED_MARK).toBeLessThan(1);
  sea.dispose();
  pond.dispose();
});

test('classic water rings with rain, swells with the wind and reads both from the shared uniforms', () => {
  const material = createGlslWaterMaterial({ normals: field.texture });
  const shared = weatherGlUniforms();
  expect(material.uniforms['weatherRain']).toBe(shared.weatherRain);
  expect(material.uniforms['weatherWind']).toBe(shared.weatherWind);
  expect(material.vertexShader).toContain('(weatherWind + 0.8)');
  expect(material.fragmentShader).toContain('rainRipples(p)');
  material.dispose();
});
