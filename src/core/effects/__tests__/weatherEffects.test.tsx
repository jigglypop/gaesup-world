import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Color } from 'three';

import { weatherPrint } from '../components/Footprints';
import { LandingBurst, landingColor } from '../components/LandingBurst';

test('footprints show only on snow or wet ground, in its color', () => {
  const color = new Color();
  expect(weatherPrint({ snowCover: 0, wetness: 0 }, color)).toBe(0);
  expect(weatherPrint({ snowCover: 0.8, wetness: 0 }, color)).toBe(1);
  const snow = color.getHex();
  expect(weatherPrint({ snowCover: 0, wetness: 0.3 }, color)).toBeCloseTo(0.36);
  expect(color.getHex()).not.toBe(snow);
  expect(color.r).toBeLessThan(0.2);
});

test('a landing throws up snow, spray or dust with the weather', () => {
  const dust = landingColor({ snowCover: 0, wetness: 0 });
  const spray = landingColor({ snowCover: 0, wetness: 0.6 });
  const snow = landingColor({ snowCover: 0.6, wetness: 0.6 });
  expect(new Set([dust.getHex(), spray.getHex(), snow.getHex()]).size).toBe(3);
  expect(snow.r).toBeGreaterThan(0.85);
});

test('landing bursts stay off the classic WebGL renderer', async () => {
  const view = await ReactThreeTestRenderer.create(<LandingBurst />);
  try {
    expect(view.scene.children).toHaveLength(0);
  } finally { await view.unmount(); }
});
