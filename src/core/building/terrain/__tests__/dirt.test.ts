import type * as THREE from 'three';

import { buildDirtCover, DIRT_COVER, type GroundSquare } from '../dirt';
import { ALL_NEIGHBORS, borderDistance } from '../grid';

const square = (x: number, z: number, y = 0): GroundSquare => ({ x, y, z, size: 4 });

/** A path of three tiles along z = 0 through a 5 × 3 lawn, a raised tile north of it and a lone tile far away. */
function field() {
  const dirt = [square(-4, 0), square(0, 0), square(4, 0)];
  const ground: GroundSquare[] = [square(16, 0), square(0, -4, 1)];
  for (const x of [-8, -4, 0, 4, 8]) for (const z of [-4, 4, 0]) {
    if (z === 0 && Math.abs(x) <= 4) continue;
    if (x === 0 && z === -4) continue;
    ground.push(square(x, z));
  }
  return { dirt, ground, color: '#dcbb86', accent: '#b98f5c' };
}

function alphaAt(geometry: THREE.BufferGeometry, x: number, z: number): number {
  const position = geometry.getAttribute('position');
  const color = geometry.getAttribute('color');
  for (let index = 0; index < position.count; index++) {
    if (Math.abs(position.getX(index) - x) < 1e-6 && Math.abs(position.getZ(index) - z) < 1e-6) return color.getW(index);
  }
  return Number.NaN;
}

test('the path is solid inside, seamless between its tiles and gone a little past its edge', () => {
  const geometry = buildDirtCover(field())!;
  expect(alphaAt(geometry, 0, 0)).toBe(1);
  // Where two path tiles meet the cover stays solid.
  expect(alphaAt(geometry, -2, 0)).toBe(1);
  expect(alphaAt(geometry, 2, 1.5)).toBeGreaterThan(0.9);
  // The edge wanders about the tiles' border and fades out on the lawn.
  const edge = [-6, -3, 0, 3, 6].map((x) => alphaAt(geometry, x, 2));
  expect(Math.min(...edge)).toBeGreaterThan(0.2);
  expect(new Set(edge.map((alpha) => alpha.toFixed(3))).size).toBeGreaterThan(1);
  expect(alphaAt(geometry, 0, 4)).toBe(0);
});

test('the edge spreads only onto flat neighbors at the same height', () => {
  const geometry = buildDirtCover(field())!;
  const position = geometry.getAttribute('position');
  let raised = 0, far = 0;
  for (let index = 0; index < position.count; index++) {
    if (position.getY(index) > 0.5) raised++;
    if (position.getX(index) > 10.1) far++;
  }
  expect(raised).toBe(0);
  expect(far).toBe(0);
  expect(position.getY(0)).toBeCloseTo(DIRT_COVER.lift);
});

test('a cover is the same on every build and rounds the corners of the path', () => {
  const a = buildDirtCover(field())!, b = buildDirtCover(field())!;
  expect(Array.from(a.getAttribute('color').array)).toEqual(Array.from(b.getAttribute('color').array));
  expect(buildDirtCover({ ...field(), dirt: [] })).toBeNull();
  // Diagonally off a corner the distance is to the corner itself, which rounds the border.
  expect(borderDistance(~(1 << 7) & ALL_NEIGHBORS, 1.5, 1.5, 4)).toBeCloseTo(Math.SQRT1_2);
  expect(borderDistance(ALL_NEIGHBORS, 0, 0, 4)).toBe(Infinity);
});
