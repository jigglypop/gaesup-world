import * as THREE from 'three';

import { sceneLighting } from '../zones';

function scene() {
  const root = new THREE.Scene();
  const sun = new THREE.DirectionalLight('#ffffff', 2);
  const fill = new THREE.HemisphereLight('#eaf6ff', '#6f8a57', 1.2);
  const lamp = new THREE.PointLight('#ffcc88', 3);
  root.add(sun, fill, lamp);
  root.environmentIntensity = 0.4;
  return { root, sun, fill, lamp };
}

test('the strongest zone scales the sun, fill and environment and the last one out puts them back', () => {
  const { root, sun, fill, lamp } = scene();
  const lighting = sceneLighting(root);
  const zone = { blend: 0.5, profile: { sun: 0.2, fill: 0.5, sky: '#ff0000', environment: 0 } };
  lighting.zones.set(zone, zone);
  lighting.apply();
  expect(sun.intensity).toBeCloseTo(2 * 0.6);
  expect(fill.intensity).toBeCloseTo(1.2 * 0.75);
  expect(fill.color.r).toBeGreaterThan(new THREE.Color('#eaf6ff').r - 1e-6);
  expect(fill.color.g).toBeLessThan(new THREE.Color('#eaf6ff').g);
  expect(root.environmentIntensity).toBeCloseTo(0.2);
  // Point lights, such as a zone's own lamp, keep their level.
  expect(lamp.intensity).toBe(3);
  expect(lighting.blend()).toBe(0.5);

  zone.blend = 1;
  lighting.apply();
  expect(sun.intensity).toBeCloseTo(0.4);
  zone.blend = 0;
  lighting.apply();
  expect(sun.intensity).toBe(2);
  expect(fill.intensity).toBe(1.2);
  expect(fill.color.getHexString()).toBe(new THREE.Color('#eaf6ff').getHexString());
  expect(root.environmentIntensity).toBe(0.4);
});

test('levels changed while no zone applies are the ones the next zone scales', () => {
  const { root, sun } = scene();
  const lighting = sceneLighting(root);
  const zone = { blend: 1, profile: { sun: 0.5 } };
  lighting.zones.set(zone, zone);
  lighting.apply();
  zone.blend = 0;
  lighting.apply();
  sun.intensity = 4;
  zone.blend = 1;
  lighting.apply();
  expect(sun.intensity).toBe(2);
  lighting.zones.delete(zone);
  lighting.apply();
  expect(sun.intensity).toBe(4);
});
