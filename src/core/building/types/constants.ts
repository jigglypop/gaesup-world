export const TILE_CONSTANTS = Object.freeze({
  GRID_CELL_SIZE: 4,     // 그리드 한 칸 크기
  SNAP_GRID_SIZE: 4,     // 스냅도 그리드에 맞춤
  
  TILE_MULTIPLIERS: Object.freeze({
    SMALL: 1,    // 1x1 (4x4m)
    MEDIUM: 2,   // 2x2 (8x8m)
    LARGE: 3,    // 3x3 (12x12m)
    HUGE: 4      // 4x4 (16x16m)
  }),
  
  WALL_SIZES: Object.freeze({
    WIDTH: 4,      // 벽 길이
    HEIGHT: 4,     // 벽 높이  
    THICKNESS: 0.5, // 벽 두께
    MIN_LENGTH: 0.5,
    MAX_LENGTH: 10
  }),
  
  GRID_DIVISIONS: 25,  // 100m / 4m = 25 divisions
  DEFAULT_GRID_SIZE: 100
} as const);

export const MATERIAL_PRESETS = Object.freeze({
  FLOOR: Object.freeze({
    wood: Object.freeze({ roughness: 0.6, metalness: 0 }),
    marble: Object.freeze({ roughness: 0.2, metalness: 0.1 }),
    concrete: Object.freeze({ roughness: 0.8, metalness: 0 }),
    tile: Object.freeze({ roughness: 0.3, metalness: 0.05 }),
  }),
  WALL: Object.freeze({
    brick: Object.freeze({ roughness: 0.8, metalness: 0 }),
    plaster: Object.freeze({ roughness: 0.7, metalness: 0 }),
    glass: Object.freeze({ roughness: 0.1, metalness: 0.1, opacity: 0.3 }),
    metal: Object.freeze({ roughness: 0.3, metalness: 0.8 }),
  }),
} as const);