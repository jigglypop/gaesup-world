import { TILE_CONSTANTS, MATERIAL_PRESETS } from '../constants';

describe('TILE_CONSTANTS 테스트', () => {
  describe('기본 그리드 설정', () => {
    test('그리드 셀 크기가 올바르게 정의되어야 함', () => {
      expect(TILE_CONSTANTS.GRID_CELL_SIZE).toBe(4);
      expect(typeof TILE_CONSTANTS.GRID_CELL_SIZE).toBe('number');
    });

    test('스냅 그리드 크기가 올바르게 정의되어야 함', () => {
      expect(TILE_CONSTANTS.SNAP_GRID_SIZE).toBe(4);
      expect(typeof TILE_CONSTANTS.SNAP_GRID_SIZE).toBe('number');
    });

    test('그리드 분할 수가 올바르게 계산되어야 함', () => {
      expect(TILE_CONSTANTS.GRID_DIVISIONS).toBe(25);
      expect(TILE_CONSTANTS.DEFAULT_GRID_SIZE / TILE_CONSTANTS.GRID_CELL_SIZE).toBe(25);
    });

    test('기본 그리드 크기가 올바르게 정의되어야 함', () => {
      expect(TILE_CONSTANTS.DEFAULT_GRID_SIZE).toBe(100);
      expect(typeof TILE_CONSTANTS.DEFAULT_GRID_SIZE).toBe('number');
    });
  });

  describe('타일 배수 설정', () => {
    test('모든 타일 배수가 양수여야 함', () => {
      Object.values(TILE_CONSTANTS.TILE_MULTIPLIERS).forEach(multiplier => {
        expect(multiplier).toBeGreaterThan(0);
        expect(typeof multiplier).toBe('number');
      });
    });

    test('타일 배수가 올바른 순서로 정의되어야 함', () => {
      const { SMALL, MEDIUM, LARGE, HUGE } = TILE_CONSTANTS.TILE_MULTIPLIERS;
      expect(SMALL).toBeLessThan(MEDIUM);
      expect(MEDIUM).toBeLessThan(LARGE);
      expect(LARGE).toBeLessThan(HUGE);
    });

    test('각 타일 배수가 정확한 값을 가져야 함', () => {
      expect(TILE_CONSTANTS.TILE_MULTIPLIERS.SMALL).toBe(1);
      expect(TILE_CONSTANTS.TILE_MULTIPLIERS.MEDIUM).toBe(2);
      expect(TILE_CONSTANTS.TILE_MULTIPLIERS.LARGE).toBe(3);
      expect(TILE_CONSTANTS.TILE_MULTIPLIERS.HUGE).toBe(4);
    });
  });

  describe('벽 크기 설정', () => {
    test('벽 크기가 모두 양수여야 함', () => {
      const { WIDTH, HEIGHT, THICKNESS, MIN_LENGTH, MAX_LENGTH } = TILE_CONSTANTS.WALL_SIZES;
      expect(WIDTH).toBeGreaterThan(0);
      expect(HEIGHT).toBeGreaterThan(0);
      expect(THICKNESS).toBeGreaterThan(0);
      expect(MIN_LENGTH).toBeGreaterThan(0);
      expect(MAX_LENGTH).toBeGreaterThan(0);
    });

    test('벽 최소 길이가 최대 길이보다 작아야 함', () => {
      const { MIN_LENGTH, MAX_LENGTH } = TILE_CONSTANTS.WALL_SIZES;
      expect(MIN_LENGTH).toBeLessThan(MAX_LENGTH);
    });

    test('벽 두께가 적절한 범위에 있어야 함', () => {
      expect(TILE_CONSTANTS.WALL_SIZES.THICKNESS).toBeGreaterThanOrEqual(0.1);
      expect(TILE_CONSTANTS.WALL_SIZES.THICKNESS).toBeLessThanOrEqual(1);
    });

    test('벽 크기가 정확한 값을 가져야 함', () => {
      expect(TILE_CONSTANTS.WALL_SIZES.WIDTH).toBe(4);
      expect(TILE_CONSTANTS.WALL_SIZES.HEIGHT).toBe(4);
      expect(TILE_CONSTANTS.WALL_SIZES.THICKNESS).toBe(0.5);
      expect(TILE_CONSTANTS.WALL_SIZES.MIN_LENGTH).toBe(0.5);
      expect(TILE_CONSTANTS.WALL_SIZES.MAX_LENGTH).toBe(10);
    });
  });
});

describe('MATERIAL_PRESETS 테스트', () => {
  describe('바닥재 프리셋', () => {
    test('모든 바닥재 프리셋이 존재해야 함', () => {
      expect(MATERIAL_PRESETS.FLOOR.wood).toBeDefined();
      expect(MATERIAL_PRESETS.FLOOR.marble).toBeDefined();
      expect(MATERIAL_PRESETS.FLOOR.concrete).toBeDefined();
      expect(MATERIAL_PRESETS.FLOOR.tile).toBeDefined();
    });

    test('모든 바닥재가 roughness와 metalness 속성을 가져야 함', () => {
      Object.values(MATERIAL_PRESETS.FLOOR).forEach(preset => {
        expect(preset).toHaveProperty('roughness');
        expect(preset).toHaveProperty('metalness');
        expect(typeof preset.roughness).toBe('number');
        expect(typeof preset.metalness).toBe('number');
      });
    });

    test('roughness와 metalness 값이 유효한 범위에 있어야 함', () => {
      Object.values(MATERIAL_PRESETS.FLOOR).forEach(preset => {
        expect(preset.roughness).toBeGreaterThanOrEqual(0);
        expect(preset.roughness).toBeLessThanOrEqual(1);
        expect(preset.metalness).toBeGreaterThanOrEqual(0);
        expect(preset.metalness).toBeLessThanOrEqual(1);
      });
    });

    test('바닥재별 특성이 올바르게 설정되어야 함', () => {
      // 나무는 거칠고 금속성이 없어야 함
      expect(MATERIAL_PRESETS.FLOOR.wood.roughness).toBeGreaterThan(0.5);
      expect(MATERIAL_PRESETS.FLOOR.wood.metalness).toBe(0);
      
      // 대리석은 매끄럽고 약간의 금속성을 가져야 함
      expect(MATERIAL_PRESETS.FLOOR.marble.roughness).toBeLessThan(0.3);
      expect(MATERIAL_PRESETS.FLOOR.marble.metalness).toBeGreaterThan(0);
      
      // 콘크리트는 거칠고 금속성이 없어야 함
      expect(MATERIAL_PRESETS.FLOOR.concrete.roughness).toBeGreaterThan(0.7);
      expect(MATERIAL_PRESETS.FLOOR.concrete.metalness).toBe(0);
    });
  });

  describe('벽재 프리셋', () => {
    test('모든 벽재 프리셋이 존재해야 함', () => {
      expect(MATERIAL_PRESETS.WALL.brick).toBeDefined();
      expect(MATERIAL_PRESETS.WALL.plaster).toBeDefined();
      expect(MATERIAL_PRESETS.WALL.glass).toBeDefined();
      expect(MATERIAL_PRESETS.WALL.metal).toBeDefined();
    });

    test('모든 벽재가 필수 속성을 가져야 함', () => {
      Object.values(MATERIAL_PRESETS.WALL).forEach(preset => {
        expect(preset).toHaveProperty('roughness');
        expect(preset).toHaveProperty('metalness');
        expect(typeof preset.roughness).toBe('number');
        expect(typeof preset.metalness).toBe('number');
      });
    });

    test('유리는 투명도 속성을 가져야 함', () => {
      expect(MATERIAL_PRESETS.WALL.glass).toHaveProperty('opacity');
      expect(typeof MATERIAL_PRESETS.WALL.glass.opacity).toBe('number');
      expect(MATERIAL_PRESETS.WALL.glass.opacity).toBeGreaterThan(0);
      expect(MATERIAL_PRESETS.WALL.glass.opacity).toBeLessThanOrEqual(1);
    });

    test('벽재별 특성이 올바르게 설정되어야 함', () => {
      // 벽돌은 거칠고 금속성이 없어야 함
      expect(MATERIAL_PRESETS.WALL.brick.roughness).toBeGreaterThan(0.7);
      expect(MATERIAL_PRESETS.WALL.brick.metalness).toBe(0);
      
      // 유리는 매끄럽고 투명해야 함
      expect(MATERIAL_PRESETS.WALL.glass.roughness).toBeLessThan(0.2);
      expect(MATERIAL_PRESETS.WALL.glass.opacity).toBeLessThan(0.5);
      
      // 금속은 매끄럽고 높은 금속성을 가져야 함
      expect(MATERIAL_PRESETS.WALL.metal.roughness).toBeLessThan(0.5);
      expect(MATERIAL_PRESETS.WALL.metal.metalness).toBeGreaterThan(0.5);
    });
  });

  describe('상수값 불변성', () => {
    test('TILE_CONSTANTS 객체가 불변이어야 함', () => {
      expect(() => {
        (TILE_CONSTANTS as any).GRID_CELL_SIZE = 10;
      }).toThrow();
    });

    test('MATERIAL_PRESETS 객체가 불변이어야 함', () => {
      expect(() => {
        (MATERIAL_PRESETS as any).FLOOR = {};
      }).toThrow();
    });
  });
}); 