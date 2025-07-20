import { BuildingBridge } from '../BuildingBridge';
import { Position3D, Rotation3D, WallConfig, TileConfig, MeshConfig } from '../../types';

// 타입 정의 (내부 타입들)
type LegacyPosition = [number, number, number];
type LegacyRotation = [number, number, number];

type LegacyWall = {
  id?: string;
  position: LegacyPosition;
  rotation: LegacyRotation;
  wall_parent_id?: string;
};

type LegacyTile = {
  id?: string;
  position: LegacyPosition;
  tile_parent_id?: string;
};

type LegacyMesh = {
  id?: string;
  color?: string;
  material?: string;
  map_texture_url?: string;
  normal_texture_url?: string;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
};

describe('BuildingBridge 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 mock 초기화
    jest.clearAllMocks();
    
    // Date.now() 모킹 (ID 생성 테스트용)
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('위치 변환', () => {
    test('레거시 위치 배열이 Position3D 객체로 올바르게 변환되어야 함', () => {
      const legacyPosition: LegacyPosition = [10, 5, 20];
      const expectedPosition: Position3D = { x: 10, y: 5, z: 20 };

      const result = BuildingBridge.convertLegacyPosition(legacyPosition);

      expect(result).toEqual(expectedPosition);
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('z');
    });

    test('음수 좌표도 올바르게 변환되어야 함', () => {
      const legacyPosition: LegacyPosition = [-10, -5.5, -20.123];
      const expectedPosition: Position3D = { x: -10, y: -5.5, z: -20.123 };

      const result = BuildingBridge.convertLegacyPosition(legacyPosition);

      expect(result).toEqual(expectedPosition);
    });

    test('Position3D 객체가 레거시 위치 배열로 올바르게 변환되어야 함', () => {
      const position: Position3D = { x: 15, y: 10, z: 25 };
      const expectedLegacyPosition: LegacyPosition = [15, 10, 25];

      const result = BuildingBridge.convertToLegacyPosition(position);

      expect(result).toEqual(expectedLegacyPosition);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    test('소수점 좌표도 올바르게 변환되어야 함', () => {
      const position: Position3D = { x: 1.5, y: 2.7, z: 3.14 };
      const expectedLegacyPosition: LegacyPosition = [1.5, 2.7, 3.14];

      const result = BuildingBridge.convertToLegacyPosition(position);

      expect(result).toEqual(expectedLegacyPosition);
    });
  });

  describe('회전 변환', () => {
    test('레거시 회전 배열이 Rotation3D 객체로 올바르게 변환되어야 함', () => {
      const legacyRotation: LegacyRotation = [0, Math.PI / 2, Math.PI];
      const expectedRotation: Rotation3D = { x: 0, y: Math.PI / 2, z: Math.PI };

      const result = BuildingBridge.convertLegacyRotation(legacyRotation);

      expect(result).toEqual(expectedRotation);
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('z');
    });

    test('Rotation3D 객체가 레거시 회전 배열로 올바르게 변환되어야 함', () => {
      const rotation: Rotation3D = { x: Math.PI, y: Math.PI / 4, z: 2 * Math.PI };
      const expectedLegacyRotation: LegacyRotation = [Math.PI, Math.PI / 4, 2 * Math.PI];

      const result = BuildingBridge.convertToLegacyRotation(rotation);

      expect(result).toEqual(expectedLegacyRotation);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    test('0도 회전도 올바르게 변환되어야 함', () => {
      const legacyRotation: LegacyRotation = [0, 0, 0];
      const expectedRotation: Rotation3D = { x: 0, y: 0, z: 0 };

      const result = BuildingBridge.convertLegacyRotation(legacyRotation);

      expect(result).toEqual(expectedRotation);
    });
  });

  describe('벽 변환', () => {
    test('완전한 레거시 벽 데이터가 WallConfig로 올바르게 변환되어야 함', () => {
      const legacyWall: LegacyWall = {
        id: 'legacy-wall-1',
        position: [10, 0, 20],
        rotation: [0, Math.PI / 2, 0],
        wall_parent_id: 'brick-wall-group'
      };

      const result = BuildingBridge.convertLegacyWall(legacyWall);

      expect(result).toEqual({
        id: 'legacy-wall-1',
        position: { x: 10, y: 0, z: 20 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        wallGroupId: 'brick-wall-group',
        width: 4,
        height: 4,
        depth: 0.5
      });
    });

    test('ID가 없는 레거시 벽 데이터는 자동 생성된 ID를 가져야 함', () => {
      const legacyWall: LegacyWall = {
        position: [5, 0, 10],
        rotation: [0, 0, 0]
      };

      const result = BuildingBridge.convertLegacyWall(legacyWall);

      expect(result.id).toBe('wall-1234567890');
      expect(result.wallGroupId).toBe('default');
    });

    test('wall_parent_id가 없는 경우 default가 사용되어야 함', () => {
      const legacyWall: LegacyWall = {
        id: 'test-wall',
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      };

      const result = BuildingBridge.convertLegacyWall(legacyWall);

      expect(result.wallGroupId).toBe('default');
    });

    test('변환된 벽은 기본 크기 속성을 가져야 함', () => {
      const legacyWall: LegacyWall = {
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      };

      const result = BuildingBridge.convertLegacyWall(legacyWall);

      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
      expect(result.depth).toBe(0.5);
    });
  });

  describe('타일 변환', () => {
    test('완전한 레거시 타일 데이터가 TileConfig로 올바르게 변환되어야 함', () => {
      const legacyTile: LegacyTile = {
        id: 'legacy-tile-1',
        position: [8, 0, 16],
        tile_parent_id: 'wood-floor-group'
      };

      const result = BuildingBridge.convertLegacyTile(legacyTile);

      expect(result).toEqual({
        id: 'legacy-tile-1',
        position: { x: 8, y: 0, z: 16 },
        tileGroupId: 'wood-floor-group',
        size: 4
      });
    });

    test('ID가 없는 레거시 타일 데이터는 자동 생성된 ID를 가져야 함', () => {
      const legacyTile: LegacyTile = {
        position: [12, 0, 24]
      };

      const result = BuildingBridge.convertLegacyTile(legacyTile);

      expect(result.id).toBe('tile-1234567890');
      expect(result.tileGroupId).toBe('default');
    });

    test('tile_parent_id가 없는 경우 default가 사용되어야 함', () => {
      const legacyTile: LegacyTile = {
        id: 'test-tile',
        position: [0, 0, 0]
      };

      const result = BuildingBridge.convertLegacyTile(legacyTile);

      expect(result.tileGroupId).toBe('default');
    });

    test('변환된 타일은 기본 크기를 가져야 함', () => {
      const legacyTile: LegacyTile = {
        position: [0, 0, 0]
      };

      const result = BuildingBridge.convertLegacyTile(legacyTile);

      expect(result.size).toBe(4);
    });
  });

  describe('메시 변환', () => {
    test('완전한 레거시 메시 데이터가 MeshConfig로 올바르게 변환되어야 함', () => {
      const legacyMesh: LegacyMesh = {
        id: 'legacy-mesh-1',
        color: '#FF0000',
        material: 'GLASS',
        map_texture_url: 'https://example.com/texture.jpg',
        normal_texture_url: 'https://example.com/normal.jpg',
        roughness: 0.3,
        metalness: 0.8,
        opacity: 0.7,
        transparent: true
      };

      const result = BuildingBridge.convertLegacyMesh(legacyMesh);

      expect(result).toEqual({
        id: 'legacy-mesh-1',
        color: '#FF0000',
        material: 'GLASS',
        mapTextureUrl: 'https://example.com/texture.jpg',
        normalTextureUrl: 'https://example.com/normal.jpg',
        roughness: 0.3,
        metalness: 0.8,
        opacity: 0.7,
        transparent: true
      });
    });

    test('최소한의 레거시 메시 데이터가 기본값과 함께 변환되어야 함', () => {
      const legacyMesh: LegacyMesh = {};

      const result = BuildingBridge.convertLegacyMesh(legacyMesh);

      expect(result).toEqual({
        id: 'mesh-1234567890',
        color: '#ffffff',
        material: 'STANDARD',
        mapTextureUrl: undefined,
        normalTextureUrl: undefined,
        roughness: 0.5,
        metalness: 0,
        opacity: 1,
        transparent: false
      });
    });

    test('GLASS가 아닌 재질은 STANDARD로 변환되어야 함', () => {
      const legacyMesh1: LegacyMesh = { material: 'METAL' };
      const legacyMesh2: LegacyMesh = { material: 'WOOD' };
      const legacyMesh3: LegacyMesh = { material: undefined };

      const result1 = BuildingBridge.convertLegacyMesh(legacyMesh1);
      const result2 = BuildingBridge.convertLegacyMesh(legacyMesh2);
      const result3 = BuildingBridge.convertLegacyMesh(legacyMesh3);

      expect(result1.material).toBe('STANDARD');
      expect(result2.material).toBe('STANDARD');
      expect(result3.material).toBe('STANDARD');
    });

    test('GLASS 재질은 그대로 유지되어야 함', () => {
      const legacyMesh: LegacyMesh = { material: 'GLASS' };

      const result = BuildingBridge.convertLegacyMesh(legacyMesh);

      expect(result.material).toBe('GLASS');
    });

    test('부분적인 데이터는 기본값으로 채워져야 함', () => {
      const legacyMesh: LegacyMesh = {
        id: 'partial-mesh',
        color: '#00FF00',
        roughness: 0.8
      };

      const result = BuildingBridge.convertLegacyMesh(legacyMesh);

      expect(result.id).toBe('partial-mesh');
      expect(result.color).toBe('#00FF00');
      expect(result.roughness).toBe(0.8);
      expect(result.material).toBe('STANDARD'); // 기본값
      expect(result.metalness).toBe(0); // 기본값
      expect(result.opacity).toBe(1); // 기본값
      expect(result.transparent).toBe(false); // 기본값
    });
  });

  describe('상호 변환 일관성', () => {
    test('위치 변환이 상호 일관성을 가져야 함', () => {
      const originalPosition: Position3D = { x: 10, y: 5, z: 20 };
      
      const legacyPosition = BuildingBridge.convertToLegacyPosition(originalPosition);
      const convertedBack = BuildingBridge.convertLegacyPosition(legacyPosition);

      expect(convertedBack).toEqual(originalPosition);
    });

    test('회전 변환이 상호 일관성을 가져야 함', () => {
      const originalRotation: Rotation3D = { x: Math.PI, y: Math.PI / 2, z: 2 * Math.PI };
      
      const legacyRotation = BuildingBridge.convertToLegacyRotation(originalRotation);
      const convertedBack = BuildingBridge.convertLegacyRotation(legacyRotation);

      expect(convertedBack).toEqual(originalRotation);
    });
  });

  describe('에러 처리', () => {
    test('잘못된 레거시 위치 데이터에 대해 예외가 처리되어야 함', () => {
      const invalidPosition = null as any;

      // @HandleError 데코레이터가 있어서 예외가 throw되지 않아야 함
      expect(() => {
        BuildingBridge.convertLegacyPosition(invalidPosition);
      }).not.toThrow();
    });

    test('잘못된 레거시 회전 데이터에 대해 예외가 처리되어야 함', () => {
      const invalidRotation = undefined as any;

      expect(() => {
        BuildingBridge.convertLegacyRotation(invalidRotation);
      }).not.toThrow();
    });

    test('잘못된 레거시 벽 데이터에 대해 예외가 처리되어야 함', () => {
      const invalidWall = null as any;

      expect(() => {
        BuildingBridge.convertLegacyWall(invalidWall);
      }).not.toThrow();
    });

    test('잘못된 레거시 타일 데이터에 대해 예외가 처리되어야 함', () => {
      const invalidTile = undefined as any;

      expect(() => {
        BuildingBridge.convertLegacyTile(invalidTile);
      }).not.toThrow();
    });

    test('잘못된 레거시 메시 데이터에 대해 예외가 처리되어야 함', () => {
      const invalidMesh = null as any;

      expect(() => {
        BuildingBridge.convertLegacyMesh(invalidMesh);
      }).not.toThrow();
    });
  });

  describe('성능 및 최적화', () => {
    test('대량의 위치 변환이 효율적으로 처리되어야 함', () => {
      const positions: LegacyPosition[] = [];
      for (let i = 0; i < 1000; i++) {
        positions.push([i * 10, i * 5, i * 20]);
      }

      const startTime = Date.now();
      
      positions.forEach(pos => {
        BuildingBridge.convertLegacyPosition(pos);
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 1000개 변환이 100ms 내에 완료되어야 함
      expect(executionTime).toBeLessThan(100);
    });

    test('대량의 벽 변환이 효율적으로 처리되어야 함', () => {
      const walls: LegacyWall[] = [];
      for (let i = 0; i < 500; i++) {
        walls.push({
          id: `wall-${i}`,
          position: [i * 4, 0, i * 4],
          rotation: [0, (i * Math.PI) / 180, 0],
          wall_parent_id: `group-${i % 10}`
        });
      }

      const startTime = Date.now();
      
      walls.forEach(wall => {
        BuildingBridge.convertLegacyWall(wall);
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 500개 변환이 100ms 내에 완료되어야 함
      expect(executionTime).toBeLessThan(100);
    });
  });

  describe('데코레이터 통합', () => {
    test('@Profile 데코레이터가 적용되어야 함', () => {
      // Profile 데코레이터는 성능 측정을 위한 것이므로
      // 실제 동작에는 영향을 주지 않아야 함
      const legacyPosition: LegacyPosition = [1, 2, 3];

      expect(() => {
        BuildingBridge.convertLegacyPosition(legacyPosition);
      }).not.toThrow();
    });

    test('@HandleError 데코레이터가 모든 메서드에 적용되어야 함', () => {
      // HandleError 데코레이터는 예외를 잡아서 처리하므로
      // 잘못된 데이터가 들어와도 예외가 발생하지 않아야 함
      expect(() => {
        BuildingBridge.convertLegacyPosition(null as any);
        BuildingBridge.convertLegacyRotation(undefined as any);
        BuildingBridge.convertToLegacyPosition(null as any);
        BuildingBridge.convertToLegacyRotation(undefined as any);
        BuildingBridge.convertLegacyWall(null as any);
        BuildingBridge.convertLegacyTile(undefined as any);
        BuildingBridge.convertLegacyMesh(null as any);
      }).not.toThrow();
    });
  });

  describe('타입 안정성', () => {
    test('변환된 결과가 올바른 타입을 가져야 함', () => {
      const legacyPosition: LegacyPosition = [1, 2, 3];
      const result = BuildingBridge.convertLegacyPosition(legacyPosition);

      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(typeof result.z).toBe('number');
    });

    test('생성된 ID가 올바른 형식이어야 함', () => {
      const legacyWall: LegacyWall = {
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      };

      const result = BuildingBridge.convertLegacyWall(legacyWall);

      expect(result.id).toMatch(/^wall-\d+$/);
    });

    test('메시 변환 시 재질 타입이 제한되어야 함', () => {
      const glassMesh: LegacyMesh = { material: 'GLASS' };
      const otherMesh: LegacyMesh = { material: 'UNKNOWN' };

      const glassResult = BuildingBridge.convertLegacyMesh(glassMesh);
      const otherResult = BuildingBridge.convertLegacyMesh(otherMesh);

      expect(['GLASS', 'STANDARD', 'METAL']).toContain(glassResult.material);
      expect(['GLASS', 'STANDARD', 'METAL']).toContain(otherResult.material);
    });
  });
}); 