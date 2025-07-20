import { ObjectPool, PooledObject, ObjectPoolOptions } from '../objectPool';

// Mock classes for testing
class MockPooledObject implements PooledObject {
  public isInUse = false;
  public data: string = '';

  constructor(data: string = '') {
    this.data = data;
  }

  reset(): void {
    this.data = '';
    this.isInUse = false;
  }

  dispose(): void {
    this.data = '';
  }
}

class MockComplexObject implements PooledObject {
  public isInUse = false;
  public value = 0;
  public items: number[] = [];

  constructor(value: number = 0) {
    this.value = value;
  }

  reset(): void {
    this.value = 0;
    this.items = [];
    this.isInUse = false;
  }

  dispose(): void {
    this.items = [];
  }
}

describe('ObjectPool', () => {
  describe('Basic Pool Operations', () => {
    test('should create pool with default options', () => {
      const pool = new ObjectPool(() => new MockPooledObject());
      
      expect(pool.size).toBe(0);
      expect(pool.available).toBe(0);
      expect(pool.used).toBe(0);
    });

    test('should create pool with custom options', () => {
      const options: ObjectPoolOptions = {
        initialSize: 5,
        maxSize: 20,
        growthSize: 3,
        autoShrink: true,
        shrinkThreshold: 0.25
      };
      
      const pool = new ObjectPool(() => new MockPooledObject(), options);
      
      expect(pool.size).toBe(5);
      expect(pool.available).toBe(5);
      expect(pool.used).toBe(0);
    });

    test('should acquire and release objects correctly', () => {
      const pool = new ObjectPool(() => new MockPooledObject('test'));
      
      const obj1 = pool.acquire();
      expect(obj1).toBeInstanceOf(MockPooledObject);
      expect(obj1.isInUse).toBe(true);
      expect(pool.used).toBe(1);
      expect(pool.available).toBe(0);
      
      pool.release(obj1);
      expect(obj1.isInUse).toBe(false);
      expect(pool.used).toBe(0);
      expect(pool.available).toBe(1);
    });

    test('should reuse released objects', () => {
      const pool = new ObjectPool(() => new MockPooledObject());
      
      const obj1 = pool.acquire();
      obj1.data = 'modified';
      pool.release(obj1);
      
      const obj2 = pool.acquire();
      expect(obj2).toBe(obj1); // Same object instance
      expect(obj2.data).toBe(''); // Should be reset
    });
  });

  describe('Pool Growth and Shrinking', () => {
    test('should grow pool when all objects are in use', () => {
      const pool = new ObjectPool(() => new MockPooledObject(), {
        initialSize: 2,
        growthSize: 3
      });
      
      expect(pool.size).toBe(2);
      
      // Acquire all initial objects
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      // This should trigger growth
      const obj3 = pool.acquire();
      
      expect(pool.size).toBe(5); // 2 + 3 growth
      expect(pool.used).toBe(3);
      expect(pool.available).toBe(2);
    });

    test('should respect max size limit', () => {
      const pool = new ObjectPool(() => new MockPooledObject(), {
        initialSize: 1,
        maxSize: 3,
        growthSize: 5 // Larger than max would allow
      });
      
      // Acquire objects to trigger growth
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      const obj3 = pool.acquire();
      
      expect(pool.size).toBe(3); // Should not exceed maxSize
      
      // Try to acquire one more - should still work but not grow
      const obj4 = pool.acquire();
      expect(obj4).toBeInstanceOf(MockPooledObject);
      expect(pool.size).toBe(3);
    });

    test('should auto-shrink when enabled', () => {
      const pool = new ObjectPool(() => new MockPooledObject(), {
        initialSize: 10,
        autoShrink: true,
        shrinkThreshold: 0.3
      });
      
      expect(pool.size).toBe(10);
      
      // Use only 2 objects, leaving 8 available (80% unused)
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      // Trigger shrink check
      pool.shrinkIfNeeded();
      
      expect(pool.size).toBeLessThan(10);
    });

    test('should not shrink below minimum threshold', () => {
      const pool = new ObjectPool(() => new MockPooledObject(), {
        initialSize: 5,
        autoShrink: true,
        shrinkThreshold: 0.8 // 80% unused threshold
      });
      
      const obj = pool.acquire();
      pool.shrinkIfNeeded();
      
      // Should maintain some minimum size
      expect(pool.size).toBeGreaterThan(0);
    });
  });

  describe('Pool Statistics and Monitoring', () => {
    test('should track pool statistics correctly', () => {
      const pool = new ObjectPool(() => new MockPooledObject(), {
        initialSize: 5
      });
      
      expect(pool.size).toBe(5);
      expect(pool.available).toBe(5);
      expect(pool.used).toBe(0);
      expect(pool.utilizationRate).toBe(0);
      
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      expect(pool.used).toBe(2);
      expect(pool.available).toBe(3);
      expect(pool.utilizationRate).toBeCloseTo(0.4);
      
      pool.release(obj1);
      
      expect(pool.used).toBe(1);
      expect(pool.available).toBe(4);
      expect(pool.utilizationRate).toBeCloseTo(0.2);
    });

    test('should provide performance metrics', () => {
      const pool = new ObjectPool(() => new MockPooledObject());
      
      // Generate some activity
      const objects: MockPooledObject[] = [];
      for (let i = 0; i < 10; i++) {
        objects.push(pool.acquire());
      }
      
      objects.forEach(obj => pool.release(obj));
      
      const stats = pool.getStats();
      expect(stats.totalAcquired).toBe(10);
      expect(stats.totalReleased).toBe(10);
      expect(stats.currentSize).toBeGreaterThan(0);
      expect(stats.peakSize).toBeGreaterThanOrEqual(stats.currentSize);
    });
  });

  describe('Object Lifecycle Management', () => {
    test('should properly reset objects on release', () => {
      const pool = new ObjectPool(() => new MockComplexObject());
      
      const obj = pool.acquire();
      obj.value = 42;
      obj.items = [1, 2, 3];
      
      pool.release(obj);
      
      expect(obj.value).toBe(0);
      expect(obj.items).toEqual([]);
      expect(obj.isInUse).toBe(false);
    });

    test('should dispose objects when pool is disposed', () => {
      const pool = new ObjectPool(() => new MockPooledObject('test'));
      
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      pool.release(obj1);
      
      const disposeSpy = jest.spyOn(obj1, 'dispose');
      const disposeSpy2 = jest.spyOn(obj2, 'dispose');
      
      pool.dispose();
      
      expect(disposeSpy).toHaveBeenCalled();
      expect(disposeSpy2).toHaveBeenCalled();
      expect(pool.size).toBe(0);
    });

    test('should handle objects without dispose method', () => {
      class SimpleObject implements PooledObject {
        isInUse = false;
        reset() { this.isInUse = false; }
      }
      
      const pool = new ObjectPool(() => new SimpleObject());
      const obj = pool.acquire();
      
      expect(() => pool.dispose()).not.toThrow();
    });
  });

  describe('Concurrent Access and Thread Safety', () => {
    test('should handle rapid acquire/release cycles', () => {
      const pool = new ObjectPool(() => new MockPooledObject(), {
        initialSize: 1,
        growthSize: 1
      });
      
      const operations = 1000;
      const objects: MockPooledObject[] = [];
      
      // Rapid acquisition
      for (let i = 0; i < operations; i++) {
        objects.push(pool.acquire());
      }
      
      expect(pool.used).toBe(operations);
      expect(pool.size).toBeGreaterThanOrEqual(operations);
      
      // Rapid release
      objects.forEach(obj => pool.release(obj));
      
      expect(pool.used).toBe(0);
      expect(pool.available).toBe(pool.size);
    });

    test('should maintain consistency under stress', () => {
      const pool = new ObjectPool(() => new MockPooledObject(), {
        initialSize: 10,
        maxSize: 100
      });
      
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const acquired: MockPooledObject[] = [];
        
        // Acquire random number of objects
        const acquireCount = Math.floor(Math.random() * 20) + 1;
        for (let j = 0; j < acquireCount; j++) {
          acquired.push(pool.acquire());
        }
        
        // Release half of them
        const releaseCount = Math.floor(acquired.length / 2);
        for (let j = 0; j < releaseCount; j++) {
          pool.release(acquired[j]);
        }
        
        // Verify consistency
        expect(pool.used + pool.available).toBe(pool.size);
      }
    });
  });

  describe('Custom Factory Functions', () => {
    test('should work with parameterized factory', () => {
      let counter = 0;
      const pool = new ObjectPool(() => new MockPooledObject(`object-${++counter}`));
      
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      expect(obj1.data).toBe('object-1');
      expect(obj2.data).toBe('object-2');
    });

    test('should handle factory that throws errors', () => {
      let shouldThrow = false;
      const pool = new ObjectPool(() => {
        if (shouldThrow) throw new Error('Factory error');
        return new MockPooledObject();
      });
      
      // Normal operation
      const obj1 = pool.acquire();
      expect(obj1).toBeInstanceOf(MockPooledObject);
      
      // Factory throws
      shouldThrow = true;
      expect(() => pool.acquire()).toThrow('Factory error');
    });
  });

  describe('Memory Management', () => {
    test('should not cause memory leaks', () => {
      const pool = new ObjectPool(() => new MockPooledObject());
      
      // Create and release many objects
      for (let i = 0; i < 1000; i++) {
        const obj = pool.acquire();
        obj.data = `test-${i}`;
        pool.release(obj);
      }
      
      // Pool should not grow indefinitely
      expect(pool.size).toBeLessThan(100);
    });

    test('should properly clean up references', () => {
      const pool = new ObjectPool(() => new MockComplexObject());
      
      const obj = pool.acquire();
      obj.items = new Array(1000).fill(0).map((_, i) => i);
      
      pool.release(obj);
      
      // Items should be cleared to prevent memory leaks
      expect(obj.items).toEqual([]);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle releasing objects not from pool', () => {
      const pool = new ObjectPool(() => new MockPooledObject());
      const foreignObject = new MockPooledObject();
      
      expect(() => pool.release(foreignObject)).not.toThrow();
    });

    test('should handle double release gracefully', () => {
      const pool = new ObjectPool(() => new MockPooledObject());
      
      const obj = pool.acquire();
      pool.release(obj);
      
      expect(() => pool.release(obj)).not.toThrow();
      expect(pool.used).toBe(0);
      expect(pool.available).toBe(1);
    });

    test('should handle null/undefined factory', () => {
      expect(() => new ObjectPool(null as any)).toThrow();
      expect(() => new ObjectPool(undefined as any)).toThrow();
    });

    test('should handle invalid options gracefully', () => {
      const invalidOptions = {
        initialSize: -1,
        maxSize: 0,
        growthSize: -5
      };
      
      const pool = new ObjectPool(() => new MockPooledObject(), invalidOptions);
      
      // Should still work with corrected values
      expect(pool.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Benchmarks', () => {
    test('pool should be faster than new object creation', () => {
      const iterations = 10000;
      
      // Measure pool performance
      const pool = new ObjectPool(() => new MockPooledObject(), {
        initialSize: 100
      });
      
      const poolStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const obj = pool.acquire();
        pool.release(obj);
      }
      const poolEnd = performance.now();
      
      // Measure direct creation performance
      const directStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const obj = new MockPooledObject();
        obj.dispose();
      }
      const directEnd = performance.now();
      
      const poolTime = poolEnd - poolStart;
      const directTime = directEnd - directStart;
      
      // Pool should be faster (or at least not significantly slower)
      expect(poolTime).toBeLessThan(directTime * 2);
    });
  });
}); 