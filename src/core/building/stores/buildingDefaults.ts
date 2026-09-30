import type { Draft } from 'immer';

import type { BuildingStore } from './buildingStoreTypes';
import { installTilePreset, installWallPreset } from './catalogInstall';
import { createDefaultTileCategories, createDefaultWallCategories } from './defaultCategories';
import { placeTileOnGrid } from '../model/placement';
import {
  BUILDING_TILE_PRESETS,
  BUILDING_WALL_PRESETS,
  type FlagStyle,
  type TileConfig,
  type TileGroupConfig,
} from '../types';
import { TILE_CONSTANTS } from '../types/constants';

/** Seeds the default catalog (meshes, categories, presets) and the demo plaza once per store. */
export function seedBuildingDefaults(state: Draft<BuildingStore>): void {
  if (state.initialized) return;

  // 기본 재질 초기화
  state.meshes.set('brick-wall', {
    id: 'brick-wall',
    color: '#8B4513',
    material: 'STANDARD',
    roughness: 0.8,
  });

  state.meshes.set('glass-wall', {
    id: 'glass-wall',
    material: 'GLASS',
    opacity: 0.3,
    transparent: true,
  });

  state.meshes.set('concrete-wall', {
    id: 'concrete-wall',
    color: '#808080',
    material: 'STANDARD',
    roughness: 0.9,
  });

  state.meshes.set('wood-floor', {
    id: 'wood-floor',
    color: '#654321',
    material: 'STANDARD',
    roughness: 0.6,
  });

  state.meshes.set('marble-floor', {
    id: 'marble-floor',
    color: '#f0f0f0',
    material: 'STANDARD',
    roughness: 0.2,
    metalness: 0.1,
  });

  state.meshes.set('sand-floor', {
    id: 'sand-floor',
    color: '#c9ab75',
    material: 'STANDARD',
    roughness: 0.96,
    metalness: 0.02,
  });

  state.meshes.set('snow-floor', {
    id: 'snow-floor',
    color: '#eef5ff',
    material: 'STANDARD',
    roughness: 0.9,
    metalness: 0.0,
  });

  for (const [id, category] of createDefaultWallCategories()) state.wallCategories.set(id, category);
  for (const [id, category] of createDefaultTileCategories()) state.tileCategories.set(id, category);

  // 기본 그룹 생성
  state.wallGroups.set('brick-walls', {
    id: 'brick-walls',
    name: '벽돌 벽',
    frontMeshId: 'brick-wall',
    backMeshId: 'brick-wall',
    sideMeshId: 'brick-wall',
    walls: [],
  });

  state.wallGroups.set('glass-walls', {
    id: 'glass-walls',
    name: '유리 벽',
    frontMeshId: 'glass-wall',
    backMeshId: 'glass-wall',
    sideMeshId: 'glass-wall',
    walls: [],
  });

  state.wallGroups.set('concrete-walls', {
    id: 'concrete-walls',
    name: '콘크리트 벽',
    frontMeshId: 'concrete-wall',
    backMeshId: 'concrete-wall',
    sideMeshId: 'concrete-wall',
    walls: [],
  });

  state.wallGroups.set('plaster-walls', {
    id: 'plaster-walls',
    name: '회벽',
    frontMeshId: 'brick-wall', // 임시로 brick 재질 사용
    backMeshId: 'brick-wall',
    sideMeshId: 'brick-wall',
    walls: [],
  });

  state.wallGroups.set('painted-walls', {
    id: 'painted-walls',
    name: '페인트 벽',
    frontMeshId: 'brick-wall', // 임시로 brick 재질 사용
    backMeshId: 'brick-wall',
    sideMeshId: 'brick-wall',
    walls: [],
  });

  for (const preset of BUILDING_WALL_PRESETS) installWallPreset(state, preset);

  state.tileGroups.set('oak-floor', {
    id: 'oak-floor',
    name: '참나무 바닥',
    floorMeshId: 'wood-floor',
    tiles: [],
  });

  state.tileGroups.set('pine-floor', {
    id: 'pine-floor',
    name: '소나무 바닥',
    floorMeshId: 'wood-floor',
    tiles: [],
  });

  state.tileGroups.set('marble-floor', {
    id: 'marble-floor',
    name: '대리석 바닥',
    floorMeshId: 'marble-floor',
    tiles: [],
  });

  state.tileGroups.set('granite-floor', {
    id: 'granite-floor',
    name: '화강암 바닥',
    floorMeshId: 'marble-floor', // 임시로 marble 재질 사용
    tiles: [],
  });

  state.tileGroups.set('sand-floor', {
    id: 'sand-floor',
    name: '모래 바닥',
    floorMeshId: 'sand-floor',
    tiles: [],
  });

  state.tileGroups.set('snow-floor', {
    id: 'snow-floor',
    name: '눈 바닥',
    floorMeshId: 'snow-floor',
    tiles: [],
  });

  for (const preset of BUILDING_TILE_PRESETS) installTilePreset(state, preset, true);

  // 기본 선택 설정
  state.selectedWallCategoryId = 'exterior-walls';
  state.selectedWallGroupId = 'brick-walls';
  state.selectedTileCategoryId = 'wood-floors';
  state.selectedTileGroupId = 'oak-floor';

  // 데모 레이아웃: 7x7 센터 플라자 + 오브젝트 쇼케이스
  //
  //  gx: -3  -2  -1   0   1   2   3
  //  -----------------------------------
  // -3  oak  oak  oak FLAG oak SNOW SNOW
  // -2  oak  oak  oak  oak oak GRSS GRSS
  // -1  WTR  oak  MRB  MRB MRB oak  oak
  //  0  WTR  oak  MRB  MRB MRB oak  SKRA
  //  1  oak  oak  MRB  MRB MRB oak  oak
  //  2  sand sand oak  oak oak  oak FIRE
  //  3  sand sand oak  oak oak  oak  oak

  const oakFloorGroup = state.tileGroups.get('oak-floor');
  const marbleFloorGroup = state.tileGroups.get('marble-floor');
  const sandFloorGroup = state.tileGroups.get('sand-floor');
  const snowFloorGroup = state.tileGroups.get('snow-floor');
  const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;

  const addTileToState = (group: TileGroupConfig, tile: TileConfig): void => {
    const placed = placeTileOnGrid(tile);
    group.tiles.push(placed);
    state.spatialIndex.indexTile(placed);
  };

  if (oakFloorGroup && marbleFloorGroup) {
    for (let gx = -3; gx <= 3; gx++) {
      for (let gz = -3; gz <= 3; gz++) {
        const px = gx * cellSize;
        const pz = gz * cellSize;

        const isMarble = Math.abs(gx) <= 1 && Math.abs(gz) <= 1;
        const isGrass = gx >= 2 && gz === -2;
        const isSnowfield = gx >= 2 && gz === -3;
        const isSand = gx <= -2 && gz >= 2;
        const isFire = gx === 3 && gz === 2;
        const isRoundSample = gx === -3 && gz === 2;
        const isRampSample = gx === -2 && gz === 2;
        const isStairSample = gx === 2 && gz === -3;

        const group =
          (isSand ? sandFloorGroup : undefined) ??
          (isSnowfield ? snowFloorGroup : undefined) ??
          (isMarble ? marbleFloorGroup : undefined) ??
          oakFloorGroup;

        const tileHeight = isSnowfield
          ? 2
          : isGrass
            ? 1
            : isSand
              ? 1
              : isFire
                ? 1
                : isMarble
                  ? gx === 0 && gz === 0
                    ? 2
                    : 1
                  : 0;

        const base: TileConfig = {
          id: `demo-${gx + 3}-${gz + 3}`,
          position: { x: px, y: tileHeight * TILE_CONSTANTS.HEIGHT_STEP, z: pz },
          tileGroupId: group.id,
          size: 1,
          shape: isRoundSample
            ? 'round'
            : isRampSample
              ? 'ramp'
              : isStairSample
                ? 'stairs'
                : 'box',
        };

        if (isGrass) {
          addTileToState(group, {
            ...base,
            objectType: 'grass',
            objectConfig: { grassDensity: 90 },
          });
        } else if (isSnowfield) {
          addTileToState(group, { ...base, objectType: 'snowfield' });
        } else if (isSand) {
          addTileToState(group, { ...base, objectType: 'sand' });
        } else {
          addTileToState(group, base);
        }
      }
    }

    // Placed objects (independent from tiles, stackable)
    state.objects.push(
      {
        id: 'demo-sakura-1',
        type: 'sakura',
        position: { x: 3 * cellSize, y: 0, z: 0 },
        config: { size: cellSize },
      },
      {
        id: 'demo-flag-1',
        type: 'flag',
        position: { x: 0, y: 0, z: -3 * cellSize },
        config: { flagWidth: 1.5, flagHeight: 1.0, flagStyle: 'flag' as FlagStyle },
      },
      {
        id: 'demo-fire-1',
        type: 'fire',
        position: { x: 3 * cellSize, y: TILE_CONSTANTS.HEIGHT_STEP, z: 2 * cellSize },
        config: { fireIntensity: 1.5 },
      },
    );
  }

  state.initialized = true;
}
