import * as THREE from 'three';

import { writeRibbon } from '../PathLine';

test('the route ribbon puts two edge vertices per point, level with the path and to either side of it', () => {
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 4), new THREE.Vector3(4, 0, 4)];
  const positions = new Float32Array(points.length * 6);
  writeRibbon(points, points.length, positions);
  // Heading +Z at the start: the edges sit left and right on X.
  expect(positions[0]).toBeCloseTo(-0.08);
  expect(positions[3]).toBeCloseTo(0.08);
  expect(positions[1]).toBeCloseTo(0.06);
  expect(positions[2]).toBeCloseTo(0);
  // Heading +X at the end: the edges sit either side on Z.
  expect(positions[14]).toBeCloseTo(4.08);
  expect(positions[17]).toBeCloseTo(3.92);
});
