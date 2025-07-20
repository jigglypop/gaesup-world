import * as THREE from 'three';
import { WorldSystem, WorldObject, RideableObject, InteractionEvent } from '../WorldSystem';
import { SystemContext } from '@core/boilerplate/entity/BaseSystem';

// Mock SpatialGrid
jest.mock('../SpatialGrid', () => ({
  SpatialGrid: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    getNearby: jest.fn().mockReturnValue([]),
    clear: jest.fn(),
  }))
}));

describe('WorldSystem', () => {
  let worldSystem: WorldSystem;
  let mockContext: SystemContext;

  beforeEach(() => {
    worldSystem = new WorldSystem();
    mockContext = {
      deltaTime: 16.67,
      totalTime: 1000,
      frameCount: 60
    };
    jest.clearAllMocks();
  });

  afterEach(() => {
    worldSystem.dispose();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await worldSystem.init();
      expect(consoleSpy).toHaveBeenCalledWith('[WorldSystem] Initialized');
      consoleSpy.mockRestore();
    });

    test('should handle update calls', () => {
      expect(() => worldSystem.update(mockContext)).not.toThrow();
    });

    test('should dispose without errors', () => {
      expect(() => worldSystem.dispose()).not.toThrow();
    });
  });

  describe('Object Management', () => {
    test('should add object successfully', () => {
      const object: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active'
      };

      worldSystem.addObject(object);
      const retrieved = worldSystem.getObject('test-1');
      expect(retrieved).toEqual(object);
    });

    test('should remove object successfully', () => {
      const object: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'static'
      };

      worldSystem.addObject(object);
      const removed = worldSystem.removeObject('test-1');
      expect(removed).toBe(true);
      expect(worldSystem.getObject('test-1')).toBeUndefined();
    });

    test('should return false when removing non-existent object', () => {
      const removed = worldSystem.removeObject('non-existent');
      expect(removed).toBe(false);
    });

    test('should update object successfully', () => {
      const object: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active'
      };

      worldSystem.addObject(object);
      const newPosition = new THREE.Vector3(5, 6, 7);
      const updated = worldSystem.updateObject('test-1', { position: newPosition });
      
      expect(updated).toBe(true);
      const retrieved = worldSystem.getObject('test-1');
      expect(retrieved?.position).toEqual(newPosition);
    });

    test('should return false when updating non-existent object', () => {
      const updated = worldSystem.updateObject('non-existent', { position: new THREE.Vector3() });
      expect(updated).toBe(false);
    });

    test('should get all objects', () => {
      const object1: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active'
      };

      const object2: WorldObject = {
        id: 'test-2',
        position: new THREE.Vector3(4, 5, 6),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'passive'
      };

      worldSystem.addObject(object1);
      worldSystem.addObject(object2);

      const allObjects = worldSystem.getAllObjects();
      expect(allObjects).toHaveLength(2);
      expect(allObjects).toContain(object1);
      expect(allObjects).toContain(object2);
    });

    test('should get objects by type', () => {
      const activeObject: WorldObject = {
        id: 'active-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active'
      };

      const staticObject: WorldObject = {
        id: 'static-1',
        position: new THREE.Vector3(4, 5, 6),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'static'
      };

      worldSystem.addObject(activeObject);
      worldSystem.addObject(staticObject);

      const activeObjects = worldSystem.getObjectsByType('active');
      expect(activeObjects).toHaveLength(1);
      expect(activeObjects[0]).toEqual(activeObject);
    });
  });

  describe('Spatial Queries', () => {
    test('should get objects in radius', () => {
      const object: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active'
      };

      worldSystem.addObject(object);
      
      // Mock spatial grid to return the object ID
      const mockSpatial = (worldSystem as any).spatial;
      mockSpatial.getNearby.mockReturnValue(['test-1']);

      const center = new THREE.Vector3(0, 0, 0);
      const objects = worldSystem.getObjectsInRadius(center, 10);
      
      expect(objects).toHaveLength(1);
      expect(objects[0]).toEqual(object);
    });

    test('should check collisions', () => {
      const box1 = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
      const box2 = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2));

      const object1: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active',
        boundingBox: box1
      };

      const object2: WorldObject = {
        id: 'test-2',
        position: new THREE.Vector3(1, 1, 1),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'passive',
        boundingBox: box2
      };

      worldSystem.addObject(object1);
      worldSystem.addObject(object2);

      // Mock spatial grid to return both object IDs
      const mockSpatial = (worldSystem as any).spatial;
      mockSpatial.getNearby.mockReturnValue(['test-1', 'test-2']);

      const collisions = worldSystem.checkCollisions('test-1');
      expect(collisions).toHaveLength(1);
      expect(collisions[0]).toEqual(object2);
    });

    test('should handle collision check for object without bounding box', () => {
      const object: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active'
      };

      worldSystem.addObject(object);
      const collisions = worldSystem.checkCollisions('test-1');
      expect(collisions).toHaveLength(0);
    });
  });

  describe('Interaction Events', () => {
    test('should process interaction events', () => {
      const event: InteractionEvent = {
        type: 'collision',
        object1Id: 'obj1',
        object2Id: 'obj2',
        timestamp: Date.now(),
        data: { force: 10 }
      };

      worldSystem.processInteraction(event);
      const recentEvents = worldSystem.getRecentEvents();
      expect(recentEvents).toContain(event);
    });

    test('should limit event history to prevent memory leaks', () => {
      // Add 1001 events to trigger cleanup
      for (let i = 0; i < 1001; i++) {
        const event: InteractionEvent = {
          type: 'collision',
          object1Id: `obj${i}`,
          timestamp: Date.now(),
        };
        worldSystem.processInteraction(event);
      }

      const events = (worldSystem as any).interactionEvents;
      expect(events.length).toBe(500);
    });

    test('should filter events by time window', () => {
      const oldEvent: InteractionEvent = {
        type: 'collision',
        object1Id: 'obj1',
        timestamp: Date.now() - 2000, // 2 seconds ago
      };

      const recentEvent: InteractionEvent = {
        type: 'collision',
        object1Id: 'obj2',
        timestamp: Date.now(),
      };

      worldSystem.processInteraction(oldEvent);
      worldSystem.processInteraction(recentEvent);

      const recentEvents = worldSystem.getRecentEvents(1000); // 1 second window
      expect(recentEvents).toHaveLength(1);
      expect(recentEvents[0]).toEqual(recentEvent);
    });
  });

  describe('Raycasting', () => {
    test('should perform raycast successfully', () => {
      const boundingBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
      const object: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active',
        boundingBox
      };

      worldSystem.addObject(object);

      // Mock spatial grid
      const mockSpatial = (worldSystem as any).spatial;
      mockSpatial.getNearby.mockReturnValue(['test-1']);

      const origin = new THREE.Vector3(-5, 0, 0);
      const direction = new THREE.Vector3(1, 0, 0);
      const result = worldSystem.raycast(origin, direction, 10);

      expect(result).not.toBeNull();
      expect(result!.object).toEqual(object);
      expect(result!.distance).toBeGreaterThan(0);
      expect(result!.point).toBeInstanceOf(THREE.Vector3);
    });

    test('should return null for raycast with no hits', () => {
      const origin = new THREE.Vector3(-5, 0, 0);
      const direction = new THREE.Vector3(1, 0, 0);
      
      // Mock spatial grid to return no objects
      const mockSpatial = (worldSystem as any).spatial;
      mockSpatial.getNearby.mockReturnValue([]);

      const result = worldSystem.raycast(origin, direction, 10);
      expect(result).toBeNull();
    });
  });

  describe('Cleanup', () => {
    test('should cleanup all data', () => {
      const object: WorldObject = {
        id: 'test-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active'
      };

      const event: InteractionEvent = {
        type: 'collision',
        object1Id: 'obj1',
        timestamp: Date.now(),
      };

      worldSystem.addObject(object);
      worldSystem.processInteraction(event);

      worldSystem.cleanup();

      expect(worldSystem.getAllObjects()).toHaveLength(0);
      expect(worldSystem.getRecentEvents()).toHaveLength(0);
    });
  });

  describe('RideableObject specific functionality', () => {
    test('should handle rideable objects', () => {
      const rideableObject: RideableObject = {
        id: 'rideable-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'rideable',
        maxSpeed: 50,
        acceleration: 10,
        isOccupied: false,
        controls: {
          forward: false,
          backward: false,
          left: false,
          right: false
        }
      };

      worldSystem.addObject(rideableObject);
      const retrieved = worldSystem.getObject('rideable-1') as RideableObject;
      
      expect(retrieved.type).toBe('rideable');
      expect(retrieved.maxSpeed).toBe(50);
      expect(retrieved.isOccupied).toBe(false);
    });

    test('should get rideable objects by type', () => {
      const rideableObject: RideableObject = {
        id: 'rideable-1',
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'rideable',
        maxSpeed: 50,
        acceleration: 10,
        isOccupied: false,
        controls: {
          forward: false,
          backward: false,
          left: false,
          right: false
        }
      };

      const staticObject: WorldObject = {
        id: 'static-1',
        position: new THREE.Vector3(4, 5, 6),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'static'
      };

      worldSystem.addObject(rideableObject);
      worldSystem.addObject(staticObject);

      const rideableObjects = worldSystem.getObjectsByType('rideable');
      expect(rideableObjects).toHaveLength(1);
      expect(rideableObjects[0]).toEqual(rideableObject);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully', () => {
      // Test with invalid object data
      expect(() => {
        const invalidObject = {} as WorldObject;
        worldSystem.addObject(invalidObject);
      }).not.toThrow();
    });

    test('should handle spatial grid errors', () => {
      const mockSpatial = (worldSystem as any).spatial;
      mockSpatial.getNearby.mockImplementation(() => {
        throw new Error('Spatial grid error');
      });

      expect(() => {
        worldSystem.getObjectsInRadius(new THREE.Vector3(), 10);
      }).toThrow();
    });
  });
}); 