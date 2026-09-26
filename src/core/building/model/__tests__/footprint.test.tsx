import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { NavigationSystem } from '../../../navigation';
import { createBlockColliders, getBlockTransform } from '../../components/BlockSystem/layout';
import { BuildingBatches } from '../../components/BuildingBatches';
import type { BuildingColliderBox } from '../../components/BuildingColliders/types';
import { createTileColliders } from '../../components/TileSystem/layout';
import { createWallColliders } from '../../components/WallSystem/colliders';
import { applyBuildingNavigationObstacles } from '../../navigation';
import type { BuildingBlockConfig, TileConfig, TileGroupConfig, WallConfig, WallGroupConfig } from '../../types';
import { TILE_CONSTANTS } from '../../types/constants';
import { buildBlockRecord, buildTileGroupRecord, buildWallGroupRecord, type VisibilityRecord } from '../../visibility/core';
import { boxBoundsXZ, type BoundsXZ } from '../footprint';
import { buildingCellToWorld, createBlockFootprint, tilePositionToCell } from '../placement';

const NAV = { cellSize: 1, worldMinX: -24, worldMinZ: -24, worldMaxX: 24, worldMaxZ: 24 };
const CELL = TILE_CONSTANTS.GRID_CELL_SIZE;
const meshes = new Map([['brick', { id: 'brick', color: '#c9b79c' }], ['floor', { id: 'floor', color: '#8ea36b' }]]);

function expectSameBounds(actual: BoundsXZ, expected: BoundsXZ): void {
  for (const key of ['minX', 'maxX', 'minZ', 'maxZ'] as const) expect(actual[key]).toBeCloseTo(expected[key], 6);
}

const colliderBounds = ({ position, rotation, args }: BuildingColliderBox): BoundsXZ =>
  boxBoundsXZ({ center: position, half: args, rotationY: rotation[1] });

/** Navigation cells a piece standing over `bounds` must mark. */
function cellsUnder({ minX, maxX, minZ, maxZ }: BoundsXZ): string[] {
  const cells: string[] = [];
  for (let x = NAV.worldMinX; x < NAV.worldMaxX; x++) {
    for (let z = NAV.worldMinZ; z < NAV.worldMaxZ; z++) {
      if (x < maxX - 1e-9 && x + 1 > minX + 1e-9 && z < maxZ - 1e-9 && z + 1 > minZ + 1e-9) cells.push(`${x},${z}`);
    }
  }
  return cells;
}

function navCells(apply: (navigation: NavigationSystem) => void, marked: (navigation: NavigationSystem, x: number, z: number) => boolean): string[] {
  const navigation = new NavigationSystem(NAV);
  apply(navigation);
  const cells: string[] = [];
  for (let x = NAV.worldMinX; x < NAV.worldMaxX; x++) {
    for (let z = NAV.worldMinZ; z < NAV.worldMaxZ; z++) if (marked(navigation, x + 0.5, z + 0.5)) cells.push(`${x},${z}`);
  }
  navigation.dispose();
  return cells;
}

function expectRecordCovers(record: VisibilityRecord, { minX, maxX, minZ, maxZ }: BoundsXZ): void {
  for (const [x, z] of [[minX, minZ], [minX, maxZ], [maxX, minZ], [maxX, maxZ]] as const) {
    expect(Math.hypot(x - record.centerX, z - record.centerZ)).toBeLessThanOrEqual(record.radius + 1e-6);
  }
}

/** World XZ bounds of every instance the batch renderer draws. */
async function renderedBounds(props: { tileGroups?: TileGroupConfig[]; wallGroups?: WallGroupConfig[] }): Promise<BoundsXZ[]> {
  const wallGroups = props.wallGroups ?? [];
  const view = await ReactThreeTestRenderer.create(
    <BuildingBatches tileGroups={props.tileGroups ?? []} wallGroups={wallGroups} wallGroupMap={new Map(wallGroups.map((group) => [group.id, group]))} meshes={meshes} />,
  );
  try {
    const bounds: BoundsXZ[] = [];
    (view.scene.instance as THREE.Object3D).traverse((object) => {
      if (!(object instanceof THREE.InstancedMesh)) return;
      object.geometry.computeBoundingBox();
      for (let i = 0; i < object.count; i++) {
        const box = object.geometry.boundingBox!.clone().applyMatrix4(object.getMatrixAt(i, new THREE.Matrix4()));
        bounds.push({ minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z });
      }
    });
    return bounds;
  } finally {
    await view.unmount();
  }
}

describe.each([0, Math.PI / 2, Math.PI, Math.PI * 1.5])('a wall turned %s', (turn) => {
  const wall: WallConfig = { id: 'wall', wallGroupId: 'walls', position: { x: 4, y: 0, z: -4 }, rotation: { x: 0, y: turn, z: 0 } };
  const group: WallGroupConfig = { id: 'walls', name: 'walls', frontMeshId: 'brick', backMeshId: 'brick', sideMeshId: 'brick', walls: [wall] };

  test('renders, collides, blocks navigation and stays visible over one box', async () => {
    const [rendered, ...rest] = await renderedBounds({ wallGroups: [group] });
    expect(rest).toHaveLength(0);
    expectSameBounds(colliderBounds(createWallColliders([wall])[0]!), rendered!);
    expect(navCells((navigation) => applyBuildingNavigationObstacles(navigation, { wallGroups: [group] }), (navigation, x, z) => !navigation.isWalkable(x, z)))
      .toEqual(cellsUnder(rendered!));
    expectRecordCovers(buildWallGroupRecord(group)!, rendered!);
  });
});

describe.each([1, 2, 3, 4])('a block %i cells wide', (size) => {
  const block: BuildingBlockConfig = { id: 'block', position: { x: 4, y: 0, z: -8 }, size: { x: size, y: 2, z: 5 - size } };

  test('renders, collides, occupies, blocks navigation and stays visible over one box', () => {
    const { position, scale } = getBlockTransform(block);
    const rendered = { minX: position[0] - scale[0] / 2, maxX: position[0] + scale[0] / 2, minZ: position[2] - scale[2] / 2, maxZ: position[2] + scale[2] / 2 };
    expectSameBounds(colliderBounds(createBlockColliders([block])[0]!), rendered);
    const cells = createBlockFootprint(tilePositionToCell(block.position), block.size).map(buildingCellToWorld);
    expectSameBounds({
      minX: Math.min(...cells.map((cell) => cell.x)) - CELL / 2, maxX: Math.max(...cells.map((cell) => cell.x)) + CELL / 2,
      minZ: Math.min(...cells.map((cell) => cell.z)) - CELL / 2, maxZ: Math.max(...cells.map((cell) => cell.z)) + CELL / 2,
    }, rendered);
    expect(navCells((navigation) => applyBuildingNavigationObstacles(navigation, { blocks: [block] }), (navigation, x, z) => !navigation.isWalkable(x, z)))
      .toEqual(cellsUnder(rendered));
    expectRecordCovers(buildBlockRecord(block), rendered);
  });
});

describe.each([1, 2, 3, 4])('a tile %i cells wide', (size) => {
  const tile: TileConfig = { id: 'tile', tileGroupId: 'floors', position: { x: 8, y: 1, z: 4 }, size, rotation: Math.PI / 2 };
  const group: TileGroupConfig = { id: 'floors', name: 'floors', floorMeshId: 'floor', tiles: [tile] };

  test('renders, collides, raises navigation and stays visible over one box', async () => {
    const [rendered, ...rest] = await renderedBounds({ tileGroups: [group] });
    expect(rest).toHaveLength(0);
    expectSameBounds(colliderBounds(createTileColliders([tile])[0]!), rendered!);
    expect(navCells((navigation) => applyBuildingNavigationObstacles(navigation, { tileGroups: [group] }), (navigation, x, z) => navigation.sampleHeight(x, z) === 1))
      .toEqual(cellsUnder(rendered!));
    expectRecordCovers(buildTileGroupRecord(group)!, rendered!);
  });
});
