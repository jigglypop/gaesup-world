import {
  Position3D,
  Rotation3D,
  MeshConfig,
  WallConfig,
  WallGroupConfig,
  TileConfig,
  TileGroupConfig,
  WallCategory,
  TileCategory,
  BuildingSystemState
} from '../index';

describe('Position3D 인터페이스 테스트', () => {
  test('Position3D 객체가 올바른 구조를 가져야 함', () => {
    const position: Position3D = { x: 1, y: 2, z: 3 };
    
    expect(position).toHaveProperty('x');
    expect(position).toHaveProperty('y');
    expect(position).toHaveProperty('z');
    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
    expect(typeof position.z).toBe('number');
  });

  test('Position3D에서 음수 좌표가 허용되어야 함', () => {
    const position: Position3D = { x: -10, y: -5.5, z: -1.234 };
    
    expect(position.x).toBe(-10);
    expect(position.y).toBe(-5.5);
    expect(position.z).toBe(-1.234);
  });

  test('Position3D에서 소수점 좌표가 허용되어야 함', () => {
    const position: Position3D = { x: 1.5, y: 2.7, z: 3.14 };
    
    expect(position.x).toBe(1.5);
    expect(position.y).toBe(2.7);
    expect(position.z).toBe(3.14);
  });
});

describe('Rotation3D 인터페이스 테스트', () => {
  test('Rotation3D 객체가 올바른 구조를 가져야 함', () => {
    const rotation: Rotation3D = { x: 0, y: Math.PI / 2, z: Math.PI };
    
    expect(rotation).toHaveProperty('x');
    expect(rotation).toHaveProperty('y');
    expect(rotation).toHaveProperty('z');
    expect(typeof rotation.x).toBe('number');
    expect(typeof rotation.y).toBe('number');
    expect(typeof rotation.z).toBe('number');
  });

  test('Rotation3D에서 라디안 값이 허용되어야 함', () => {
    const rotation: Rotation3D = { x: 0, y: Math.PI, z: 2 * Math.PI };
    
    expect(rotation.y).toBe(Math.PI);
    expect(rotation.z).toBe(2 * Math.PI);
  });
});

describe('MeshConfig 인터페이스 테스트', () => {
  test('MeshConfig 최소 필수 속성이 있어야 함', () => {
    const meshConfig: MeshConfig = { id: 'test-mesh' };
    
    expect(meshConfig).toHaveProperty('id');
    expect(typeof meshConfig.id).toBe('string');
    expect(meshConfig.id).toBeTruthy();
  });

  test('MeshConfig 모든 선택적 속성이 올바르게 작동해야 함', () => {
    const meshConfig: MeshConfig = {
      id: 'complete-mesh',
      color: '#FF0000',
      material: 'STANDARD',
      mapTextureUrl: 'https://example.com/texture.jpg',
      normalTextureUrl: 'https://example.com/normal.jpg',
      roughness: 0.5,
      metalness: 0.2,
      opacity: 0.8,
      transparent: true
    };
    
    expect(meshConfig.color).toBe('#FF0000');
    expect(meshConfig.material).toBe('STANDARD');
    expect(meshConfig.roughness).toBe(0.5);
    expect(meshConfig.metalness).toBe(0.2);
    expect(meshConfig.opacity).toBe(0.8);
    expect(meshConfig.transparent).toBe(true);
  });

  test('MeshConfig 재질 타입이 제한되어야 함', () => {
    const standardMesh: MeshConfig = { id: 'standard', material: 'STANDARD' };
    const glassMesh: MeshConfig = { id: 'glass', material: 'GLASS' };
    const metalMesh: MeshConfig = { id: 'metal', material: 'METAL' };
    
    expect(standardMesh.material).toBe('STANDARD');
    expect(glassMesh.material).toBe('GLASS');
    expect(metalMesh.material).toBe('METAL');
  });

  test('MeshConfig 물리적 속성이 유효한 범위에 있어야 함', () => {
    const meshConfig: MeshConfig = {
      id: 'physics-mesh',
      roughness: 0.7,
      metalness: 0.3,
      opacity: 0.9
    };
    
    expect(meshConfig.roughness).toBeGreaterThanOrEqual(0);
    expect(meshConfig.roughness).toBeLessThanOrEqual(1);
    expect(meshConfig.metalness).toBeGreaterThanOrEqual(0);
    expect(meshConfig.metalness).toBeLessThanOrEqual(1);
    expect(meshConfig.opacity).toBeGreaterThanOrEqual(0);
    expect(meshConfig.opacity).toBeLessThanOrEqual(1);
  });
});

describe('WallConfig 인터페이스 테스트', () => {
  test('WallConfig 필수 속성이 모두 있어야 함', () => {
    const wallConfig: WallConfig = {
      id: 'test-wall',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      wallGroupId: 'test-group'
    };
    
    expect(wallConfig).toHaveProperty('id');
    expect(wallConfig).toHaveProperty('position');
    expect(wallConfig).toHaveProperty('rotation');
    expect(wallConfig).toHaveProperty('wallGroupId');
    expect(typeof wallConfig.id).toBe('string');
    expect(typeof wallConfig.wallGroupId).toBe('string');
  });

  test('WallConfig 선택적 크기 속성이 올바르게 작동해야 함', () => {
    const wallConfig: WallConfig = {
      id: 'sized-wall',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      wallGroupId: 'test-group',
      width: 4,
      height: 3,
      depth: 0.5
    };
    
    expect(wallConfig.width).toBe(4);
    expect(wallConfig.height).toBe(3);
    expect(wallConfig.depth).toBe(0.5);
  });
});

describe('WallGroupConfig 인터페이스 테스트', () => {
  test('WallGroupConfig 필수 속성이 모두 있어야 함', () => {
    const wallGroupConfig: WallGroupConfig = {
      id: 'test-wall-group',
      name: 'Test Wall Group',
      walls: []
    };
    
    expect(wallGroupConfig).toHaveProperty('id');
    expect(wallGroupConfig).toHaveProperty('name');
    expect(wallGroupConfig).toHaveProperty('walls');
    expect(Array.isArray(wallGroupConfig.walls)).toBe(true);
  });

  test('WallGroupConfig에서 벽 배열이 올바르게 작동해야 함', () => {
    const wall1: WallConfig = {
      id: 'wall-1',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      wallGroupId: 'test-group'
    };
    
    const wallGroupConfig: WallGroupConfig = {
      id: 'test-wall-group',
      name: 'Test Wall Group',
      walls: [wall1]
    };
    
    expect(wallGroupConfig.walls).toHaveLength(1);
    expect(wallGroupConfig.walls[0]).toBe(wall1);
  });

  test('WallGroupConfig 메시 ID가 선택적이어야 함', () => {
    const wallGroupConfig: WallGroupConfig = {
      id: 'mesh-wall-group',
      name: 'Mesh Wall Group',
      frontMeshId: 'front-mesh',
      backMeshId: 'back-mesh',
      sideMeshId: 'side-mesh',
      walls: []
    };
    
    expect(wallGroupConfig.frontMeshId).toBe('front-mesh');
    expect(wallGroupConfig.backMeshId).toBe('back-mesh');
    expect(wallGroupConfig.sideMeshId).toBe('side-mesh');
  });
});

describe('TileConfig 인터페이스 테스트', () => {
  test('TileConfig 필수 속성이 모두 있어야 함', () => {
    const tileConfig: TileConfig = {
      id: 'test-tile',
      position: { x: 0, y: 0, z: 0 },
      tileGroupId: 'test-tile-group'
    };
    
    expect(tileConfig).toHaveProperty('id');
    expect(tileConfig).toHaveProperty('position');
    expect(tileConfig).toHaveProperty('tileGroupId');
  });

  test('TileConfig 오브젝트 타입이 제한되어야 함', () => {
    const waterTile: TileConfig = {
      id: 'water-tile',
      position: { x: 0, y: 0, z: 0 },
      tileGroupId: 'test-group',
      objectType: 'water'
    };
    
    const grassTile: TileConfig = {
      id: 'grass-tile',
      position: { x: 0, y: 0, z: 0 },
      tileGroupId: 'test-group',
      objectType: 'grass'
    };
    
    expect(waterTile.objectType).toBe('water');
    expect(grassTile.objectType).toBe('grass');
  });

  test('TileConfig 오브젝트 설정이 올바르게 작동해야 함', () => {
    const grassTile: TileConfig = {
      id: 'grass-tile',
      position: { x: 0, y: 0, z: 0 },
      tileGroupId: 'test-group',
      objectType: 'grass',
      objectConfig: {
        grassDensity: 1000
      }
    };
    
    const flagTile: TileConfig = {
      id: 'flag-tile',
      position: { x: 0, y: 0, z: 0 },
      tileGroupId: 'test-group',
      objectType: 'flag',
      objectConfig: {
        flagTexture: 'korea-flag.png'
      }
    };
    
    expect(grassTile.objectConfig?.grassDensity).toBe(1000);
    expect(flagTile.objectConfig?.flagTexture).toBe('korea-flag.png');
  });
});

describe('TileGroupConfig 인터페이스 테스트', () => {
  test('TileGroupConfig 필수 속성이 모두 있어야 함', () => {
    const tileGroupConfig: TileGroupConfig = {
      id: 'test-tile-group',
      name: 'Test Tile Group',
      floorMeshId: 'wood-floor',
      tiles: []
    };
    
    expect(tileGroupConfig).toHaveProperty('id');
    expect(tileGroupConfig).toHaveProperty('name');
    expect(tileGroupConfig).toHaveProperty('floorMeshId');
    expect(tileGroupConfig).toHaveProperty('tiles');
    expect(Array.isArray(tileGroupConfig.tiles)).toBe(true);
  });
});

describe('WallCategory 인터페이스 테스트', () => {
  test('WallCategory 필수 속성이 모두 있어야 함', () => {
    const wallCategory: WallCategory = {
      id: 'interior-walls',
      name: 'Interior Walls',
      wallGroupIds: ['plaster-walls', 'painted-walls']
    };
    
    expect(wallCategory).toHaveProperty('id');
    expect(wallCategory).toHaveProperty('name');
    expect(wallCategory).toHaveProperty('wallGroupIds');
    expect(Array.isArray(wallCategory.wallGroupIds)).toBe(true);
  });

  test('WallCategory 설명이 선택적이어야 함', () => {
    const wallCategory: WallCategory = {
      id: 'exterior-walls',
      name: 'Exterior Walls',
      description: 'Walls for building exteriors',
      wallGroupIds: ['brick-walls']
    };
    
    expect(wallCategory.description).toBe('Walls for building exteriors');
  });
});

describe('TileCategory 인터페이스 테스트', () => {
  test('TileCategory 필수 속성이 모두 있어야 함', () => {
    const tileCategory: TileCategory = {
      id: 'wood-floors',
      name: 'Wood Floors',
      tileGroupIds: ['oak-floor', 'pine-floor']
    };
    
    expect(tileCategory).toHaveProperty('id');
    expect(tileCategory).toHaveProperty('name');
    expect(tileCategory).toHaveProperty('tileGroupIds');
    expect(Array.isArray(tileCategory.tileGroupIds)).toBe(true);
  });
});

describe('BuildingSystemState 인터페이스 테스트', () => {
  test('BuildingSystemState 모든 필수 속성이 있어야 함', () => {
    const state: BuildingSystemState = {
      meshes: new Map(),
      wallGroups: new Map(),
      tileGroups: new Map(),
      wallCategories: new Map(),
      tileCategories: new Map(),
      editMode: 'none',
      showGrid: true,
      gridSize: 100,
      snapToGrid: true
    };
    
    expect(state).toHaveProperty('meshes');
    expect(state).toHaveProperty('wallGroups');
    expect(state).toHaveProperty('tileGroups');
    expect(state).toHaveProperty('wallCategories');
    expect(state).toHaveProperty('tileCategories');
    expect(state).toHaveProperty('editMode');
    expect(state).toHaveProperty('showGrid');
    expect(state).toHaveProperty('gridSize');
    expect(state).toHaveProperty('snapToGrid');
  });

  test('BuildingSystemState Map 타입이 올바르게 작동해야 함', () => {
    const state: BuildingSystemState = {
      meshes: new Map([['test-mesh', { id: 'test-mesh' }]]),
      wallGroups: new Map(),
      tileGroups: new Map(),
      wallCategories: new Map(),
      tileCategories: new Map(),
      editMode: 'wall',
      showGrid: false,
      gridSize: 50,
      snapToGrid: false
    };
    
    expect(state.meshes instanceof Map).toBe(true);
    expect(state.meshes.has('test-mesh')).toBe(true);
    expect(state.meshes.get('test-mesh')?.id).toBe('test-mesh');
  });

  test('BuildingSystemState 편집 모드가 제한되어야 함', () => {
    const noneState: BuildingSystemState = {
      meshes: new Map(),
      wallGroups: new Map(),
      tileGroups: new Map(),
      wallCategories: new Map(),
      tileCategories: new Map(),
      editMode: 'none',
      showGrid: true,
      gridSize: 100,
      snapToGrid: true
    };
    
    const wallState: BuildingSystemState = {
      ...noneState,
      editMode: 'wall'
    };
    
    const tileState: BuildingSystemState = {
      ...noneState,
      editMode: 'tile'
    };
    
    const npcState: BuildingSystemState = {
      ...noneState,
      editMode: 'npc'
    };
    
    expect(noneState.editMode).toBe('none');
    expect(wallState.editMode).toBe('wall');
    expect(tileState.editMode).toBe('tile');
    expect(npcState.editMode).toBe('npc');
  });

  test('BuildingSystemState 선택적 ID 속성이 올바르게 작동해야 함', () => {
    const state: BuildingSystemState = {
      meshes: new Map(),
      wallGroups: new Map(),
      tileGroups: new Map(),
      wallCategories: new Map(),
      tileCategories: new Map(),
      selectedWallGroupId: 'selected-wall-group',
      selectedTileGroupId: 'selected-tile-group',
      selectedWallCategoryId: 'selected-wall-category',
      selectedTileCategoryId: 'selected-tile-category',
      editMode: 'none',
      showGrid: true,
      gridSize: 100,
      snapToGrid: true
    };
    
    expect(state.selectedWallGroupId).toBe('selected-wall-group');
    expect(state.selectedTileGroupId).toBe('selected-tile-group');
    expect(state.selectedWallCategoryId).toBe('selected-wall-category');
    expect(state.selectedTileCategoryId).toBe('selected-tile-category');
  });
}); 