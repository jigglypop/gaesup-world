import {
  BaseState,
  BaseMetrics,
  SystemOptions,
  SystemUpdateArgs,
  IDisposable,
  BridgeEventType,
  BridgeEvent,
  BridgeMiddleware,
  ManagedEntityOptions,
  UseBaseFrameOptions,
  UseBaseLifecycleOptions,
  UseManagedEntityOptions,
  DEFAULT_CACHE_TIMEOUT_MS,
  DEFAULT_COMMAND_QUEUE_SIZE,
  MILLISECONDS_IN_SECOND,
  Constructor,
  AbstractConstructor,
  ServiceTarget,
  Factory,
  Token,
  BridgeClass,
  BridgeInstance,
  BridgeConstructor
} from '../index';
import { CoreBridge } from '../../bridge/CoreBridge';
import { ManagedEntity } from '../../entity/ManagedEntity';

describe('Types Module', () => {
  describe('Basic Types', () => {
    test('BaseState should have required properties', () => {
      const state: BaseState = {
        lastUpdate: 12345
      };
      
      expect(state).toHaveProperty('lastUpdate');
      expect(typeof state.lastUpdate).toBe('number');
    });

    test('BaseMetrics should have required properties', () => {
      const metrics: BaseMetrics = {
        frameTime: 16.67
      };
      
      expect(metrics).toHaveProperty('frameTime');
      expect(typeof metrics.frameTime).toBe('number');
    });

    test('SystemOptions should allow optional properties', () => {
      const options1: SystemOptions = {};
      const options2: SystemOptions = {
        initialState: { value: 42 },
        initialMetrics: { fps: 60 }
      };
      
      expect(options1).toBeDefined();
      expect(options2.initialState).toEqual({ value: 42 });
      expect(options2.initialMetrics).toEqual({ fps: 60 });
    });

    test('SystemUpdateArgs should have deltaTime', () => {
      const args: SystemUpdateArgs = {
        deltaTime: 0.016
      };
      
      expect(args).toHaveProperty('deltaTime');
      expect(typeof args.deltaTime).toBe('number');
    });

    test('IDisposable should define dispose method', () => {
      const disposable: IDisposable = {
        dispose: jest.fn()
      };
      
      expect(disposable).toHaveProperty('dispose');
      expect(typeof disposable.dispose).toBe('function');
      
      disposable.dispose();
      expect(disposable.dispose).toHaveBeenCalled();
    });
  });

  describe('Bridge Types', () => {
    test('BridgeEventType should contain valid event types', () => {
      const validTypes: BridgeEventType[] = ['register', 'unregister', 'execute', 'snapshot', 'error'];
      
      validTypes.forEach(type => {
        expect(['register', 'unregister', 'execute', 'snapshot', 'error']).toContain(type);
      });
    });

    test('BridgeEvent should have required structure', () => {
      const event: BridgeEvent<any, any, any> = {
        type: 'register',
        id: 'test-id',
        timestamp: Date.now(),
        data: {
          engine: { dispose: jest.fn() },
          command: { type: 'test' },
          snapshot: { state: 'test' },
          error: new Error('test error')
        }
      };
      
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('timestamp');
      expect(event.data).toHaveProperty('engine');
      expect(event.data).toHaveProperty('command');
      expect(event.data).toHaveProperty('snapshot');
      expect(event.data).toHaveProperty('error');
    });

    test('BridgeMiddleware should be a function', () => {
      const middleware: BridgeMiddleware<any, any, any> = (event, next) => {
        expect(event).toHaveProperty('type');
        expect(typeof next).toBe('function');
        next();
      };
      
      const mockEvent: BridgeEvent<any, any, any> = {
        type: 'execute',
        id: 'test',
        timestamp: Date.now()
      };
      
      const nextFn = jest.fn();
      middleware(mockEvent, nextFn);
      
      expect(nextFn).toHaveBeenCalled();
    });
  });

  describe('Options Types', () => {
    test('ManagedEntityOptions should support all properties', () => {
      const options: ManagedEntityOptions<any, any, any> = {
        enableCommandQueue: true,
        maxQueueSize: 50,
        enableStateCache: false,
        cacheTimeout: 5000,
        onInit: jest.fn(),
        onDispose: jest.fn()
      };
      
      expect(options.enableCommandQueue).toBe(true);
      expect(options.maxQueueSize).toBe(50);
      expect(options.enableStateCache).toBe(false);
      expect(options.cacheTimeout).toBe(5000);
      expect(typeof options.onInit).toBe('function');
      expect(typeof options.onDispose).toBe('function');
    });

    test('UseBaseFrameOptions should have frame-related properties', () => {
      const options: UseBaseFrameOptions = {
        priority: 1,
        enabled: true,
        throttle: 16,
        skipWhenHidden: true
      };
      
      expect(options.priority).toBe(1);
      expect(options.enabled).toBe(true);
      expect(options.throttle).toBe(16);
      expect(options.skipWhenHidden).toBe(true);
    });

    test('UseBaseLifecycleOptions should support lifecycle callbacks', () => {
      const cleanupFn = jest.fn();
      const options: UseBaseLifecycleOptions<any> = {
        onRegister: jest.fn().mockReturnValue(cleanupFn),
        onUnregister: jest.fn(),
        dependencies: [1, 2, 3],
        enabled: true
      };
      
      expect(typeof options.onRegister).toBe('function');
      expect(typeof options.onUnregister).toBe('function');
      expect(options.dependencies).toEqual([1, 2, 3]);
      expect(options.enabled).toBe(true);
      
      const cleanup = options.onRegister!({} as any);
      expect(cleanup).toBe(cleanupFn);
    });

    test('UseManagedEntityOptions should extend all option types', () => {
      const options: UseManagedEntityOptions<any, any, any> = {
        // ManagedEntityOptions
        enableCommandQueue: true,
        maxQueueSize: 100,
        enableStateCache: true,
        cacheTimeout: 1000,
        onInit: jest.fn(),
        onDispose: jest.fn(),
        // UseBaseFrameOptions
        priority: 2,
        enabled: true,
        throttle: 32,
        skipWhenHidden: false,
        // UseBaseLifecycleOptions
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        dependencies: ['dep1'],
        // UseManagedEntityOptions specific
        frameCallback: jest.fn()
      };
      
      // Verify all properties are accessible
      expect(options.enableCommandQueue).toBe(true);
      expect(options.priority).toBe(2);
      expect(typeof options.onRegister).toBe('function');
      expect(typeof options.frameCallback).toBe('function');
    });
  });

  describe('Constants', () => {
    test('should export correct constant values', () => {
      expect(DEFAULT_CACHE_TIMEOUT_MS).toBe(16);
      expect(DEFAULT_COMMAND_QUEUE_SIZE).toBe(100);
      expect(MILLISECONDS_IN_SECOND).toBe(1000);
    });

    test('constants should be numbers', () => {
      expect(typeof DEFAULT_CACHE_TIMEOUT_MS).toBe('number');
      expect(typeof DEFAULT_COMMAND_QUEUE_SIZE).toBe('number');
      expect(typeof MILLISECONDS_IN_SECOND).toBe('number');
    });
  });

  describe('Constructor Types', () => {
    test('Constructor should work with classes', () => {
      class TestClass {
        constructor(public value: number) {}
      }
      
      const ctor: Constructor<TestClass> = TestClass;
      const instance = new ctor(42);
      
      expect(instance).toBeInstanceOf(TestClass);
      expect(instance.value).toBe(42);
    });

    test('AbstractConstructor should work with abstract classes', () => {
      abstract class AbstractTestClass {
        abstract getValue(): number;
      }
      
      class ConcreteTestClass extends AbstractTestClass {
        getValue(): number {
          return 42;
        }
      }
      
      const ctor: AbstractConstructor<AbstractTestClass> = AbstractTestClass;
      const concreteCtor: Constructor<ConcreteTestClass> = ConcreteTestClass;
      
      expect(ctor).toBe(AbstractTestClass);
      expect(new concreteCtor().getValue()).toBe(42);
    });

    test('ServiceTarget should accept both types', () => {
      class TestService {}
      abstract class AbstractService {}
      
      const concreteTarget: ServiceTarget<TestService> = TestService;
      const abstractTarget: ServiceTarget<AbstractService> = AbstractService;
      
      expect(concreteTarget).toBe(TestService);
      expect(abstractTarget).toBe(AbstractService);
    });

    test('Factory should be a function returning T', () => {
      const numberFactory: Factory<number> = () => 42;
      const stringFactory: Factory<string> = () => 'test';
      
      expect(numberFactory()).toBe(42);
      expect(stringFactory()).toBe('test');
    });

    test('Token should accept various types', () => {
      class TestClass {}
      abstract class AbstractClass {}
      
      const classToken: Token<TestClass> = TestClass;
      const abstractToken: Token<AbstractClass> = AbstractClass;
      const stringToken: Token<string> = 'string-token';
      const symbolToken: Token<number> = Symbol('number-token');
      
      expect(classToken).toBe(TestClass);
      expect(abstractToken).toBe(AbstractClass);
      expect(stringToken).toBe('string-token');
      expect(typeof symbolToken).toBe('symbol');
    });
  });

  describe('Bridge Types', () => {
    test('BridgeClass should be a constructor', () => {
      class TestBridge {
        constructor(public name: string) {}
      }
      
      const bridgeClass: BridgeClass = TestBridge;
      const instance = new bridgeClass('test');
      
      expect(instance).toBeInstanceOf(TestBridge);
    });

    test('BridgeInstance should be CoreBridge instance', () => {
      // Mock CoreBridge since it's complex
      const mockBridge = {
        register: jest.fn(),
        unregister: jest.fn(),
        executeCommand: jest.fn(),
        getSnapshot: jest.fn()
      } as unknown as BridgeInstance;
      
      expect(mockBridge).toHaveProperty('register');
      expect(mockBridge).toHaveProperty('unregister');
      expect(mockBridge).toHaveProperty('executeCommand');
      expect(mockBridge).toHaveProperty('getSnapshot');
    });

    test('BridgeConstructor should create BridgeInstance', () => {
      // Mock bridge constructor
      const MockBridgeConstructor = jest.fn().mockImplementation(() => ({
        register: jest.fn(),
        unregister: jest.fn(),
        executeCommand: jest.fn(),
        getSnapshot: jest.fn()
      }));
      
      const bridgeConstructor: BridgeConstructor = MockBridgeConstructor as any;
      const instance = new bridgeConstructor();
      
      expect(MockBridgeConstructor).toHaveBeenCalled();
      expect(instance).toHaveProperty('register');
    });
  });

  describe('Type Compatibility', () => {
    test('types should be compatible with implementation classes', () => {
      // Test that our types work with actual implementation
      const disposable: IDisposable = {
        dispose: () => {}
      };
      
      const state: BaseState = {
        lastUpdate: performance.now()
      };
      
      const metrics: BaseMetrics = {
        frameTime: 16.67
      };
      
      expect(disposable).toBeDefined();
      expect(state).toBeDefined();
      expect(metrics).toBeDefined();
    });

    test('option types should compose correctly', () => {
      // Test that option types can be used together
      const frameOptions: UseBaseFrameOptions = {
        priority: 1,
        enabled: true
      };
      
      const lifecycleOptions: UseBaseLifecycleOptions<any> = {
        onRegister: () => {},
        enabled: true
      };
      
      const combinedOptions: UseManagedEntityOptions<any, any, any> = {
        ...frameOptions,
        ...lifecycleOptions,
        enableCommandQueue: true,
        frameCallback: () => {}
      };
      
      expect(combinedOptions.priority).toBe(1);
      expect(combinedOptions.enabled).toBe(true);
      expect(combinedOptions.enableCommandQueue).toBe(true);
      expect(typeof combinedOptions.frameCallback).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    test('should handle optional properties correctly', () => {
      const minimalOptions: ManagedEntityOptions<any, any, any> = {};
      expect(minimalOptions).toBeDefined();
      
      const minimalFrameOptions: UseBaseFrameOptions = {};
      expect(minimalFrameOptions).toBeDefined();
      
      const minimalLifecycleOptions: UseBaseLifecycleOptions<any> = {};
      expect(minimalLifecycleOptions).toBeDefined();
    });

    test('should work with complex generic types', () => {
      interface TestEngine extends IDisposable {
        name: string;
      }
      
      interface TestSnapshot {
        timestamp: number;
        data: unknown;
      }
      
      interface TestCommand {
        type: string;
        payload: unknown;
      }
      
      const event: BridgeEvent<TestEngine, TestSnapshot, TestCommand> = {
        type: 'execute',
        id: 'complex-test',
        timestamp: Date.now(),
        data: {
          engine: { name: 'test-engine', dispose: jest.fn() },
          snapshot: { timestamp: Date.now(), data: { test: true } },
          command: { type: 'TEST_COMMAND', payload: { value: 42 } }
        }
      };
      
      expect(event.data?.engine?.name).toBe('test-engine');
      expect(event.data?.command?.type).toBe('TEST_COMMAND');
      expect(typeof event.data?.engine?.dispose).toBe('function');
    });

    test('should handle null/undefined in optional fields', () => {
      const eventWithoutData: BridgeEvent<any, any, any> = {
        type: 'register',
        id: 'no-data',
        timestamp: Date.now()
      };
      
      expect(eventWithoutData.data).toBeUndefined();
      
      const eventWithPartialData: BridgeEvent<any, any, any> = {
        type: 'error',
        id: 'partial-data',
        timestamp: Date.now(),
        data: {
          error: new Error('Test error')
        }
      };
      
      expect(eventWithPartialData.data?.error).toBeInstanceOf(Error);
      expect(eventWithPartialData.data?.engine).toBeUndefined();
    });
  });

  describe('Performance and Memory', () => {
    test('type definitions should not cause memory leaks', () => {
      const iterations = 1000;
      const startMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < iterations; i++) {
        const options: UseManagedEntityOptions<any, any, any> = {
          enableCommandQueue: true,
          priority: i % 10,
          frameCallback: () => i
        };
        
        const event: BridgeEvent<any, any, any> = {
          type: 'execute',
          id: `test-${i}`,
          timestamp: Date.now()
        };
        
        // Use the objects to prevent optimization
        expect(options.priority).toBeDefined();
        expect(event.id).toBeDefined();
      }
      
      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;
      
      // Memory increase should be reasonable (less than 10MB for 1000 iterations)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle large data structures efficiently', () => {
      const largePayload = new Array(10000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` }));
      
      const command = {
        type: 'LARGE_COMMAND',
        payload: largePayload
      };
      
      const event: BridgeEvent<any, any, any> = {
        type: 'execute',
        id: 'large-data-test',
        timestamp: Date.now(),
        data: { command }
      };
      
      expect(event.data?.command?.payload).toHaveLength(10000);
      expect(event.data?.command?.payload[9999]).toEqual({ id: 9999, data: 'item-9999' });
    });
  });
}); 