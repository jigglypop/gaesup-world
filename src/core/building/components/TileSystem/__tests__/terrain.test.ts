import * as THREE from 'three';

import type { TileConfig } from '../../../types';
import { TILE_CONSTANTS } from '../../../types/constants';
import { buildTerrainGeometry, createTileSupport, type TileSupport } from '../terrain';

const cell = TILE_CONSTANTS.GRID_CELL_SIZE;
const tile = (id: string, x: number, y: number, z = 0): TileConfig => ({ id, tileGroupId: 'g', size: 1, position: { x, y, z } });

/** [x, bottom] of every side quad that faces east or west. */
function eastWestSides(geometry: THREE.BufferGeometry): [number, number][] {
  const position = geometry.getAttribute('position');
  const sides: [number, number][] = [];
  for (let i = 0; i < position.count; i += 6) {
    const xs = Array.from({ length: 6 }, (_, k) => position.getX(i + k));
    if (xs.some((x) => Math.abs(x - xs[0]!) > 1e-6)) continue;
    sides.push([xs[0]!, Math.min(...Array.from({ length: 6 }, (_, k) => position.getY(i + k)))]);
  }
  return sides.sort((a, b) => a[0] - b[0]);
}

test('a raised side drops to the neighbor tile under it and to the ground where there is none', () => {
  const tiles = [tile('high', 0, 1), tile('low', cell, 0.5)];
  const { sideGeometry } = buildTerrainGeometry(tiles, createTileSupport(tiles), new THREE.Color('#888888'));
  // The low tile has no west side: the high tile covers it.
  expect(eastWestSides(sideGeometry)).toEqual([[-cell / 2, 0], [cell / 2, 0.5], [cell * 1.5, 0]]);
  expect(sideGeometry.boundingBox).toEqual(new THREE.Box3().setFromBufferAttribute(sideGeometry.getAttribute('position') as THREE.BufferAttribute));
});

test('each side sample scans only the tiles around it, so a group builds in linear time', () => {
  const tiles = Array.from({ length: 900 }, (_, i) => tile(`t${i}`, (i % 30) * cell, 1 + (i % 3), Math.floor(i / 30) * cell));
  const support = createTileSupport(tiles);
  let queries = 0;
  let scanned = 0;
  const counting: TileSupport = (x, z) => {
    const near = support(x, z);
    queries++;
    scanned += near.length;
    return near;
  };
  buildTerrainGeometry(tiles, counting, new THREE.Color('#888888'));
  expect(queries).toBe(tiles.length * 4);
  expect(scanned).toBeLessThanOrEqual(queries * 4);
});
