export const TILE_CONSTANTS = {
  GRID_CELL_SIZE: 4,     // 그리드 한 칸 크기
  SNAP_GRID_SIZE: 4,     // 스냅도 그리드에 맞춤
  
  TILE_MULTIPLIERS: {
    SMALL: 1,    // 1x1 (4x4m)
    MEDIUM: 2,   // 2x2 (8x8m)
    LARGE: 3,    // 3x3 (12x12m)
    HUGE: 4      // 4x4 (16x16m)
  },
  
  WALL_SIZES: {
    HEIGHT: 3,
    THICKNESS: 0.2,
    MIN_LENGTH: 0.5,
    MAX_LENGTH: 10
  },
  
  GRID_DIVISIONS: 25,  // 100m / 4m = 25 divisions
  DEFAULT_GRID_SIZE: 100
};

export const MATERIAL_PRESETS = {
  FLOOR: {
    wood: { roughness: 0.6, metalness: 0 },
    marble: { roughness: 0.2, metalness: 0.1 },
    concrete: { roughness: 0.8, metalness: 0 },
    tile: { roughness: 0.3, metalness: 0.05 }
  },
  WALL: {
    brick: { roughness: 0.8, metalness: 0 },
    plaster: { roughness: 0.7, metalness: 0 },
    glass: { roughness: 0.1, metalness: 0.1, opacity: 0.3 },
    metal: { roughness: 0.3, metalness: 0.8 }
  }
}; 