import * as THREE from 'three';
import { SpatialGrid, SpatialGridOptions } from '../SpatialGrid';

describe('SpatialGrid', () => {
  let spatialGrid: SpatialGrid;

  beforeEach(() => {
    spatialGrid = new SpatialGrid();
  });

  describe('Initialization', () => {
    test('should initialize with default cell size', () => {
      const grid = new SpatialGrid();
      expect(grid.size).toBe(0);
    });

    test('should initialize with custom cell size', () => {
      const options: SpatialGridOptions = { cellSize: 20 };
      const grid = new SpatialGrid(options);
      expect(grid.size).toBe(0);
    });

    test('should initialize with world bounds', () => {
      const options: SpatialGridOptions = {
        cellSize: 15,
        worldBounds: {
          min: new THREE.Vector3(-100, -100, -100),
          max: new THREE.Vector3(100, 100, 100)
        }
      };
      const grid = new SpatialGrid(options);
      expect(grid.size).toBe(0);
    });
  });

  describe('Object Management', () => {
    test('should add object to grid', () => {
      const position = new THREE.Vector3(5, 0, 5);
      spatialGrid.add('obj1', position);
      expect(spatialGrid.size).toBe(1);
    });

    test('should add multiple objects to same cell', () => {
      const position1 = new THREE.Vector3(1, 0, 1);
      const position2 = new THREE.Vector3(2, 0, 2);
      
      spatialGrid.add('obj1', position1);
      spatialGrid.add('obj2', position2);
      
      expect(spatialGrid.size).toBe(2);
    });

    test('should add objects to different cells', () => {
      const position1 = new THREE.Vector3(1, 0, 1);
      const position2 = new THREE.Vector3(20, 0, 20);
      
      spatialGrid.add('obj1', position1);
      spatialGrid.add('obj2', position2);
      
      expect(spatialGrid.size).toBe(2);
    });

    test('should remove object from grid', () => {
      const position = new THREE.Vector3(5, 0, 5);
      spatialGrid.add('obj1', position);
      spatialGrid.remove('obj1');
      expect(spatialGrid.size).toBe(0);
    });

    test('should handle removing non-existent object', () => {
      expect(() => spatialGrid.remove('non-existent')).not.toThrow();
      expect(spatialGrid.size).toBe(0);
    });

    test('should remove object when updating position', () => {
      const oldPosition = new THREE.Vector3(1, 0, 1);
      const newPosition = new THREE.Vector3(20, 0, 20);
      
      spatialGrid.add('obj1', oldPosition);
      spatialGrid.update('obj1', newPosition);
      
      expect(spatialGrid.size).toBe(1);
      
      // Object should be found at new position
      const nearby = spatialGrid.getNearby(newPosition, 5);
      expect(nearby).toContain('obj1');
    });

    test('should not update if position is the same', () => {
      const position = new THREE.Vector3(5, 0, 5);
      spatialGrid.add('obj1', position);
      
      // Update with same position
      spatialGrid.update('obj1', position);
      expect(spatialGrid.size).toBe(1);
    });

    test('should handle updating non-existent object', () => {
      const position = new THREE.Vector3(5, 0, 5);
      expect(() => spatialGrid.update('non-existent', position)).not.toThrow();
      expect(spatialGrid.size).toBe(1); // Object gets added
    });
  });

  describe('Spatial Queries', () => {
    beforeEach(() => {
      // Set up a test scenario with multiple objects
      spatialGrid.add('center', new THREE.Vector3(0, 0, 0));
      spatialGrid.add('near1', new THREE.Vector3(3, 0, 3));
      spatialGrid.add('near2', new THREE.Vector3(-3, 0, -3));
      spatialGrid.add('far1', new THREE.Vector3(50, 0, 50));
      spatialGrid.add('far2', new THREE.Vector3(-50, 0, -50));
    });

    test('should find nearby objects within radius', () => {
      const center = new THREE.Vector3(0, 0, 0);
      const nearby = spatialGrid.getNearby(center, 5);
      
      expect(nearby).toContain('center');
      expect(nearby).toContain('near1');
      expect(nearby).toContain('near2');
      expect(nearby).not.toContain('far1');
      expect(nearby).not.toContain('far2');
    });

    test('should write results into provided output array', () => {
      const center = new THREE.Vector3(0, 0, 0);
      const out: string[] = ['sentinel'];
      const nearby = spatialGrid.getNearby(center, 5, out);

      // Uses the provided array instance and clears it.
      expect(nearby).toBe(out);
      expect(out).not.toContain('sentinel');
      expect(out).toContain('center');
      expect(out).toContain('near1');
      expect(out).toContain('near2');
    });

    test('should find objects in larger radius', () => {
      const center = new THREE.Vector3(0, 0, 0);
      const nearby = spatialGrid.getNearby(center, 100);
      
      expect(nearby).toHaveLength(5);
      expect(nearby).toContain('center');
      expect(nearby).toContain('near1');
      expect(nearby).toContain('near2');
      expect(nearby).toContain('far1');
      expect(nearby).toContain('far2');
    });

    test('should return empty array when no objects in radius', () => {
      const farPosition = new THREE.Vector3(1000, 0, 1000);
      const nearby = spatialGrid.getNearby(farPosition, 10);
      expect(nearby).toHaveLength(0);
    });

    test('should handle exact distance matches', () => {
      spatialGrid.clear();
      spatialGrid.add('exact', new THREE.Vector3(5, 0, 0));
      
      const center = new THREE.Vector3(0, 0, 0);
      const nearby = spatialGrid.getNearby(center, 5);
      expect(nearby).toContain('exact');
    });

    test('should search across multiple cells', () => {
      spatialGrid.clear();
      
      // Add objects in a grid pattern
      for (let x = 0; x < 30; x += 10) {
        for (let z = 0; z < 30; z += 10) {
          spatialGrid.add(`obj_${x}_${z}`, new THREE.Vector3(x, 0, z));
        }
      }
      
      const center = new THREE.Vector3(15, 0, 15);
      const nearby = spatialGrid.getNearby(center, 15);
      
      // Should find objects in neighboring cells
      expect(nearby.length).toBeGreaterThan(1);
    });
  });

  describe('Cell Management', () => {
    test('should handle negative coordinates', () => {
      const negativePos = new THREE.Vector3(-15, 0, -25);
      spatialGrid.add('negative', negativePos);
      
      const nearby = spatialGrid.getNearby(negativePos, 5);
      expect(nearby).toContain('negative');
    });

    test('should handle fractional coordinates', () => {
      const fractionalPos = new THREE.Vector3(5.7, 0, 8.3);
      spatialGrid.add('fractional', fractionalPos);
      
      const nearby = spatialGrid.getNearby(fractionalPos, 1);
      expect(nearby).toContain('fractional');
    });

    test('should clean up empty cells after removing objects', () => {
      const position = new THREE.Vector3(100, 0, 100);
      spatialGrid.add('temp', position);
      spatialGrid.remove('temp');
      
      // Cell should be cleaned up (internal implementation detail)
      const cellsMap = (spatialGrid as any).cells;
      const zigZag = (n: number) => (n >= 0 ? n * 2 : (-n * 2) - 1);
      const pair = (a: number, b: number) => {
        const A = zigZag(a);
        const B = zigZag(b);
        const sum = A + B;
        return (sum * (sum + 1)) / 2 + B;
      };
      const key = pair(10, 10); // floor(100/10)=10 for both x and z
      expect(typeof key).toBe('number');
      expect(cellsMap.has(key)).toBe(false);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large number of objects', () => {
      const objectCount = 1000;
      
      for (let i = 0; i < objectCount; i++) {
        const x = Math.random() * 100 - 50;
        const z = Math.random() * 100 - 50;
        spatialGrid.add(`obj_${i}`, new THREE.Vector3(x, 0, z));
      }
      
      expect(spatialGrid.size).toBe(objectCount);
      
      // Query should still be fast
      const center = new THREE.Vector3(0, 0, 0);
      const nearby = spatialGrid.getNearby(center, 10);
      expect(Array.isArray(nearby)).toBe(true);
    });

    test('should handle objects at exact cell boundaries', () => {
      const cellSize = 10;
      const grid = new SpatialGrid({ cellSize });
      
      // Place objects at cell boundaries
      grid.add('boundary1', new THREE.Vector3(10, 0, 10));
      grid.add('boundary2', new THREE.Vector3(20, 0, 20));
      
      const nearby = grid.getNearby(new THREE.Vector3(15, 0, 15), 8);
      expect(nearby).toContain('boundary1');
      expect(nearby).toContain('boundary2');
    });

    test('should handle very small radius searches', () => {
      spatialGrid.add('close', new THREE.Vector3(0.1, 0, 0.1));
      
      const nearby = spatialGrid.getNearby(new THREE.Vector3(0, 0, 0), 0.05);
      expect(nearby).toHaveLength(0);
      
      const nearbyLarger = spatialGrid.getNearby(new THREE.Vector3(0, 0, 0), 0.2);
      expect(nearbyLarger).toContain('close');
    });

    test('should handle zero radius searches', () => {
      spatialGrid.add('exact', new THREE.Vector3(0, 0, 0));
      
      const nearby = spatialGrid.getNearby(new THREE.Vector3(0, 0, 0), 0);
      expect(nearby).toContain('exact');
    });

    test('should handle duplicate object IDs by overwriting', () => {
      spatialGrid.add('duplicate', new THREE.Vector3(0, 0, 0));
      spatialGrid.add('duplicate', new THREE.Vector3(10, 0, 10));
      
      expect(spatialGrid.size).toBe(1);
      
      // Should find object at new position
      const nearby = spatialGrid.getNearby(new THREE.Vector3(10, 0, 10), 1);
      expect(nearby).toContain('duplicate');
      
      // Should not find object at old position
      const oldNearby = spatialGrid.getNearby(new THREE.Vector3(0, 0, 0), 1);
      expect(oldNearby).not.toContain('duplicate');
    });
  });

  describe('Clear and Reset', () => {
    test('should clear all objects and cells', () => {
      spatialGrid.add('obj1', new THREE.Vector3(0, 0, 0));
      spatialGrid.add('obj2', new THREE.Vector3(10, 0, 10));
      spatialGrid.add('obj3', new THREE.Vector3(20, 0, 20));
      
      expect(spatialGrid.size).toBe(3);
      
      spatialGrid.clear();
      
      expect(spatialGrid.size).toBe(0);
      
      // No objects should be found
      const nearby = spatialGrid.getNearby(new THREE.Vector3(0, 0, 0), 100);
      expect(nearby).toHaveLength(0);
    });

    test('should be able to add objects after clearing', () => {
      spatialGrid.add('obj1', new THREE.Vector3(0, 0, 0));
      spatialGrid.clear();
      spatialGrid.add('obj2', new THREE.Vector3(5, 0, 5));
      
      expect(spatialGrid.size).toBe(1);
      
      const nearby = spatialGrid.getNearby(new THREE.Vector3(5, 0, 5), 1);
      expect(nearby).toContain('obj2');
    });
  });

  describe('Custom Cell Sizes', () => {
    test('should work with different cell sizes', () => {
      const smallGrid = new SpatialGrid({ cellSize: 5 });
      const largeGrid = new SpatialGrid({ cellSize: 50 });
      
      const position = new THREE.Vector3(10, 0, 10);
      
      smallGrid.add('obj', position);
      largeGrid.add('obj', position);
      
      expect(smallGrid.size).toBe(1);
      expect(largeGrid.size).toBe(1);
      
      // Both should find the object
      const nearbySmall = smallGrid.getNearby(position, 1);
      const nearbyLarge = largeGrid.getNearby(position, 1);
      
      expect(nearbySmall).toContain('obj');
      expect(nearbyLarge).toContain('obj');
    });

    test('should handle very small cell sizes', () => {
      const microGrid = new SpatialGrid({ cellSize: 0.1 });
      
      microGrid.add('obj1', new THREE.Vector3(0.05, 0, 0.05));
      microGrid.add('obj2', new THREE.Vector3(0.15, 0, 0.15));
      
      const nearby = microGrid.getNearby(new THREE.Vector3(0.1, 0, 0.1), 0.08);
      expect(nearby).toContain('obj1');
      expect(nearby).toContain('obj2');
    });

    test('should handle very large cell sizes', () => {
      const macroGrid = new SpatialGrid({ cellSize: 1000 });
      
      macroGrid.add('obj1', new THREE.Vector3(100, 0, 100));
      macroGrid.add('obj2', new THREE.Vector3(200, 0, 200));
      
      // Both should be in the same cell
      const nearby = macroGrid.getNearby(new THREE.Vector3(150, 0, 150), 100);
      expect(nearby).toContain('obj1');
      expect(nearby).toContain('obj2');
    });
  });
}); 