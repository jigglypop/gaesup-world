import 'reflect-metadata';
import { EnableEventLog } from '../advanced';

describe('Advanced Decorators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('@EnableEventLog', () => {
    test('should be available as decorator', () => {
      expect(EnableEventLog).toBeDefined();
      expect(typeof EnableEventLog).toBe('function');
    });

    test('should work as class decorator', () => {
      expect(() => {
        @EnableEventLog()
        class TestClass {
          public name = 'test';
        }
        
        const instance = new TestClass();
        expect(instance.name).toBe('test');
      }).not.toThrow();
    });

    test('should work as method decorator', () => {
      expect(() => {
        class TestClass {
          @EnableEventLog()
          testMethod() {
            return 'test';
          }
        }
        
        const instance = new TestClass();
        expect(instance.testMethod()).toBe('test');
      }).not.toThrow();
    });

    test('should preserve class functionality', () => {
      @EnableEventLog()
      class TestClass {
        constructor(public value: number) {}

        getValue() {
          return this.value;
        }

        @EnableEventLog()
        processValue() {
          return this.value * 2;
        }
      }

      const instance = new TestClass(42);
      expect(instance.getValue()).toBe(42);
      expect(instance.processValue()).toBe(84);
    });
  });

});
