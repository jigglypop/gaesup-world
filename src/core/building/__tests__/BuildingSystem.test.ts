import { BuildingSystem } from '../core/BuildingSystem';
import { BuildingType, BuildingConfig, BuildingState } from '../core/types';
import * as THREE from 'three';

// Mock Three.js objects
const mockGeometry = new THREE.BoxGeometry(1, 1, 1);
const mockMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const mockMesh = {
  geometry: mockGeometry,
  material: mockMaterial,
  position: new THREE.Vector3(),
  rotation: new THREE.Euler(),
  scale: new THREE.Vector3(1, 1, 1),
  userData: {},
  add: jest.fn(),
  remove: jest.fn(),
  traverse: jest.fn(),
  updateMatrix: jest.fn(),
  updateMatrixWorld: jest.fn(),
} as unknown as THREE.Mesh;

// Mock building configurations
const mockBuildingConfigs: Record<BuildingType, BuildingConfig> = {
  [BuildingType.HOUSE]: {
    type: BuildingType.HOUSE,
    dimensions: { width: 10, height: 8, depth: 10 },
    cost: 1000,
    buildTime: 30,
    requirements: { level: 1, resources: { wood: 50, stone: 30 } },
    capacity: { residents: 4 },
    features: ['door', 'windows', 'roof'],
  },
  [BuildingType.FACTORY]: {
    type: BuildingType.FACTORY,
    dimensions: { width: 20, height: 12, depth: 15 },
    cost: 5000,
    buildTime: 120,
    requirements: { level: 3, resources: { steel: 100, concrete: 200 } },
    capacity: { workers: 20, production: 50 },
    features: ['machinery', 'smokestacks', 'loading_dock'],
  },
  [BuildingType.SHOP]: {
    type: BuildingType.SHOP,
    dimensions: { width: 8, height: 6, depth: 8 },
    cost: 2000,
    buildTime: 60,
    requirements: { level: 2, resources: { wood: 30, glass: 20 } },
    capacity: { customers: 10, inventory: 100 },
    features: ['display_window', 'entrance', 'storage'],
  },
};

describe('BuildingSystem', () => {
  let buildingSystem: BuildingSystem;
  let mockScene: THREE.Scene;

  beforeEach(() => {
    mockScene = {
      add: jest.fn(),
      remove: jest.fn(),
      getObjectByName: jest.fn(),
      traverse: jest.fn(),
    } as unknown as THREE.Scene;

    buildingSystem = new BuildingSystem(mockScene, mockBuildingConfigs);
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    buildingSystem?.dispose();
  });

  describe('Initialization', () => {
    test('should initialize with scene and building configs', () => {
      expect(buildingSystem).toBeDefined();
      expect(buildingSystem.isEnabled()).toBe(true);
    });

    test('should throw error with invalid parameters', () => {
      expect(() => new BuildingSystem(null as any, mockBuildingConfigs)).toThrow();
      expect(() => new BuildingSystem(mockScene, null as any)).toThrow();
    });

    test('should validate building configurations', () => {
      const invalidConfigs = {
        [BuildingType.HOUSE]: {
          // Missing required properties
          type: BuildingType.HOUSE,
        }
      } as any;

      expect(() => new BuildingSystem(mockScene, invalidConfigs)).toThrow();
    });
  });

  describe('Building Creation', () => {
    test('should create building with valid configuration', () => {
      const position = new THREE.Vector3(10, 0, 10);
      const rotation = 0;
      
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        position,
        rotation
      );
      
      expect(buildingId).toBeDefined();
      expect(typeof buildingId).toBe('string');
      expect(mockScene.add).toHaveBeenCalled();
    });

    test('should assign unique IDs to buildings', () => {
      const position1 = new THREE.Vector3(0, 0, 0);
      const position2 = new THREE.Vector3(10, 0, 10);
      
      const id1 = buildingSystem.createBuilding(BuildingType.HOUSE, position1);
      const id2 = buildingSystem.createBuilding(BuildingType.HOUSE, position2);
      
      expect(id1).not.toBe(id2);
    });

    test('should set correct position and rotation', () => {
      const position = new THREE.Vector3(5, 0, 5);
      const rotation = Math.PI / 4;
      
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        position,
        rotation
      );
      
      const building = buildingSystem.getBuilding(buildingId);
      expect(building).toBeDefined();
      expect(building!.position).toEqual(position);
      expect(building!.rotation).toBe(rotation);
    });

    test('should initialize building state correctly', () => {
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      
      const building = buildingSystem.getBuilding(buildingId);
      expect(building).toBeDefined();
      expect(building!.state).toBe(BuildingState.PLANNING);
      expect(building!.progress).toBe(0);
      expect(building!.health).toBe(100);
    });

    test('should handle invalid building types', () => {
      expect(() => {
        buildingSystem.createBuilding(
          'invalid_type' as BuildingType,
          new THREE.Vector3(0, 0, 0)
        );
      }).toThrow();
    });
  });

  describe('Building Management', () => {
    let buildingId: string;

    beforeEach(() => {
      buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
    });

    test('should retrieve building by ID', () => {
      const building = buildingSystem.getBuilding(buildingId);
      
      expect(building).toBeDefined();
      expect(building!.id).toBe(buildingId);
      expect(building!.type).toBe(BuildingType.HOUSE);
    });

    test('should remove building correctly', () => {
      const success = buildingSystem.removeBuilding(buildingId);
      
      expect(success).toBe(true);
      expect(buildingSystem.getBuilding(buildingId)).toBeUndefined();
      expect(mockScene.remove).toHaveBeenCalled();
    });

    test('should handle removal of non-existent building', () => {
      const success = buildingSystem.removeBuilding('non-existent-id');
      
      expect(success).toBe(false);
    });

    test('should get all buildings', () => {
      const building2Id = buildingSystem.createBuilding(
        BuildingType.FACTORY,
        new THREE.Vector3(20, 0, 20)
      );
      
      const buildings = buildingSystem.getAllBuildings();
      
      expect(buildings).toHaveLength(2);
      expect(buildings.map(b => b.id)).toContain(buildingId);
      expect(buildings.map(b => b.id)).toContain(building2Id);
    });

    test('should get buildings by type', () => {
      buildingSystem.createBuilding(
        BuildingType.FACTORY,
        new THREE.Vector3(20, 0, 20)
      );
      
      const houses = buildingSystem.getBuildingsByType(BuildingType.HOUSE);
      const factories = buildingSystem.getBuildingsByType(BuildingType.FACTORY);
      
      expect(houses).toHaveLength(1);
      expect(factories).toHaveLength(1);
      expect(houses[0].type).toBe(BuildingType.HOUSE);
      expect(factories[0].type).toBe(BuildingType.FACTORY);
    });
  });

  describe('Building States and Lifecycle', () => {
    let buildingId: string;

    beforeEach(() => {
      buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
    });

    test('should start construction', () => {
      const success = buildingSystem.startConstruction(buildingId);
      
      expect(success).toBe(true);
      
      const building = buildingSystem.getBuilding(buildingId);
      expect(building!.state).toBe(BuildingState.CONSTRUCTING);
    });

    test('should not start construction if requirements not met', () => {
      // Mock insufficient resources
      const insufficientResources = { wood: 10, stone: 5 }; // Less than required
      
      const success = buildingSystem.startConstruction(buildingId, insufficientResources);
      
      expect(success).toBe(false);
      
      const building = buildingSystem.getBuilding(buildingId);
      expect(building!.state).toBe(BuildingState.PLANNING);
    });

    test('should update construction progress over time', () => {
      buildingSystem.startConstruction(buildingId);
      
      const building = buildingSystem.getBuilding(buildingId);
      const initialProgress = building!.progress;
      
      // Simulate time passing
      buildingSystem.update(1000); // 1 second
      
      const updatedBuilding = buildingSystem.getBuilding(buildingId);
      expect(updatedBuilding!.progress).toBeGreaterThan(initialProgress);
    });

    test('should complete construction when progress reaches 100%', () => {
      buildingSystem.startConstruction(buildingId);
      
      // Fast-forward construction
      const config = mockBuildingConfigs[BuildingType.HOUSE];
      buildingSystem.update(config.buildTime * 1000); // Convert to milliseconds
      
      const building = buildingSystem.getBuilding(buildingId);
      expect(building!.state).toBe(BuildingState.OPERATIONAL);
      expect(building!.progress).toBe(100);
    });

    test('should pause and resume construction', () => {
      buildingSystem.startConstruction(buildingId);
      
      // Pause construction
      buildingSystem.pauseConstruction(buildingId);
      const building = buildingSystem.getBuilding(buildingId);
      expect(building!.state).toBe(BuildingState.PAUSED);
      
      // Resume construction
      buildingSystem.resumeConstruction(buildingId);
      const resumedBuilding = buildingSystem.getBuilding(buildingId);
      expect(resumedBuilding!.state).toBe(BuildingState.CONSTRUCTING);
    });

    test('should handle building demolition', () => {
      // Complete building first
      buildingSystem.startConstruction(buildingId);
      const config = mockBuildingConfigs[BuildingType.HOUSE];
      buildingSystem.update(config.buildTime * 1000);
      
      // Start demolition
      const success = buildingSystem.startDemolition(buildingId);
      expect(success).toBe(true);
      
      const building = buildingSystem.getBuilding(buildingId);
      expect(building!.state).toBe(BuildingState.DEMOLISHING);
    });
  });

  describe('Building Features and Upgrades', () => {
    let buildingId: string;

    beforeEach(() => {
      buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      // Complete construction
      buildingSystem.startConstruction(buildingId);
      const config = mockBuildingConfigs[BuildingType.HOUSE];
      buildingSystem.update(config.buildTime * 1000);
    });

    test('should upgrade building successfully', () => {
      const success = buildingSystem.upgradeBuilding(buildingId, {
        capacity: { residents: 6 },
        features: ['door', 'windows', 'roof', 'garage'],
      });
      
      expect(success).toBe(true);
      
      const building = buildingSystem.getBuilding(buildingId);
      expect(building!.capacity.residents).toBe(6);
      expect(building!.features).toContain('garage');
    });

    test('should repair damaged building', () => {
      const building = buildingSystem.getBuilding(buildingId);
      building!.health = 50; // Damage the building
      
      const success = buildingSystem.repairBuilding(buildingId);
      expect(success).toBe(true);
      
      const repairedBuilding = buildingSystem.getBuilding(buildingId);
      expect(repairedBuilding!.health).toBe(100);
    });

    test('should handle building damage over time', () => {
      const building = buildingSystem.getBuilding(buildingId);
      const initialHealth = building!.health;
      
      // Enable aging/damage
      buildingSystem.setEnvironmentalDamage(true);
      
      // Simulate long time passage
      buildingSystem.update(365 * 24 * 60 * 60 * 1000); // 1 year
      
      const agedBuilding = buildingSystem.getBuilding(buildingId);
      expect(agedBuilding!.health).toBeLessThan(initialHealth);
    });
  });

  describe('Placement and Collision Detection', () => {
    test('should check if position is valid for building placement', () => {
      const validPosition = new THREE.Vector3(10, 0, 10);
      const isValid = buildingSystem.isValidPlacement(
        BuildingType.HOUSE,
        validPosition
      );
      
      expect(isValid).toBe(true);
    });

    test('should detect collision with existing buildings', () => {
      const position = new THREE.Vector3(0, 0, 0);
      
      // Place first building
      buildingSystem.createBuilding(BuildingType.HOUSE, position);
      
      // Try to place second building at same location
      const isValid = buildingSystem.isValidPlacement(
        BuildingType.HOUSE,
        position
      );
      
      expect(isValid).toBe(false);
    });

    test('should respect minimum distance between buildings', () => {
      const position1 = new THREE.Vector3(0, 0, 0);
      const position2 = new THREE.Vector3(2, 0, 2); // Too close
      
      buildingSystem.createBuilding(BuildingType.HOUSE, position1);
      
      const isValid = buildingSystem.isValidPlacement(
        BuildingType.HOUSE,
        position2
      );
      
      expect(isValid).toBe(false);
    });

    test('should validate terrain suitability', () => {
      // Mock terrain with steep slope
      const steepPosition = new THREE.Vector3(0, 10, 0);
      
      const isValid = buildingSystem.isValidPlacement(
        BuildingType.HOUSE,
        steepPosition
      );
      
      // Should fail on steep terrain
      expect(isValid).toBe(false);
    });
  });

  describe('Resource Management', () => {
    test('should calculate resource requirements correctly', () => {
      const requirements = buildingSystem.getResourceRequirements(BuildingType.HOUSE);
      
      expect(requirements).toEqual({
        wood: 50,
        stone: 30,
      });
    });

    test('should validate resource availability', () => {
      const availableResources = { wood: 100, stone: 50 };
      const sufficientResources = { wood: 30, stone: 20 };
      
      const hasEnough = buildingSystem.hasRequiredResources(
        BuildingType.HOUSE,
        availableResources
      );
      
      const hasInsufficient = buildingSystem.hasRequiredResources(
        BuildingType.HOUSE,
        sufficientResources
      );
      
      expect(hasEnough).toBe(true);
      expect(hasInsufficient).toBe(false);
    });

    test('should consume resources during construction', () => {
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      
      const initialResources = { wood: 100, stone: 50 };
      buildingSystem.startConstruction(buildingId, initialResources);
      
      const consumedResources = buildingSystem.getConsumedResources(buildingId);
      
      expect(consumedResources.wood).toBe(50);
      expect(consumedResources.stone).toBe(30);
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle many buildings efficiently', () => {
      const buildingCount = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < buildingCount; i++) {
        const position = new THREE.Vector3(i * 15, 0, 0);
        buildingSystem.createBuilding(BuildingType.HOUSE, position);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should create 100 buildings in reasonable time
      expect(totalTime).toBeLessThan(100);
      expect(buildingSystem.getAllBuildings()).toHaveLength(buildingCount);
    });

    test('should optimize update cycles for large numbers of buildings', () => {
      // Create many buildings
      for (let i = 0; i < 50; i++) {
        const position = new THREE.Vector3(i * 15, 0, 0);
        const buildingId = buildingSystem.createBuilding(BuildingType.HOUSE, position);
        buildingSystem.startConstruction(buildingId);
      }
      
      const startTime = performance.now();
      buildingSystem.update(1000);
      const endTime = performance.now();
      
      const updateTime = endTime - startTime;
      
      // Should update 50 buildings in reasonable time
      expect(updateTime).toBeLessThan(50);
    });

    test('should use LOD (Level of Detail) for distant buildings', () => {
      const farBuilding = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(1000, 0, 1000)
      );
      
      const nearBuilding = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      
      // Set camera position
      const cameraPosition = new THREE.Vector3(0, 5, 10);
      buildingSystem.updateLOD(cameraPosition);
      
      const farBuildingObj = buildingSystem.getBuilding(farBuilding);
      const nearBuildingObj = buildingSystem.getBuilding(nearBuilding);
      
      // Far building should have lower detail level
      expect(farBuildingObj!.lodLevel).toBeGreaterThan(nearBuildingObj!.lodLevel);
    });
  });

  describe('Event System', () => {
    test('should emit events during building lifecycle', () => {
      const constructionStartListener = jest.fn();
      const constructionCompleteListener = jest.fn();
      
      buildingSystem.addEventListener('constructionStart', constructionStartListener);
      buildingSystem.addEventListener('constructionComplete', constructionCompleteListener);
      
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      
      buildingSystem.startConstruction(buildingId);
      expect(constructionStartListener).toHaveBeenCalledWith({
        buildingId,
        type: BuildingType.HOUSE,
      });
      
      // Complete construction
      const config = mockBuildingConfigs[BuildingType.HOUSE];
      buildingSystem.update(config.buildTime * 1000);
      
      expect(constructionCompleteListener).toHaveBeenCalledWith({
        buildingId,
        type: BuildingType.HOUSE,
      });
    });

    test('should remove event listeners correctly', () => {
      const listener = jest.fn();
      
      buildingSystem.addEventListener('constructionStart', listener);
      buildingSystem.removeEventListener('constructionStart', listener);
      
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      
      buildingSystem.startConstruction(buildingId);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Serialization and Persistence', () => {
    test('should serialize building data', () => {
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(5, 0, 5),
        Math.PI / 4
      );
      
      const serialized = buildingSystem.serializeBuilding(buildingId);
      
      expect(serialized).toEqual({
        id: buildingId,
        type: BuildingType.HOUSE,
        position: { x: 5, y: 0, z: 5 },
        rotation: Math.PI / 4,
        state: BuildingState.PLANNING,
        progress: 0,
        health: 100,
        features: ['door', 'windows', 'roof'],
        capacity: { residents: 4 },
      });
    });

    test('should deserialize and restore building', () => {
      const buildingData = {
        id: 'test-building-123',
        type: BuildingType.FACTORY,
        position: { x: 10, y: 0, z: 10 },
        rotation: Math.PI / 2,
        state: BuildingState.OPERATIONAL,
        progress: 100,
        health: 85,
        features: ['machinery', 'smokestacks'],
        capacity: { workers: 15, production: 40 },
      };
      
      const restoredId = buildingSystem.deserializeBuilding(buildingData);
      
      expect(restoredId).toBe('test-building-123');
      
      const building = buildingSystem.getBuilding(restoredId);
      expect(building).toBeDefined();
      expect(building!.type).toBe(BuildingType.FACTORY);
      expect(building!.health).toBe(85);
      expect(building!.capacity.workers).toBe(15);
    });
  });

  describe('Memory Management and Cleanup', () => {
    test('should dispose resources properly', () => {
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      
      buildingSystem.dispose();
      
      expect(buildingSystem.getAllBuildings()).toHaveLength(0);
    });

    test('should handle memory cleanup for removed buildings', () => {
      const buildingIds = [];
      
      for (let i = 0; i < 10; i++) {
        const id = buildingSystem.createBuilding(
          BuildingType.HOUSE,
          new THREE.Vector3(i * 15, 0, 0)
        );
        buildingIds.push(id);
      }
      
      // Remove half the buildings
      buildingIds.slice(0, 5).forEach(id => {
        buildingSystem.removeBuilding(id);
      });
      
      expect(buildingSystem.getAllBuildings()).toHaveLength(5);
      
      // Check that removed buildings are properly cleaned up
      buildingIds.slice(0, 5).forEach(id => {
        expect(buildingSystem.getBuilding(id)).toBeUndefined();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid building configurations gracefully', () => {
      const invalidConfig = {
        type: 'invalid' as BuildingType,
        dimensions: { width: -1, height: 0, depth: -5 },
        cost: -1000,
      };
      
      expect(() => {
        buildingSystem.validateConfig(invalidConfig as any);
      }).toThrow();
    });

    test('should handle negative resource amounts', () => {
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      
      const negativeResources = { wood: -50, stone: -30 };
      
      const success = buildingSystem.startConstruction(buildingId, negativeResources);
      expect(success).toBe(false);
    });

    test('should handle concurrent operations safely', () => {
      const buildingId = buildingSystem.createBuilding(
        BuildingType.HOUSE,
        new THREE.Vector3(0, 0, 0)
      );
      
      // Try to start construction and demolition simultaneously
      buildingSystem.startConstruction(buildingId);
      
      expect(() => buildingSystem.startDemolition(buildingId)).not.toThrow();
      
      // Should prioritize one operation over the other
      const building = buildingSystem.getBuilding(buildingId);
      expect([
        BuildingState.CONSTRUCTING,
        BuildingState.DEMOLISHING
      ]).toContain(building!.state);
    });
  });
}); 