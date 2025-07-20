import 'reflect-metadata';
import { LogSnapshot, ValidateCommand, RegisterBridge, RequireEngine } from '../bridge';
import { logger } from '../../../utils/logger';

// Mock dependencies
jest.mock('../../../utils/logger');

const mockLogger = logger as jest.Mocked<typeof logger>;

// Mock BridgeRegistry
const mockBridgeRegistry = {
  register: jest.fn()
};
jest.doMock('../../bridge/BridgeRegistry', () => ({
  BridgeRegistry: mockBridgeRegistry
}));

describe('Bridge Decorators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger.log = jest.fn();
    mockLogger.warn = jest.fn();
    mockLogger.info = jest.fn();
    mockBridgeRegistry.register = jest.fn();
    
    // Mock performance.now()
    jest.spyOn(performance, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1016.67); // 16.67ms later
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('@LogSnapshot', () => {
    test('should log snapshot processing time', () => {
      class TestBridge {
        @LogSnapshot()
        processSnapshot(data: any) {
          return { processed: data };
        }
      }

      const instance = new TestBridge();
      const result = instance.processSnapshot({ test: 'data' });

      expect(result).toEqual({ processed: { test: 'data' } });
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[TestBridge] processSnapshot snapshot processed in 16.67ms'
      );
    });

    test('should handle async snapshot processing', async () => {
      class TestBridge {
        @LogSnapshot()
        async processAsyncSnapshot(data: any) {
          await new Promise(resolve => setTimeout(resolve, 10));
          return { async: data };
        }
      }

      const instance = new TestBridge();
      const result = await instance.processAsyncSnapshot({ async: 'test' });

      expect(result).toEqual({ async: { async: 'test' } });
      expect(mockLogger.log).toHaveBeenCalled();
    });

    test('should log even when method throws', () => {
      class TestBridge {
        @LogSnapshot()
        failingSnapshot() {
          throw new Error('Snapshot failed');
        }
      }

      const instance = new TestBridge();

      expect(() => instance.failingSnapshot()).toThrow('Snapshot failed');
      expect(mockLogger.log).toHaveBeenCalledWith(
        '[TestBridge] failingSnapshot snapshot processed in 16.67ms'
      );
    });

    test('should preserve method arguments and context', () => {
      class TestBridge {
        public name = 'test-bridge';

        @LogSnapshot()
        contextSnapshot(data: string, multiplier: number) {
          return `${this.name}: ${data} x ${multiplier}`;
        }
      }

      const instance = new TestBridge();
      const result = instance.contextSnapshot('test', 3);

      expect(result).toBe('test-bridge: test x 3');
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });

  describe('@ValidateCommand', () => {
    test('should validate command object', () => {
      class TestBridge {
        @ValidateCommand()
        executeCommand(engine: any, command: any) {
          return `Executed: ${command.type}`;
        }
      }

      const instance = new TestBridge();
      const mockEngine = { id: 'test-engine' };
      const validCommand = { type: 'TEST_COMMAND', payload: 'data' };

      const result = instance.executeCommand(mockEngine, validCommand);
      expect(result).toBe('Executed: TEST_COMMAND');
    });

    test('should warn and return early for invalid commands', () => {
      class TestBridge {
        @ValidateCommand()
        executeCommand(engine: any, command: any) {
          return `Executed: ${command.type}`;
        }
      }

      const instance = new TestBridge();
      const mockEngine = { id: 'test-engine' };

      // Test null command
      const result1 = instance.executeCommand(mockEngine, null);
      expect(result1).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[TestBridge] Invalid command passed to executeCommand'
      );

      // Test undefined command
      const result2 = instance.executeCommand(mockEngine, undefined);
      expect(result2).toBeUndefined();

      // Test non-object command
      const result3 = instance.executeCommand(mockEngine, 'invalid');
      expect(result3).toBeUndefined();
    });

    test('should pass through additional arguments', () => {
      class TestBridge {
        @ValidateCommand()
        executeCommand(engine: any, command: any, context: any, options: any) {
          return {
            engine: engine.id,
            command: command.type,
            context: context.name,
            options: options.priority
          };
        }
      }

      const instance = new TestBridge();
      const result = instance.executeCommand(
        { id: 'engine1' },
        { type: 'COMMAND' },
        { name: 'context1' },
        { priority: 'high' }
      );

      expect(result).toEqual({
        engine: 'engine1',
        command: 'COMMAND',
        context: 'context1',
        options: 'high'
      });
    });

    test('should handle empty object commands', () => {
      class TestBridge {
        @ValidateCommand()
        executeCommand(engine: any, command: any) {
          return `Valid command: ${typeof command}`;
        }
      }

      const instance = new TestBridge();
      const result = instance.executeCommand({ id: 'engine' }, {});

      expect(result).toBe('Valid command: object');
    });
  });

  describe('@RegisterBridge', () => {
    test('should register bridge on instantiation', () => {
      @RegisterBridge('test-domain')
      class TestBridge {
        public name = 'test-bridge';
      }

      const instance = new TestBridge();

      expect(mockBridgeRegistry.register).toHaveBeenCalledWith('test-domain', instance);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[TestBridge] Registered as bridge for domain: test-domain'
      );
    });

    test('should preserve original class functionality', () => {
      @RegisterBridge('advanced-domain')
      class AdvancedBridge {
        constructor(public config: any) {}

        process(data: any) {
          return { config: this.config, data };
        }
      }

      const config = { setting: 'value' };
      const instance = new AdvancedBridge(config);

      expect(instance.config).toBe(config);
      expect(instance.process('test')).toEqual({
        config: { setting: 'value' },
        data: 'test'
      });
    });

    test('should handle inheritance correctly', () => {
      class BaseBridge {
        protected baseProperty = 'base';
      }

      @RegisterBridge('inherited-domain')
      class InheritedBridge extends BaseBridge {
        public derivedProperty = 'derived';

        getProperties() {
          return `${this.baseProperty}-${this.derivedProperty}`;
        }
      }

      const instance = new InheritedBridge();

      expect(instance.getProperties()).toBe('base-derived');
      expect(mockBridgeRegistry.register).toHaveBeenCalledWith('inherited-domain', instance);
    });

    test('should handle multiple registrations', () => {
      @RegisterBridge('domain-1')
      class Bridge1 {}

      @RegisterBridge('domain-2')
      class Bridge2 {}

      const instance1 = new Bridge1();
      const instance2 = new Bridge2();

      expect(mockBridgeRegistry.register).toHaveBeenCalledTimes(2);
      expect(mockBridgeRegistry.register).toHaveBeenNthCalledWith(1, 'domain-1', instance1);
      expect(mockBridgeRegistry.register).toHaveBeenNthCalledWith(2, 'domain-2', instance2);
    });
  });

  describe('@RequireEngine', () => {
    test('should validate engine parameter', () => {
      class TestBridge {
        @RequireEngine()
        processWithEngine(engine: any, data: any) {
          return `Processing ${data} with ${engine.id}`;
        }
      }

      const instance = new TestBridge();
      const mockEngine = { id: 'test-engine' };

      const result = instance.processWithEngine(mockEngine, 'test-data');
      expect(result).toBe('Processing test-data with test-engine');
    });

    test('should throw error when engine is missing', () => {
      class TestBridge {
        @RequireEngine()
        processWithEngine(engine: any, data: any) {
          return `Processing ${data}`;
        }
      }

      const instance = new TestBridge();

      expect(() => instance.processWithEngine(null, 'data')).toThrow(
        '[TestBridge] Engine/Entity not provided for processWithEngine'
      );

      expect(() => instance.processWithEngine(undefined, 'data')).toThrow(
        '[TestBridge] Engine/Entity not provided for processWithEngine'
      );
    });

    test('should work with entity objects', () => {
      class TestBridge {
        @RequireEngine()
        processWithEntity(entity: any, command: any) {
          return `Entity ${entity.name} executing ${command.type}`;
        }
      }

      const instance = new TestBridge();
      const mockEntity = { name: 'test-entity', id: 'entity-1' };
      const command = { type: 'MOVE', direction: 'up' };

      const result = instance.processWithEntity(mockEntity, command);
      expect(result).toBe('Entity test-entity executing MOVE');
    });

    test('should preserve all arguments', () => {
      class TestBridge {
        @RequireEngine()
        complexMethod(engine: any, a: number, b: string, c: object) {
          return {
            engine: engine.id,
            a, b, c
          };
        }
      }

      const instance = new TestBridge();
      const result = instance.complexMethod(
        { id: 'engine' },
        42,
        'test',
        { nested: 'object' }
      );

      expect(result).toEqual({
        engine: 'engine',
        a: 42,
        b: 'test',
        c: { nested: 'object' }
      });
    });

    test('should work with falsy but valid engines', () => {
      class TestBridge {
        @RequireEngine()
        processWithEngine(engine: any) {
          return `Engine: ${engine}`;
        }
      }

      const instance = new TestBridge();

      // Should work with falsy but non-null/undefined values
      expect(instance.processWithEngine(0)).toBe('Engine: 0');
      expect(instance.processWithEngine('')).toBe('Engine: ');
      expect(instance.processWithEngine(false)).toBe('Engine: false');
    });
  });

  describe('Combined Usage', () => {
    test('should work when multiple decorators are combined', () => {
      @RegisterBridge('combined-domain')
      class CombinedBridge {
        @LogSnapshot()
        @ValidateCommand()
        @RequireEngine()
        processCommand(engine: any, command: any) {
          return `${engine.id} executed ${command.type}`;
        }
      }

      const instance = new CombinedBridge();
      const mockEngine = { id: 'test-engine' };
      const validCommand = { type: 'TEST' };

      // Should register bridge
      expect(mockBridgeRegistry.register).toHaveBeenCalledWith('combined-domain', instance);

      // Should execute successfully with all validations
      const result = instance.processCommand(mockEngine, validCommand);
      expect(result).toBe('test-engine executed TEST');
      expect(mockLogger.log).toHaveBeenCalled(); // From LogSnapshot
    });

    test('should handle validation failures in combined decorators', () => {
      @RegisterBridge('failing-domain')
      class FailingBridge {
        @LogSnapshot()
        @ValidateCommand()
        @RequireEngine()
        processCommand(engine: any, command: any) {
          return 'Should not reach here';
        }
      }

      const instance = new FailingBridge();

      // Test engine validation failure
      expect(() => instance.processCommand(null, { type: 'TEST' })).toThrow();

      // Test command validation failure
      const result = instance.processCommand({ id: 'engine' }, null);
      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    test('decorators should not significantly impact performance', () => {
      class PerformanceBridge {
        @LogSnapshot()
        @ValidateCommand()
        @RequireEngine()
        fastMethod(engine: any, command: any) {
          return Math.random();
        }
      }

      const instance = new PerformanceBridge();
      const engine = { id: 'perf-engine' };
      const command = { type: 'FAST' };
      const iterations = 1000;

      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        instance.fastMethod(engine, command);
      }
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      // Should complete 1000 iterations in reasonable time
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle decorator application errors gracefully', () => {
      expect(() => {
        class TestBridge {
          @LogSnapshot()
          @ValidateCommand()
          normalMethod(engine: any, command: any) {
            return 'success';
          }
        }
        new TestBridge();
      }).not.toThrow();
    });

    test('should preserve error propagation from original methods', () => {
      class ErrorBridge {
        @LogSnapshot()
        @RequireEngine()
        methodThatThrows(engine: any) {
          throw new Error('Original error');
        }
      }

      const instance = new ErrorBridge();
      
      expect(() => instance.methodThatThrows({ id: 'engine' })).toThrow('Original error');
    });
  });
}); 