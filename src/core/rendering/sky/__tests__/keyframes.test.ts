import { Color } from 'three';

import { createSkySample, createSkySampler, DEFAULT_KEYFRAMES } from '../keyframes';

test('colors blend between keyframes instead of jumping at the boundary', () => {
  const sample = createSkySampler(DEFAULT_KEYFRAMES);
  const out = createSkySample();
  const at5 = sample(5, out).sunColor.clone();
  const at6 = sample(6, out).sunColor.clone();
  const at7 = sample(7, out).sunColor.clone();
  expect(at6.equals(new Color().copy(at5).lerp(at7, 0.5))).toBe(true);
  // Just before and just after a keyframe the color is continuous.
  const before = sample(6.999, out).sunColor.clone();
  const after = sample(7.001, out).sunColor.clone();
  expect(Math.abs(before.r - after.r) + Math.abs(before.g - after.g) + Math.abs(before.b - after.b)).toBeLessThan(0.01);
});

test('sampling reuses the output object and wraps hours past midnight', () => {
  const sample = createSkySampler(DEFAULT_KEYFRAMES);
  const out = createSkySample();
  expect(sample(13, out)).toBe(out);
  expect(sample(37, out).sunIntensity).toBeCloseTo(sample(13, createSkySample()).sunIntensity);
});
