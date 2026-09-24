import {
  compactVisible,
  cullAndCompactSpheres,
  cullSpheres,
  extractFrustumPlanes,
} from '../core/culling';

const planes = extractFrustumPlanes(
  new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  new Float32Array(24),
);

test('rejects undersized buffers and invalid counts instead of publishing unwritten indices', () => {
  expect(() =>
    cullAndCompactSpheres(planes, new Float32Array(3), 1, 2, new Uint32Array(2)),
  ).toThrow(RangeError);
  expect(() =>
    cullAndCompactSpheres(planes, new Float32Array(6), 1, 2, new Uint32Array(1)),
  ).toThrow(RangeError);
  expect(() =>
    cullAndCompactSpheres(planes, new Float32Array(3), 1, -1, new Uint32Array(1)),
  ).toThrow(RangeError);
});

test('fused culling preserves ordered source indices, touching bounds and a reused output buffer', () => {
  const positions = new Float32Array([0, 0, 0, 8, 0, 0, 1.5, 0, 0, 0, -1.5, 0, 0, 0, 8]);
  const out = new Uint32Array(5).fill(99);
  expect(cullAndCompactSpheres(planes, positions, 0.5, 5, out)).toBe(3);
  expect([...out.subarray(0, 3)]).toEqual([0, 2, 3]);
  expect(cullAndCompactSpheres(planes, positions, 0.1, 5, out)).toBe(1);
  expect(out[0]).toBe(0);
  expect(cullAndCompactSpheres(planes, positions, 1, 0, out)).toBe(0);
});

test('fused culling matches the separate reference passes across a deterministic scene', () => {
  const count = 8192;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < positions.length; i += 1) positions[i] = Math.sin(i * 17.37) * 4;
  const visibility = new Uint8Array(count);
  const expected = new Uint32Array(count);
  const actual = new Uint32Array(count);
  for (const radius of [0, 0.4, 1, 5]) {
    cullSpheres(planes, positions, radius, count, visibility);
    const expectedCount = compactVisible(visibility, count, expected);
    const actualCount = cullAndCompactSpheres(planes, positions, radius, count, actual);
    expect(actualCount).toBe(expectedCount);
    expect(actual.subarray(0, actualCount)).toEqual(expected.subarray(0, expectedCount));
  }
});
