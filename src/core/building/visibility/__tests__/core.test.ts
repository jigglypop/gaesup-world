import {
  buildTileGroupRecord,
  buildBlockRecord,
  buildWallGroupRecord,
  buildVisibilityIndex,
  collectCandidateIds,
  collectOccluderCandidates,
  createVisibilityQueryKey,
  isOccludedByAny,
} from '../core';
import type { BuildingBlockConfig, PlacedObject, TileGroupConfig, WallGroupConfig } from '../../types';
import * as THREE from 'three';

describe('building visibility core', () => {
  it('builds tile group bounds from tile extents', () => {
    const group: TileGroupConfig = {
      id: 'oak-floor',
      name: 'Oak',
      floorMeshId: 'wood-floor',
      tiles: [
        { id: 'a', tileGroupId: 'oak-floor', position: { x: 0, y: 0, z: 0 }, size: 1 },
        { id: 'b', tileGroupId: 'oak-floor', position: { x: 6, y: 2, z: 0 }, size: 2 },
      ],
    };

    const record = buildTileGroupRecord(group);

    expect(record).not.toBeNull();
    expect(record?.centerX).toBeCloseTo(3.25);
    expect(record?.centerY).toBeGreaterThan(1);
    expect(record?.radius).toBeGreaterThan(3);
  });

  it('builds wall group bounds from wall positions', () => {
    const group: WallGroupConfig = {
      id: 'brick-walls',
      name: 'Brick',
      walls: [
        {
          id: 'w1',
          wallGroupId: 'brick-walls',
          position: { x: -3, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
        },
        {
          id: 'w2',
          wallGroupId: 'brick-walls',
          position: { x: 3, y: 0, z: 4 },
          rotation: { x: 0, y: 0, z: 0 },
        },
      ],
    };

    const record = buildWallGroupRecord(group);

    expect(record).not.toBeNull();
    expect(record?.centerZ).toBeGreaterThan(1);
    expect(record?.radius).toBeGreaterThan(4);
  });

  it('builds block bounds from voxel dimensions', () => {
    const block: BuildingBlockConfig = {
      id: 'stone',
      position: { x: 4, y: 1, z: 8 },
      size: { x: 2, y: 3, z: 1 },
      materialId: 'stone',
    };

    const record = buildBlockRecord(block);

    expect(record.id).toBe('stone');
    expect(record.centerX).toBeCloseTo(6);
    expect(record.centerY).toBeCloseTo(2.5);
    expect(record.centerZ).toBeCloseTo(8);
    expect(record.radius).toBeGreaterThan(4);
  });

  it('collects only nearby bucket candidates', () => {
    const wallGroups: WallGroupConfig[] = [];
    const tileGroups: TileGroupConfig[] = [
      {
        id: 'near',
        name: 'Near',
        floorMeshId: 'wood-floor',
        tiles: [{ id: 't1', tileGroupId: 'near', position: { x: 0, y: 0, z: 0 }, size: 1 }],
      },
      {
        id: 'far',
        name: 'Far',
        floorMeshId: 'wood-floor',
        tiles: [{ id: 't2', tileGroupId: 'far', position: { x: 400, y: 0, z: 400 }, size: 1 }],
      },
    ];
    const objects: PlacedObject[] = [];

    const index = buildVisibilityIndex(wallGroups, tileGroups, objects, 20);
    const ids = collectCandidateIds(index.tileBuckets, 0, 0, 80, 20);

    expect(ids.has('near')).toBe(true);
    expect(ids.has('far')).toBe(false);
  });

  it('keeps large wall and tile groups in nearby buckets when the camera is near an edge', () => {
    const wallGroups: WallGroupConfig[] = [
      {
        id: 'long-wall',
        name: 'Long Wall',
        walls: [
          {
            id: 'w1',
            wallGroupId: 'long-wall',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
          },
          {
            id: 'w2',
            wallGroupId: 'long-wall',
            position: { x: 180, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
          },
        ],
      },
    ];
    const tileGroups: TileGroupConfig[] = [
      {
        id: 'long-floor',
        name: 'Long Floor',
        floorMeshId: 'wood-floor',
        tiles: [
          { id: 't1', tileGroupId: 'long-floor', position: { x: 0, y: 0, z: 20 }, size: 1 },
          { id: 't2', tileGroupId: 'long-floor', position: { x: 180, y: 0, z: 20 }, size: 1 },
        ],
      },
    ];
    const index = buildVisibilityIndex(wallGroups, tileGroups, [], 20);

    const wallIds = collectCandidateIds(index.wallBuckets, 0, 0, 40, 20);
    const tileIds = collectCandidateIds(index.tileBuckets, 0, 0, 40, 20);

    expect(wallIds.has('long-wall')).toBe(true);
    expect(tileIds.has('long-floor')).toBe(true);
  });

  it('indexes block visibility buckets and occluders', () => {
    const index = buildVisibilityIndex([], [], [], [
      { id: 'block-near', position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 3, z: 1 } },
      { id: 'block-far', position: { x: 400, y: 0, z: 400 } },
    ], 20);
    const ids = collectCandidateIds(index.blockBuckets, 0, 0, 80, 20);
    const occluders = collectOccluderCandidates(index, 0, 0, 80, 20);

    expect(ids.has('block-near')).toBe(true);
    expect(ids.has('block-far')).toBe(false);
    expect(index.blockById.has('block-near')).toBe(true);
    expect(occluders.some((entry) => entry.key === 'block:block-near')).toBe(true);
  });

  it('treats large wall groups as occluders for targets behind them', () => {
    const wallGroups: WallGroupConfig[] = [
      {
        id: 'wall-near',
        name: 'Near Wall',
        walls: Array.from({ length: 6 }, (_, i) => ({
          id: `w${i}`,
          wallGroupId: 'wall-near',
          position: { x: 0, y: 0, z: 12 + i * 0.2 },
          rotation: { x: 0, y: 0, z: 0 },
        })),
      },
    ];
    const tileGroups: TileGroupConfig[] = [
      {
        id: 'behind',
        name: 'Behind',
        floorMeshId: 'wood-floor',
        tiles: [{ id: 't3', tileGroupId: 'behind', position: { x: 0, y: 0, z: 30 }, size: 2 }],
      },
    ];
    const index = buildVisibilityIndex(wallGroups, tileGroups, []);
    const occluders = collectOccluderCandidates(index, 0, 0, 140);
    const target = index.tileById.get('behind');
    expect(target).toBeDefined();

    const hidden = isOccludedByAny(
      target!,
      'tile',
      new THREE.Vector3(0, 2, 0),
      occluders,
      {
        targetDir: new THREE.Vector3(),
        occDir: new THREE.Vector3(),
        cross: new THREE.Vector3(),
      },
    );

    expect(hidden).toBe(true);
  });

  it('does not hide targets that are off the occluder ray', () => {
    const wallGroups: WallGroupConfig[] = [
      {
        id: 'wall-near',
        name: 'Near Wall',
        walls: Array.from({ length: 6 }, (_, i) => ({
          id: `w${i}`,
          wallGroupId: 'wall-near',
          position: { x: 0, y: 0, z: 12 + i * 0.2 },
          rotation: { x: 0, y: 0, z: 0 },
        })),
      },
    ];
    const tileGroups: TileGroupConfig[] = [
      {
        id: 'side',
        name: 'Side',
        floorMeshId: 'wood-floor',
        tiles: [{ id: 't4', tileGroupId: 'side', position: { x: 18, y: 0, z: 30 }, size: 2 }],
      },
    ];
    const index = buildVisibilityIndex(wallGroups, tileGroups, []);
    const occluders = collectOccluderCandidates(index, 0, 0, 140);
    const target = index.tileById.get('side');
    expect(target).toBeDefined();

    const hidden = isOccludedByAny(
      target!,
      'tile',
      new THREE.Vector3(0, 2, 0),
      occluders,
      {
        targetDir: new THREE.Vector3(),
        occDir: new THREE.Vector3(),
        cross: new THREE.Vector3(),
      },
    );

    expect(hidden).toBe(false);
  });

  it('uses camera cell and facing bucket for visibility cache keys', () => {
    const a = createVisibilityQueryKey(5, 5, 1, 0);
    const b = createVisibilityQueryKey(10, 10, 1, 0);
    const c = createVisibilityQueryKey(5, 5, 0, 1);

    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
