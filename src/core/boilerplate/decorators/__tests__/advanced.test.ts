import 'reflect-metadata';
import { Validate, EnableEventLog, DebugLog, PerformanceLog } from '../advanced';

describe('Advanced Decorators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('@Validate', () => {
    test('should validate command structure', () => {
      class TestClass {
        @Validate()
        processCommand(engine: any, command: any) {
          return `Processing ${command.type}`;
        }
      }

      // Set up metadata to simulate @Command decorator
      Reflect.defineMetadata('commandName', 'TEST_COMMAND', TestClass.prototype, 'processCommand');

      const instance = new TestClass();
      const validCommand = { type: 'TEST_COMMAND', payload: 'data' };

      const result = instance.processCommand({}, validCommand);
      expect(result).toBe('Processing TEST_COMMAND');
    });

    test('should throw error for invalid command missing type field', () => {
      class TestClass {
        @Validate()
        processCommand(engine: any, command: any) {
          return `Processing ${command.type}`;
        }
      }

      // Set up metadata to simulate @Command decorator
      Reflect.defineMetadata('commandName', 'TEST_COMMAND', TestClass.prototype, 'processCommand');

      const instance = new TestClass();
      const invalidCommand = { payload: 'data' }; // Missing 'type' field

      expect(() => instance.processCommand({}, invalidCommand)).toThrow(
        "Command validation failed: missing 'type' field"
      );
    });

    test('should pass through when no command metadata exists', () => {
      class TestClass {
        @Validate()
        regularMethod(arg1: any, arg2: any) {
          return `Regular method with ${arg1} and ${arg2}`;
        }
      }

      const instance = new TestClass();
      const result = instance.regularMethod('test', { invalid: 'command' });

      expect(result).toBe('Regular method with test and [object Object]');
    });

    test('should validate only when second argument is object', () => {
      class TestClass {
        @Validate()
        processCommand(engine: any, command: any) {
          return `Processing: ${command}`;
        }
      }

      Reflect.defineMetadata('commandName', 'TEST_COMMAND', TestClass.prototype, 'processCommand');

      const instance = new TestClass();

      // Should not validate non-object commands
      const result1 = instance.processCommand({}, 'string-command');
      expect(result1).toBe('Processing: string-command');

      const result2 = instance.processCommand({}, null);
      expect(result2).toBe('Processing: null');

      const result3 = instance.processCommand({}, undefined);
      expect(result3).toBe('Processing: undefined');
    });

    test('should handle multiple validated methods', () => {
      class TestClass {
        @Validate()
        processCommand1(engine: any, command: any) {
          return `Command1: ${command.type}`;
        }

        @Validate()
        processCommand2(engine: any, command: any) {
          return `Command2: ${command.type}`;
        }
      }

      Reflect.defineMetadata('commandName', 'COMMAND1', TestClass.prototype, 'processCommand1');
      Reflect.defineMetadata('commandName', 'COMMAND2', TestClass.prototype, 'processCommand2');

      const instance = new TestClass();

      const result1 = instance.processCommand1({}, { type: 'COMMAND1' });
      expect(result1).toBe('Command1: COMMAND1');

      const result2 = instance.processCommand2({}, { type: 'COMMAND2' });
      expect(result2).toBe('Command2: COMMAND2');

      // Test validation failure for each method
      expect(() => instance.processCommand1({}, { payload: 'data' })).toThrow();
      expect(() => instance.processCommand2({}, { payload: 'data' })).toThrow();
    });

    test('should preserve method context and arguments', () => {
      class TestClass {
        public name = 'test-class';

        @Validate()
        contextMethod(engine: any, command: any, extra: string) {
          return `${this.name}: ${command.type} - ${extra}`;
        }
      }

      Reflect.defineMetadata('commandName', 'CONTEXT_COMMAND', TestClass.prototype, 'contextMethod');

      const instance = new TestClass();
      const result = instance.contextMethod(
        { id: 'engine' },
        { type: 'CONTEXT_COMMAND' },
        'extra-data'
      );

      expect(result).toBe('test-class: CONTEXT_COMMAND - extra-data');
    });

    test('should handle async methods', async () => {
      class TestClass {
        @Validate()
        async asyncProcessCommand(engine: any, command: any) {
          await new Promise(resolve => setTimeout(resolve, 1));
          return `Async: ${command.type}`;
        }
      }

      Reflect.defineMetadata('commandName', 'ASYNC_COMMAND', TestClass.prototype, 'asyncProcessCommand');

      const instance = new TestClass();
      const result = await instance.asyncProcessCommand({}, { type: 'ASYNC_COMMAND' });

      expect(result).toBe('Async: ASYNC_COMMAND');

      // Test async validation failure
      await expect(
        instance.asyncProcessCommand({}, { payload: 'data' })
      ).rejects.toThrow("Command validation failed: missing 'type' field");
    });

    test('should handle complex command structures', () => {
      class TestClass {
        @Validate()
        processComplexCommand(engine: any, command: any) {
          return `Complex: ${command.type} with ${JSON.stringify(command.payload)}`;
        }
      }

      Reflect.defineMetadata('commandName', 'COMPLEX_COMMAND', TestClass.prototype, 'processComplexCommand');

      const instance = new TestClass();
      const complexCommand = {
        type: 'COMPLEX_COMMAND',
        payload: {
          data: 'nested',
          metadata: { version: '1.0' },
          list: [1, 2, 3]
        }
      };

      const result = instance.processComplexCommand({}, complexCommand);
      expect(result).toContain('Complex: COMPLEX_COMMAND');
      expect(result).toContain('nested');
    });
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

  describe('@DebugLog', () => {
    test('should be available as decorator', () => {
      expect(DebugLog).toBeDefined();
      expect(typeof DebugLog).toBe('function');
    });

    test('should work as method decorator', () => {
      expect(() => {
        class TestClass {
          @DebugLog()
          debugMethod(data: string) {
            return `debug: ${data}`;
          }
        }
        
        const instance = new TestClass();
        expect(instance.debugMethod('test')).toBe('debug: test');
      }).not.toThrow();
    });

    test('should preserve method functionality', () => {
      class TestClass {
        public counter = 0;

        @DebugLog()
        increment() {
          this.counter++;
          return this.counter;
        }

        @DebugLog()
        add(value: number) {
          this.counter += value;
          return this.counter;
        }
      }

      const instance = new TestClass();
      expect(instance.increment()).toBe(1);
      expect(instance.add(5)).toBe(6);
      expect(instance.counter).toBe(6);
    });

    test('should handle async methods', async () => {
      class TestClass {
        @DebugLog()
        async asyncDebug(data: string) {
          await new Promise(resolve => setTimeout(resolve, 1));
          return `async-debug: ${data}`;
        }
      }

      const instance = new TestClass();
      const result = await instance.asyncDebug('test');
      expect(result).toBe('async-debug: test');
    });

    test('should handle errors gracefully', () => {
      class TestClass {
        @DebugLog()
        throwingMethod() {
          throw new Error('Debug error');
        }
      }

      const instance = new TestClass();
      expect(() => instance.throwingMethod()).toThrow('Debug error');
    });
  });

  describe('@PerformanceLog', () => {
    test('should be available as decorator', () => {
      expect(PerformanceLog).toBeDefined();
      expect(typeof PerformanceLog).toBe('function');
    });

    test('should work as method decorator', () => {
      expect(() => {
        class TestClass {
          @PerformanceLog()
          performanceMethod() {
            return 'performance test';
          }
        }
        
        const instance = new TestClass();
        expect(instance.performanceMethod()).toBe('performance test');
      }).not.toThrow();
    });

    test('should preserve method functionality and context', () => {
      class TestClass {
        public name = 'perf-test';

        @PerformanceLog()
        contextMethod(multiplier: number) {
          return `${this.name} x ${multiplier}`;
        }

        @PerformanceLog()
        computeValue(base: number, exponent: number) {
          return Math.pow(base, exponent);
        }
      }

      const instance = new TestClass();
      expect(instance.contextMethod(3)).toBe('perf-test x 3');
      expect(instance.computeValue(2, 8)).toBe(256);
    });

    test('should handle async methods', async () => {
      class TestClass {
        @PerformanceLog()
        async asyncPerformance(delay: number) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return `completed after ${delay}ms`;
        }
      }

      const instance = new TestClass();
      const result = await instance.asyncPerformance(1);
      expect(result).toBe('completed after 1ms');
    });

    test('should work with complex return types', () => {
      class TestClass {
        @PerformanceLog()
        complexMethod() {
          return {
            data: 'complex',
            nested: {
              array: [1, 2, 3],
              object: { key: 'value' }
            },
            timestamp: Date.now()
          };
        }
      }

      const instance = new TestClass();
      const result = instance.complexMethod();
      
      expect(result.data).toBe('complex');
      expect(result.nested.array).toEqual([1, 2, 3]);
      expect(result.nested.object.key).toBe('value');
      expect(typeof result.timestamp).toBe('number');
    });
  });

  describe('Combined Usage', () => {
    test('should work when multiple advanced decorators are combined', () => {
      @EnableEventLog()
      class CombinedClass {
        @Validate()
        @DebugLog()
        @PerformanceLog()
        combinedMethod(engine: any, command: any) {
          return `combined: ${command.type}`;
        }
      }

      Reflect.defineMetadata('commandName', 'COMBINED_COMMAND', CombinedClass.prototype, 'combinedMethod');

      const instance = new CombinedClass();
      const result = instance.combinedMethod({}, { type: 'COMBINED_COMMAND' });

      expect(result).toBe('combined: COMBINED_COMMAND');
    });

    test('should handle validation errors with other decorators', () => {
      class TestClass {
        @Validate()
        @DebugLog()
        @PerformanceLog()
        validatedMethod(engine: any, command: any) {
          return `validated: ${command.type}`;
        }
      }

      Reflect.defineMetadata('commandName', 'VALIDATED_COMMAND', TestClass.prototype, 'validatedMethod');

      const instance = new TestClass();

      // Should work with valid command
      const result = instance.validatedMethod({}, { type: 'VALIDATED_COMMAND' });
      expect(result).toBe('validated: VALIDATED_COMMAND');

      // Should fail validation and propagate error through other decorators
      expect(() => instance.validatedMethod({}, { payload: 'data' })).toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should work with reflect-metadata operations', () => {
      class TestClass {
        @Validate()
        @DebugLog()
        methodWithMetadata(engine: any, command: any) {
          return command.type;
        }
      }

      // Test metadata operations
      Reflect.defineMetadata('testKey', 'testValue', TestClass.prototype, 'methodWithMetadata');
      Reflect.defineMetadata('commandName', 'META_COMMAND', TestClass.prototype, 'methodWithMetadata');

      const metadata = Reflect.getMetadata('testKey', TestClass.prototype, 'methodWithMetadata');
      expect(metadata).toBe('testValue');

      const instance = new TestClass();
      const result = instance.methodWithMetadata({}, { type: 'META_COMMAND' });
      expect(result).toBe('META_COMMAND');
    });

    test('should preserve descriptor properties', () => {
      class TestClass {
        @PerformanceLog()
        @DebugLog()
        decoratedMethod() {
          return 'decorated';
        }
      }

      const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'decoratedMethod');
      expect(descriptor).toBeDefined();
      expect(typeof descriptor!.value).toBe('function');
      expect(descriptor!.enumerable).toBe(false);
      expect(descriptor!.configurable).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('advanced decorators should not significantly impact performance', () => {
      class PerformanceClass {
        @Validate()
        @DebugLog()
        @PerformanceLog()
        fastMethod(engine: any, command: any) {
          return Math.random();
        }
      }

      Reflect.defineMetadata('commandName', 'FAST_COMMAND', PerformanceClass.prototype, 'fastMethod');

      const instance = new PerformanceClass();
      const iterations = 100;
      const engine = { id: 'test' };
      const command = { type: 'FAST_COMMAND' };

      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        instance.fastMethod(engine, command);
      }
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      // Should complete 100 iterations in reasonable time
      expect(totalTime).toBeLessThan(50);
    });
  });

  describe('Error Handling', () => {
    test('should handle decorator application errors', () => {
      expect(() => {
        class TestClass {
          @DebugLog()
          @PerformanceLog()
          @Validate()
          normalMethod() {
            return 'normal';
          }
        }
        
        const instance = new TestClass();
        instance.normalMethod();
      }).not.toThrow();
    });

    test('should preserve original error types and messages', () => {
      class TestClass {
        @DebugLog()
        @PerformanceLog()
        customErrorMethod() {
          throw new TypeError('Custom type error');
        }

        @Validate()
        validationErrorMethod(engine: any, command: any) {
          return command.type;
        }
      }

      Reflect.defineMetadata('commandName', 'ERROR_COMMAND', TestClass.prototype, 'validationErrorMethod');

      const instance = new TestClass();

      // Should preserve original error type
      expect(() => instance.customErrorMethod()).toThrow(TypeError);
      expect(() => instance.customErrorMethod()).toThrow('Custom type error');

      // Should preserve validation error
      expect(() => instance.validationErrorMethod({}, {})).toThrow(/Command validation failed/);
    });
  });
}); 