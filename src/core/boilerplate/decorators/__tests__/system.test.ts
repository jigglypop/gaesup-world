import 'reflect-metadata';
import { HandleError, RegisterSystem } from '../system';
import { SystemRegistry } from '../../entity/SystemRegistry';
import { logger } from '../../../utils/logger';

// Mock dependencies
jest.mock('../../entity/SystemRegistry');
jest.mock('../../../utils/logger');

const mockSystemRegistry = SystemRegistry as jest.Mocked<typeof SystemRegistry>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('System Decorators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSystemRegistry.register = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.info = jest.fn();
  });

  describe('@HandleError', () => {
    test('should catch and handle errors in decorated methods', () => {
      class TestSystem {
        @HandleError()
        methodThatThrows() {
          throw new Error('Test error');
        }

        @HandleError('default-value')
        methodWithDefaultReturn() {
          throw new Error('Test error');
        }

        @HandleError()
        methodThatWorks() {
          return 'success';
        }
      }

      const instance = new TestSystem();

      // Test error handling without default return
      const result1 = instance.methodThatThrows();
      expect(result1).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[TestSystem] Error in methodThatThrows:',
        expect.any(Error)
      );

      // Test error handling with default return
      const result2 = instance.methodWithDefaultReturn();
      expect(result2).toBe('default-value');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[TestSystem] Error in methodWithDefaultReturn:',
        expect.any(Error)
      );

      // Test normal operation
      const result3 = instance.methodThatWorks();
      expect(result3).toBe('success');
    });

    test('should preserve method arguments and context', () => {
      class TestSystem {
        public value = 42;

        @HandleError()
        methodWithArgs(a: number, b: string): string {
          return `${this.value}-${a}-${b}`;
        }

        @HandleError()
        methodThatThrowsWithArgs(a: number, b: string): string {
          throw new Error(`Error with ${a} and ${b}`);
        }
      }

      const instance = new TestSystem();

      // Test successful method with args
      const result1 = instance.methodWithArgs(10, 'test');
      expect(result1).toBe('42-10-test');

      // Test error method with args
      const result2 = instance.methodThatThrowsWithArgs(20, 'error');
      expect(result2).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[TestSystem] Error in methodThatThrowsWithArgs:',
        expect.objectContaining({
          message: 'Error with 20 and error'
        })
      );
    });

    test('should handle async methods correctly', async () => {
      class TestSystem {
        @HandleError()
        async asyncMethodThatThrows() {
          throw new Error('Async error');
        }

        @HandleError('async-default')
        async asyncMethodWithDefault() {
          throw new Error('Async error with default');
        }

        @HandleError()
        async asyncMethodThatWorks() {
          return 'async-success';
        }
      }

      const instance = new TestSystem();

      // Test async error handling
      const result1 = await instance.asyncMethodThatThrows();
      expect(result1).toBeUndefined();

      const result2 = await instance.asyncMethodWithDefault();
      expect(result2).toBe('async-default');

      const result3 = await instance.asyncMethodThatWorks();
      expect(result3).toBe('async-success');
    });

    test('should handle different error types', () => {
      class TestSystem {
        @HandleError()
        throwTypeError() {
          throw new TypeError('Type error');
        }

        @HandleError()
        throwCustomError() {
          throw { message: 'Custom error object' };
        }

        @HandleError()
        throwString() {
          throw 'String error';
        }
      }

      const instance = new TestSystem();

      instance.throwTypeError();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[TestSystem] Error in throwTypeError:',
        expect.any(TypeError)
      );

      instance.throwCustomError();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[TestSystem] Error in throwCustomError:',
        { message: 'Custom error object' }
      );

      instance.throwString();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[TestSystem] Error in throwString:',
        'String error'
      );
    });

    test('should not affect performance significantly', () => {
      class TestSystem {
        @HandleError()
        fastMethod() {
          return Math.random();
        }
      }

      const instance = new TestSystem();
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        instance.fastMethod();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete 1000 iterations in reasonable time (less than 100ms)
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('@RegisterSystem', () => {
    test('should register system on instantiation', () => {
      @RegisterSystem('test-system')
      class TestSystem {
        public name = 'test';
      }

      const instance = new TestSystem();

      expect(mockSystemRegistry.register).toHaveBeenCalledWith('test-system', instance);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[TestSystem] Registered as test-system system'
      );
    });

    test('should preserve original class name and functionality', () => {
      @RegisterSystem('advanced-system')
      class AdvancedSystem {
        public value = 42;

        getValue() {
          return this.value;
        }
      }

      const instance = new AdvancedSystem();

      expect(instance.constructor.name).toBe('AdvancedSystem');
      expect(instance.getValue()).toBe(42);
      expect(instance.value).toBe(42);
    });

    test('should handle constructor arguments', () => {
      @RegisterSystem('param-system')
      class ParameterizedSystem {
        constructor(public name: string, public value: number) {}

        getInfo() {
          return `${this.name}: ${this.value}`;
        }
      }

      const instance = new ParameterizedSystem('test', 100);

      expect(instance.name).toBe('test');
      expect(instance.value).toBe(100);
      expect(instance.getInfo()).toBe('test: 100');
      expect(mockSystemRegistry.register).toHaveBeenCalledWith('param-system', instance);
    });

    test('should work with inheritance', () => {
      class BaseSystem {
        protected baseValue = 'base';
      }

      @RegisterSystem('inherited-system')
      class InheritedSystem extends BaseSystem {
        public derivedValue = 'derived';

        getValues() {
          return `${this.baseValue}-${this.derivedValue}`;
        }
      }

      const instance = new InheritedSystem();

      expect(instance.getValues()).toBe('base-derived');
      expect(mockSystemRegistry.register).toHaveBeenCalledWith('inherited-system', instance);
    });

    test('should handle multiple registrations', () => {
      @RegisterSystem('system-1')
      class System1 {}

      @RegisterSystem('system-2')
      class System2 {}

      const instance1 = new System1();
      const instance2 = new System2();

      expect(mockSystemRegistry.register).toHaveBeenCalledTimes(2);
      expect(mockSystemRegistry.register).toHaveBeenNthCalledWith(1, 'system-1', instance1);
      expect(mockSystemRegistry.register).toHaveBeenNthCalledWith(2, 'system-2', instance2);
    });

    test('should register each instance separately', () => {
      @RegisterSystem('multi-instance')
      class MultiInstanceSystem {
        constructor(public id: string) {}
      }

      const instance1 = new MultiInstanceSystem('1');
      const instance2 = new MultiInstanceSystem('2');

      expect(mockSystemRegistry.register).toHaveBeenCalledTimes(2);
      expect(mockSystemRegistry.register).toHaveBeenNthCalledWith(1, 'multi-instance', instance1);
      expect(mockSystemRegistry.register).toHaveBeenNthCalledWith(2, 'multi-instance', instance2);
    });

    test('should handle registration errors gracefully', () => {
      mockSystemRegistry.register.mockImplementation(() => {
        throw new Error('Registration failed');
      });

      @RegisterSystem('failing-system')
      class FailingSystem {}

      // Should still create instance even if registration fails
      expect(() => new FailingSystem()).toThrow('Registration failed');
    });
  });

  describe('Combined Usage', () => {
    test('should work together when both decorators are used', () => {
      @RegisterSystem('combined-system')
      class CombinedSystem {
        @HandleError()
        processData(data: string) {
          if (data === 'error') {
            throw new Error('Processing failed');
          }
          return `processed: ${data}`;
        }

        @HandleError('fallback')
        processWithFallback(data: string) {
          if (data === 'error') {
            throw new Error('Processing failed');
          }
          return `processed: ${data}`;
        }
      }

      const instance = new CombinedSystem();

      // System should be registered
      expect(mockSystemRegistry.register).toHaveBeenCalledWith('combined-system', instance);

      // Error handling should work
      const result1 = instance.processData('error');
      expect(result1).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalled();

      const result2 = instance.processWithFallback('error');
      expect(result2).toBe('fallback');

      // Normal operation should work
      const result3 = instance.processData('success');
      expect(result3).toBe('processed: success');
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined returns', () => {
      class TestSystem {
        @HandleError()
        returnsNull() {
          return null;
        }

        @HandleError()
        returnsUndefined() {
          return undefined;
        }
      }

      const instance = new TestSystem();

      expect(instance.returnsNull()).toBeNull();
      expect(instance.returnsUndefined()).toBeUndefined();
    });

    test('should handle complex return types', () => {
      class TestSystem {
        @HandleError()
        returnsObject() {
          return { data: 'complex', nested: { value: 42 } };
        }

        @HandleError([])
        returnsArray() {
          throw new Error('Should return default array');
        }
      }

      const instance = new TestSystem();

      const objResult = instance.returnsObject();
      expect(objResult).toEqual({ data: 'complex', nested: { value: 42 } });

      const arrResult = instance.returnsArray();
      expect(arrResult).toEqual([]);
    });

    test('should preserve descriptor properties', () => {
      const TestSystem = class {
        @HandleError()
        testMethod() {
          return 'test';
        }
      };

      const descriptor = Object.getOwnPropertyDescriptor(TestSystem.prototype, 'testMethod');
      expect(descriptor).toBeDefined();
      expect(typeof descriptor!.value).toBe('function');
    });
  });

  describe('Performance Tests', () => {
    test('decorators should not significantly impact memory usage', () => {
      @RegisterSystem('memory-test')
      class MemoryTestSystem {
        @HandleError()
        process(data: number) {
          return data * 2;
        }
      }

      const instances: MemoryTestSystem[] = [];
      const startMemory = process.memoryUsage().heapUsed;

      // Create many instances
      for (let i = 0; i < 100; i++) {
        const instance = new MemoryTestSystem();
        instance.process(i);
        instances.push(instance);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be reasonable (less than 5MB for 100 instances)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });
}); 