import { FreePlacementAdapter, SquareGridAdapter } from '../index';
import type { CellCoord, EdgeCoord } from '../index';

describe('SquareGridAdapter', () => {
  it('converts cell coordinates to world positions with center origin', () => {
    const grid = new SquareGridAdapter();

    expect(grid.toWorld({ x: 2, z: -1, level: 3 })).toEqual({
      x: 8,
      y: 3,
      z: -4,
    });
  });

  it('converts world positions back to nearest cell coordinates', () => {
    const grid = new SquareGridAdapter();

    expect(grid.fromWorld({ x: 7.8, y: 2.6, z: -4.2 })).toEqual({
      x: 2,
      z: -1,
      level: 3,
    });
  });

  it('supports corner origin grids', () => {
    const grid = new SquareGridAdapter({
      spec: {
        cellSize: 2,
        heightStep: 0.5,
        origin: 'corner',
      },
    });

    expect(grid.toWorld({ x: 1, z: 2, level: 4 })).toEqual({
      x: 3,
      y: 2,
      z: 5,
    });
    expect(grid.fromWorld({ x: 3, y: 2, z: 5 })).toEqual({
      x: 1,
      z: 2,
      level: 4,
    });
  });

  it('returns cardinal neighbors on the same level', () => {
    const grid = new SquareGridAdapter();

    expect(grid.getNeighbors({ x: 0, z: 0, level: 1 })).toEqual([
      { x: 0, z: -1, level: 1 },
      { x: 1, z: 0, level: 1 },
      { x: 0, z: 1, level: 1 },
      { x: -1, z: 0, level: 1 },
    ]);
  });

  it('compares and keys cells deterministically', () => {
    const grid = new SquareGridAdapter();
    const a: CellCoord = { x: -1, z: 2, level: 0 };
    const b: CellCoord = { x: -1, z: 2, level: 0 };
    const c: CellCoord = { x: -1, z: 2, level: 1 };

    expect(grid.equals(a, b)).toBe(true);
    expect(grid.equals(a, c)).toBe(false);
    expect(grid.key(a)).toBe('-1:2:0');
  });

  it('converts edge coordinates to world edge centers', () => {
    const grid = new SquareGridAdapter();
    const base: Omit<EdgeCoord, 'side'> = { x: 0, z: 0, level: 0 };

    expect(grid.edgeToWorld({ ...base, side: 'north' })).toEqual({ x: 0, y: 0, z: -2 });
    expect(grid.edgeToWorld({ ...base, side: 'east' })).toEqual({ x: 2, y: 0, z: 0 });
    expect(grid.edgeToWorld({ ...base, side: 'south' })).toEqual({ x: 0, y: 0, z: 2 });
    expect(grid.edgeToWorld({ ...base, side: 'west' })).toEqual({ x: -2, y: 0, z: 0 });
    expect(grid.edgeKey({ ...base, side: 'west' })).toBe('0:0:0:west');
  });

  it('converts corner coordinates to world corner positions', () => {
    const grid = new SquareGridAdapter();

    expect(grid.cornerToWorld({ x: 1, z: 1, level: 2 })).toEqual({
      x: 2,
      y: 2,
      z: 2,
    });
    expect(grid.cornerKey({ x: 1, z: 1, level: 2 })).toBe('1:1:2');
  });
});

describe('FreePlacementAdapter', () => {
  it('passes world positions through without snapping', () => {
    const free = new FreePlacementAdapter();
    const position = { x: 1.25, y: 0.5, z: -3.75 };

    expect(free.toWorld({ position })).toEqual(position);
    expect(free.fromWorld(position)).toEqual({ position });
  });

  it('keys positions using configurable precision', () => {
    const free = new FreePlacementAdapter({ precision: 10 });
    const a = { position: { x: 1.24, y: 0, z: 2.25 } };
    const b = { position: { x: 1.23, y: 0, z: 2.26 } };

    expect(free.key(a)).toBe('1.2:0:2.3');
    expect(free.equals(a, b)).toBe(true);
    expect(free.getNeighbors(a)).toEqual([a]);
  });
});
