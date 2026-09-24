import type { TileCategory, WallCategory } from '../types';

export const DEFAULT_WALL_CATEGORIES: readonly WallCategory[] = [
  { id: 'interior-walls', name: '실내 벽', description: '실내 공간에 사용하는 벽', wallGroupIds: ['plaster-walls', 'painted-walls'] },
  { id: 'exterior-walls', name: '외벽', description: '건물 외부에 사용하는 벽', wallGroupIds: ['brick-walls', 'concrete-walls'] },
  { id: 'special-walls', name: '특수 벽', description: '유리와 특수 재질의 벽', wallGroupIds: ['glass-walls'] },
];

export const DEFAULT_TILE_CATEGORIES: readonly TileCategory[] = [
  { id: 'wood-floors', name: '나무 바닥', description: '여러 종류의 나무 바닥', tileGroupIds: ['oak-floor', 'pine-floor'] },
  { id: 'stone-floors', name: '돌 바닥', description: '대리석과 석재 바닥', tileGroupIds: ['marble-floor', 'granite-floor'] },
  { id: 'natural-floors', name: '자연 바닥', description: '모래와 눈 지형 바닥', tileGroupIds: ['sand-floor', 'snow-floor'] },
];

export function createDefaultWallCategories(): Map<string, WallCategory> {
  return new Map(DEFAULT_WALL_CATEGORIES.map((category) => [category.id, { ...category, wallGroupIds: [...category.wallGroupIds] }]));
}

export function createDefaultTileCategories(): Map<string, TileCategory> {
  return new Map(DEFAULT_TILE_CATEGORIES.map((category) => [category.id, { ...category, tileGroupIds: [...category.tileGroupIds] }]));
}
