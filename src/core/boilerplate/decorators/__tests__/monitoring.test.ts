import 'reflect-metadata';
import { logger } from '../../../utils/logger';
import { Profile } from '../monitoring';

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

});
