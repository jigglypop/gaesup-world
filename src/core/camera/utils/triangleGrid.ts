import type { Box3, BufferAttribute, BufferGeometry, InterleavedBufferAttribute } from 'three';

type Positions = BufferAttribute | InterleavedBufferAttribute;

/** Triangles a static geometry needs before a sweep looks them up by cell instead of walking every one. */
export const TRIANGLE_GRID_MIN = 512;
/** Triangles a cell holds on average, and the most cells along an axis. */
const PER_CELL = 8;
const MAX_CELLS = 128;

/**
 * The triangles of one geometry bucketed by a grid over its local XZ bounds, so a sweep tests only the triangles under
 * its path: a merged cell of props or a ground cover holds tens of thousands, of which a camera path crosses a few.
 */
export type TriangleGrid = {
  minX: number;
  minZ: number;
  cell: number;
  cols: number;
  rows: number;
  /** Cell `c` holds `items[starts[c]]` up to `items[starts[c + 1]]`. */
  starts: Uint32Array;
  /** Index offsets of each triangle's first corner. */
  items: Uint32Array;
  /** The query that last saw each triangle, so one lying in several cells is tested once. */
  seen: Uint32Array;
  stamp: number;
  positionVersion: number;
  indexVersion: number;
};

const grids = new WeakMap<BufferGeometry, TriangleGrid>();

const versionOf = (attribute: Positions | BufferAttribute | null): number =>
  !attribute ? -1 : 'isInterleavedBufferAttribute' in attribute && attribute.isInterleavedBufferAttribute
    ? (attribute as InterleavedBufferAttribute).data.version
    : (attribute as BufferAttribute).version;

function build(positions: Positions, index: BufferAttribute | null): TriangleGrid {
  const triangles = Math.floor((index ? index.count : positions.count) / 3);
  const corner = (i: number) => (index ? index.getX(i) : i);
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < triangles * 3; i++) {
    const vertex = corner(i);
    const x = positions.getX(vertex), z = positions.getZ(vertex);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const perAxis = Math.max(1, Math.min(MAX_CELLS, Math.ceil(Math.sqrt(triangles / PER_CELL))));
  const cell = Math.max(maxX - minX, maxZ - minZ, 1e-6) / perAxis;
  const cols = Math.max(1, Math.ceil((maxX - minX) / cell));
  const rows = Math.max(1, Math.ceil((maxZ - minZ) / cell));
  const column = (x: number) => Math.min(cols - 1, Math.max(0, Math.floor((x - minX) / cell)));
  const row = (z: number) => Math.min(rows - 1, Math.max(0, Math.floor((z - minZ) / cell)));
  // Each triangle's cell range, counted first and filled second.
  const spans = new Int32Array(triangles * 4);
  const starts = new Uint32Array(cols * rows + 1);
  for (let t = 0; t < triangles; t++) {
    const a = corner(t * 3), b = corner(t * 3 + 1), c = corner(t * 3 + 2);
    const x0 = column(Math.min(positions.getX(a), positions.getX(b), positions.getX(c)));
    const x1 = column(Math.max(positions.getX(a), positions.getX(b), positions.getX(c)));
    const z0 = row(Math.min(positions.getZ(a), positions.getZ(b), positions.getZ(c)));
    const z1 = row(Math.max(positions.getZ(a), positions.getZ(b), positions.getZ(c)));
    spans[t * 4] = x0;
    spans[t * 4 + 1] = x1;
    spans[t * 4 + 2] = z0;
    spans[t * 4 + 3] = z1;
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) starts[z * cols + x + 1]!++;
  }
  for (let c = 0; c < cols * rows; c++) starts[c + 1]! += starts[c]!;
  const items = new Uint32Array(starts[cols * rows]!);
  const fill = starts.slice(0, cols * rows);
  for (let t = 0; t < triangles; t++) {
    const s = t * 4;
    for (let z = spans[s + 2]!; z <= spans[s + 3]!; z++) {
      for (let x = spans[s]!; x <= spans[s + 1]!; x++) items[fill[z * cols + x]!++] = t * 3;
    }
  }
  return {
    minX, minZ, cell, cols, rows, starts, items, seen: new Uint32Array(triangles), stamp: 0,
    positionVersion: versionOf(positions), indexVersion: versionOf(index),
  };
}

/** The geometry's grid, built on first use and again when its positions or index change. */
export function triangleGrid(geometry: BufferGeometry, positions: Positions, index: BufferAttribute | null): TriangleGrid {
  const known = grids.get(geometry);
  if (known && known.positionVersion === versionOf(positions) && known.indexVersion === versionOf(index)) return known;
  const grid = build(positions, index);
  grids.set(geometry, grid);
  return grid;
}

/** Calls `visit` with the first-corner offset of each triangle in `[start, end)` whose cells meet `box` (local XZ). */
export function visitGridTriangles(grid: TriangleGrid, box: Box3, start: number, end: number, visit: (offset: number) => void): void {
  const { minX, minZ, cell, cols, rows, starts, items, seen } = grid;
  if (box.max.x < minX || box.max.z < minZ || box.min.x > minX + cols * cell || box.min.z > minZ + rows * cell) return;
  const x0 = Math.max(0, Math.floor((box.min.x - minX) / cell)), x1 = Math.min(cols - 1, Math.floor((box.max.x - minX) / cell));
  const z0 = Math.max(0, Math.floor((box.min.z - minZ) / cell)), z1 = Math.min(rows - 1, Math.floor((box.max.z - minZ) / cell));
  grid.stamp = (grid.stamp + 1) >>> 0;
  if (grid.stamp === 0) {
    seen.fill(0);
    grid.stamp = 1;
  }
  const stamp = grid.stamp;
  for (let z = z0; z <= z1; z++) {
    for (let x = x0; x <= x1; x++) {
      const c = z * cols + x;
      for (let k = starts[c]!; k < starts[c + 1]!; k++) {
        const offset = items[k]!;
        if (offset < start || offset + 2 >= end || seen[offset / 3] === stamp) continue;
        seen[offset / 3] = stamp;
        visit(offset);
      }
    }
  }
}
