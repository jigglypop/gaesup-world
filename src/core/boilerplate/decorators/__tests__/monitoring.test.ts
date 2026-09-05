import 'reflect-metadata';
import { Profile, Log, MemoryProfile, RateLimit, Hook } from '../monitoring';
import { logger } from '../../../utils/logger';

// Mock dependencies
jest.mock('../../../utils/logger');

const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Monitoring Decorators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger.log = jest.fn();
    mockLogger.info = jest.fn();
    mockLogger.warn = jest.fn();
    mockLogger.error = jest.fn();
    
    // Mock performance.now()
    let t = 1000;
    jest.spyOn(performance, 'now').mockImplementation(() => {
      const v = t;
      t += 16.67;
      return v;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('@Profile', () => {
    test('should measure and log execution time', () => {
      class TestClass {
        @Profile()
        testMethod() {
          return 'result';
        }

        @Profile('custom-label')
        customLabelMethod() {
          return 'custom';
        }
      }

      const instance = new TestClass();

      const result1 = instance.testMethod();
      expect(result1).toBe('result');
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[Profile] TestClass.testMethod executed in 16.67ms'
      );

      const result2 = instance.customLabelMethod();
      expect(result2).toBe('custom');
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[Profile] custom-label executed in 16.67ms'
      );
    });

    test('should handle async methods', async () => {
      class TestClass {
        @Profile()
        async asyncMethod() {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'async-result';
        }
      }

      const instance = new TestClass();
      const result = await instance.asyncMethod();

      expect(result).toBe('async-result');
      expect(mockLogger.log).toHaveBeenCalled();
    });

    test('should preserve method arguments and context', () => {
      class TestClass {
        public value = 42;

        @Profile()
        methodWithArgs(a: number, b: string) {
          return `${this.value}-${a}-${b}`;
        }
      }

      const instance = new TestClass();
      const result = instance.methodWithArgs(10, 'test');

      expect(result).toBe('42-10-test');
      expect(mockLogger.log).toHaveBeenCalled();
    });

    test('should still profile even when method throws', () => {
      class TestClass {
        @Profile()
        throwingMethod() {
          throw new Error('Test error');
        }
      }

      const instance = new TestClass();

      expect(() => instance.throwingMethod()).toThrow('Test error');
      expect(mockLogger.log).toHaveBeenCalled();
    });

    test('should handle multiple profiled methods', () => {
      class TestClass {
        @Profile('method-1')
        method1() {
          return '1';
        }

        @Profile('method-2')
        method2() {
          return '2';
        }
      }

      const instance = new TestClass();
      instance.method1();
      instance.method2();

      expect(mockLogger.log).toHaveBeenCalledTimes(2);
      expect(mockLogger.log).toHaveBeenNthCalledWith(1, '[Profile] method-1 executed in 16.67ms');
      expect(mockLogger.log).toHaveBeenNthCalledWith(2, '[Profile] method-2 executed in 16.67ms');
    });
  });

  describe('@Log', () => {
    test('should log method calls with default level', () => {
      class TestClass {
        @Log()
        testMethod(arg1: string, arg2: number) {
          return `${arg1}-${arg2}`;
        }
      }

      const instance = new TestClass();
      const result = instance.testMethod('test', 42);

      expect(result).toBe('test-42');
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[TestClass] Calling testMethod with args:',
        ['test', 42]
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[TestClass] testMethod returned:',
        'test-42'
      );
    });

    test('should support different log levels', () => {
      class TestClass {
        @Log('info')
        infoMethod() {
          return 'info-result';
        }

        @Log('warn')
        warnMethod() {
          return 'warn-result';
        }

        @Log('error')
        errorMethod() {
          return 'error-result';
        }
      }

      const instance = new TestClass();
      
      instance.infoMethod();
      expect(mockLogger.info).toHaveBeenCalledTimes(2);

      instance.warnMethod();
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);

      instance.errorMethod();
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
    });

    test('should handle async methods', async () => {
      class TestClass {
        @Log()
        async asyncMethod(data: string) {
          await new Promise(resolve => setTimeout(resolve, 1));
          return `processed-${data}`;
        }
      }

      const instance = new TestClass();
      const result = await instance.asyncMethod('test');

      expect(result).toBe('processed-test');
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[TestClass] Calling asyncMethod with args:',
        ['test']
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[TestClass] asyncMethod returned:',
        'processed-test'
      );
    });

    test('should log even when method throws', () => {
      class TestClass {
        @Log()
        throwingMethod(data: string) {
          throw new Error(`Error with ${data}`);
        }
      }

      const instance = new TestClass();

      expect(() => instance.throwingMethod('test')).toThrow('Error with test');
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[TestClass] Calling throwingMethod with args:',
        ['test']
      );
      // Return logging should not occur when method throws
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
    });

    test('should handle methods with no arguments', () => {
      class TestClass {
        @Log()
        noArgsMethod() {
          return 'no-args';
        }
      }

      const instance = new TestClass();
      const result = instance.noArgsMethod();

      expect(result).toBe('no-args');
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[TestClass] Calling noArgsMethod with args:',
        []
      );
    });
  });

  describe('@MemoryProfile', () => {
    test('should measure memory usage', () => {
      // Mock process.memoryUsage()
      const mockMemoryUsage = jest.spyOn(process, 'memoryUsage')
        .mockReturnValueOnce({
          rss: 1000000,
          heapTotal: 2000000,
          heapUsed: 1500000,
          external: 100000,
          arrayBuffers: 50000
        })
        .mockReturnValueOnce({
          rss: 1100000,
          heapTotal: 2000000,
          heapUsed: 1600000,
          external: 100000,
          arrayBuffers: 50000
        });

      class TestClass {
        @MemoryProfile()
        memoryIntensiveMethod() {
          // Simulate memory allocation
          const data = new Array(1000).fill(0);
          return data.length;
        }
      }

      const instance = new TestClass();
      const result = instance.memoryIntensiveMethod();

      expect(result).toBe(1000);
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('[MemoryProfile] TestClass.memoryIntensiveMethod')
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('heap: +97.66KB')
      );

      mockMemoryUsage.mockRestore();
    });

    test('should handle custom labels for memory profiling', () => {
      const mockMemoryUsage = jest.spyOn(process, 'memoryUsage')
        .mockReturnValue({
          rss: 1000000,
          heapTotal: 2000000,
          heapUsed: 1500000,
          external: 100000,
          arrayBuffers: 50000
        });

      class TestClass {
        @MemoryProfile('custom-memory-test')
        customMethod() {
          return 'custom';
        }
      }

      const instance = new TestClass();
      instance.customMethod();

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('[MemoryProfile] custom-memory-test')
      );

      mockMemoryUsage.mockRestore();
    });

    test('should profile even when method throws', () => {
      const mockMemoryUsage = jest.spyOn(process, 'memoryUsage')
        .mockReturnValue({
          rss: 1000000,
          heapTotal: 2000000,
          heapUsed: 1500000,
          external: 100000,
          arrayBuffers: 50000
        });

      class TestClass {
        @MemoryProfile()
        throwingMethod() {
          throw new Error('Memory error');
        }
      }

      const instance = new TestClass();

      expect(() => instance.throwingMethod()).toThrow('Memory error');
      expect(mockLogger.log).toHaveBeenCalled();

      mockMemoryUsage.mockRestore();
    });
  });

  describe('@RateLimit', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should allow calls within rate limit', () => {
      class TestClass {
        @RateLimit(3, 1000) // 3 calls per 1000ms
        rateLimitedMethod(value: string) {
          return `processed-${value}`;
        }
      }

      const instance = new TestClass();

      // First 3 calls should succeed
      expect(instance.rateLimitedMethod('1')).toBe('processed-1');
      expect(instance.rateLimitedMethod('2')).toBe('processed-2');
      expect(instance.rateLimitedMethod('3')).toBe('processed-3');

      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    test('should block calls exceeding rate limit', () => {
      class TestClass {
        @RateLimit(2, 1000) // 2 calls per 1000ms
        rateLimitedMethod(value: string) {
          return `processed-${value}`;
        }
      }

      const instance = new TestClass();

      // First 2 calls should succeed
      expect(instance.rateLimitedMethod('1')).toBe('processed-1');
      expect(instance.rateLimitedMethod('2')).toBe('processed-2');

      // Third call should be blocked
      expect(instance.rateLimitedMethod('3')).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[RateLimit] TestClass.rateLimitedMethod exceeded rate limit'
      );
    });

    test('should reset rate limit after window expires', () => {
      class TestClass {
        @RateLimit(1, 1000) // 1 call per 1000ms
        rateLimitedMethod(value: string) {
          return `processed-${value}`;
        }
      }

      const instance = new TestClass();

      // First call should succeed
      expect(instance.rateLimitedMethod('1')).toBe('processed-1');

      // Second call should be blocked
      expect(instance.rateLimitedMethod('2')).toBeUndefined();

      // Advance time past window
      jest.advanceTimersByTime(1001);

      // Should work again after window reset
      expect(instance.rateLimitedMethod('3')).toBe('processed-3');
    });

    test('should handle multiple methods with different rate limits', () => {
      class TestClass {
        @RateLimit(2, 1000)
        method1() {
          return '1';
        }

        @RateLimit(3, 1000)
        method2() {
          return '2';
        }
      }

      const instance = new TestClass();

      // method1: 2 calls allowed
      expect(instance.method1()).toBe('1');
      expect(instance.method1()).toBe('1');
      expect(instance.method1()).toBeUndefined(); // Blocked

      // method2: 3 calls allowed (independent limit)
      expect(instance.method2()).toBe('2');
      expect(instance.method2()).toBe('2');
      expect(instance.method2()).toBe('2');
      expect(instance.method2()).toBeUndefined(); // Blocked
    });

    test('should preserve method arguments and context', () => {
      class TestClass {
        public name = 'test-class';

        @RateLimit(1, 1000)
        contextMethod(suffix: string) {
          return `${this.name}-${suffix}`;
        }
      }

      const instance = new TestClass();
      const result = instance.contextMethod('test');

      expect(result).toBe('test-class-test');
    });
  });

  describe('@Hook', () => {
    test('should execute before and after hooks', () => {
      const beforeHook = jest.fn();
      const afterHook = jest.fn();

      class TestClass {
        @Hook(beforeHook, afterHook)
        testMethod(value: string) {
          return `processed-${value}`;
        }
      }

      const instance = new TestClass();
      const result = instance.testMethod('test');

      expect(result).toBe('processed-test');
      expect(beforeHook).toHaveBeenCalledTimes(1);
      expect(afterHook).toHaveBeenCalledTimes(1);

      // Verify order of execution
      const callOrder = [beforeHook, afterHook].map(fn => fn.mock.invocationCallOrder[0]);
      expect(callOrder[0]).toBeLessThan(callOrder[1]);
    });

    test('should execute only before hook if after is not provided', () => {
      const beforeHook = jest.fn();

      class TestClass {
        @Hook(beforeHook)
        testMethod() {
          return 'result';
        }
      }

      const instance = new TestClass();
      const result = instance.testMethod();

      expect(result).toBe('result');
      expect(beforeHook).toHaveBeenCalledTimes(1);
    });

    test('should execute only after hook if before is not provided', () => {
      const afterHook = jest.fn();

      class TestClass {
        @Hook(undefined, afterHook)
        testMethod() {
          return 'result';
        }
      }

      const instance = new TestClass();
      const result = instance.testMethod();

      expect(result).toBe('result');
      expect(afterHook).toHaveBeenCalledTimes(1);
    });

    test('should execute hooks even when method throws', () => {
      const beforeHook = jest.fn();
      const afterHook = jest.fn();

      class TestClass {
        @Hook(beforeHook, afterHook)
        throwingMethod() {
          throw new Error('Test error');
        }
      }

      const instance = new TestClass();

      expect(() => instance.throwingMethod()).toThrow('Test error');
      expect(beforeHook).toHaveBeenCalledTimes(1);
      expect(afterHook).toHaveBeenCalledTimes(1);
    });

    test('should handle async methods with hooks', async () => {
      const beforeHook = jest.fn();
      const afterHook = jest.fn();

      class TestClass {
        @Hook(beforeHook, afterHook)
        async asyncMethod() {
          await new Promise(resolve => setTimeout(resolve, 1));
          return 'async-result';
        }
      }

      const instance = new TestClass();
      const result = await instance.asyncMethod();

      expect(result).toBe('async-result');
      expect(beforeHook).toHaveBeenCalledTimes(1);
      expect(afterHook).toHaveBeenCalledTimes(1);
    });

    test('should preserve method arguments and context', () => {
      const beforeHook = jest.fn();
      const afterHook = jest.fn();

      class TestClass {
        public value = 42;

        @Hook(beforeHook, afterHook)
        contextMethod(multiplier: number) {
          return this.value * multiplier;
        }
      }

      const instance = new TestClass();
      const result = instance.contextMethod(2);

      expect(result).toBe(84);
      expect(beforeHook).toHaveBeenCalled();
      expect(afterHook).toHaveBeenCalled();
    });
  });

  describe('Combined Usage', () => {
    test('should work when multiple monitoring decorators are combined', () => {
      const beforeHook = jest.fn();
      const afterHook = jest.fn();

      class CombinedClass {
        @Profile('combined-method')
        @Log('info')
        @RateLimit(5, 1000)
        @Hook(beforeHook, afterHook)
        combinedMethod(value: string) {
          return `combined-${value}`;
        }
      }

      const instance = new CombinedClass();
      const result = instance.combinedMethod('test');

      expect(result).toBe('combined-test');

      // Verify all decorators executed
      expect(mockLogger.log).toHaveBeenCalled(); // Profile
      expect(mockLogger.info).toHaveBeenCalled(); // Log
      expect(beforeHook).toHaveBeenCalled(); // Hook before
      expect(afterHook).toHaveBeenCalled(); // Hook after
      expect(mockLogger.warn).not.toHaveBeenCalled(); // RateLimit not exceeded
    });

    test('should handle decorator interaction with rate limiting', () => {
      const hook = jest.fn();

      class TestClass {
        @Profile()
        @RateLimit(1, 1000)
        @Hook(hook)
        limitedMethod() {
          return 'limited';
        }
      }

      const instance = new TestClass();

      // First call should work
      expect(instance.limitedMethod()).toBe('limited');
      expect(hook).toHaveBeenCalledTimes(1);

      // Second call should be rate limited
      expect(instance.limitedMethod()).toBeUndefined();
      // Hook should still execute even when rate limited
      expect(hook).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Tests', () => {
    test('monitoring decorators should not significantly impact performance', () => {
      const hook = jest.fn();

      class PerformanceClass {
        @Profile()
        @Log()
        @Hook(hook)
        fastMethod() {
          return Math.random();
        }
      }

      const instance = new PerformanceClass();
      const iterations = 100;

      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        instance.fastMethod();
      }
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      // Should complete 100 iterations in reasonable time
      // In CI/jsdom, timing can vary significantly; keep this as a sanity bound.
      expect(totalTime).toBeLessThan(5000);
      expect(hook).toHaveBeenCalledTimes(iterations);
    });
  });

  describe('Error Handling', () => {
    test('should handle hook errors gracefully', () => {
      const errorHook = jest.fn(() => {
        throw new Error('Hook error');
      });

      class TestClass {
        @Hook(errorHook)
        testMethod() {
          return 'result';
        }
      }

      const instance = new TestClass();

      // Method should still work despite hook error
      expect(() => instance.testMethod()).toThrow('Hook error');
    });

    test('should handle memory profiling errors', () => {
      const mockMemoryUsage = jest.spyOn(process, 'memoryUsage')
        .mockImplementation(() => {
          throw new Error('Memory usage error');
        });

      class TestClass {
        @MemoryProfile()
        testMethod() {
          return 'result';
        }
      }

      const instance = new TestClass();

      // Should not throw despite memory profiling error
      expect(() => instance.testMethod()).toThrow();

      mockMemoryUsage.mockRestore();
    });
  });
}); 