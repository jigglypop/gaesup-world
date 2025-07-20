import 'reflect-metadata';
import { BridgeFactory } from '../bridge/BridgeFactory';
import { BridgeRegistry } from '../bridge/BridgeRegistry';
import { DIContainer } from '../di/container';
import { CoreBridge } from '../bridge/CoreBridge';
import { IDisposable, BridgeInstance } from '../types';

// Mock Engine 타입
type MockEngine = {
  value: number;
} & IDisposable;

// Mock Snapshot 타입
type MockSnapshot = {
  value: number;
  timestamp: number;
};

// Mock Command 타입
type MockCommand = {
  type: 'set' | 'increment';
  value?: number;
};

// 테스트용 Bridge 구현
class TestBridge extends CoreBridge<MockEngine, MockSnapshot, MockCommand> {
  protected buildEngine(id: string, ...args: unknown[]): MockEngine {
    return {
      value: args[0] as number || 0,
      dispose: jest.fn()
    };
  }

  protected executeCommand(engine: MockEngine, command: MockCommand): void {
    switch (command.type) {
      case 'set':
        if (command.value !== undefined) {
          engine.value = command.value;
        }
        break;
      case 'increment':
        engine.value += command.value || 1;
        break;
    }
  }

  protected createSnapshot(engine: MockEngine): MockSnapshot {
    return {
      value: engine.value,
      timestamp: Date.now()
    };
  }
}

// 또 다른 테스트용 Bridge
class AnotherTestBridge extends CoreBridge<MockEngine, MockSnapshot, MockCommand> {
  protected buildEngine(id: string, ...args: unknown[]): MockEngine {
    return {
      value: args[0] as number || 100,
      dispose: jest.fn()
    };
  }

  protected executeCommand(engine: MockEngine, command: MockCommand): void {
    // AnotherTestBridge는 다른 로직을 가짐
    switch (command.type) {
      case 'set':
        if (command.value !== undefined) {
          engine.value = command.value * 2; // 2배
        }
        break;
      case 'increment':
        engine.value += (command.value || 1) * 3; // 3배
        break;
    }
  }

  protected createSnapshot(engine: MockEngine): MockSnapshot {
    return {
      value: engine.value,
      timestamp: Date.now()
    };
  }
}

// 의존성이 있는 Bridge
class DependencyBridge extends CoreBridge<MockEngine, MockSnapshot, MockCommand> {
  constructor(private dependency: string) {
    super();
  }

  protected buildEngine(id: string, ...args: unknown[]): MockEngine {
    return {
      value: this.dependency.length,
      dispose: jest.fn()
    };
  }

  protected executeCommand(engine: MockEngine, command: MockCommand): void {
    // 구현
  }

  protected createSnapshot(engine: MockEngine): MockSnapshot {
    return {
      value: engine.value,
      timestamp: Date.now()
    };
  }
}

describe('BridgeFactory', () => {
  let container: DIContainer;

  beforeEach(() => {
    // DI Container 초기화
    container = DIContainer.getInstance();
    container.clear();

    // 기존 팩토리 인스턴스 정리
    (BridgeFactory as any).instances?.clear?.();
  });

  afterEach(() => {
    container.clear();
    (BridgeFactory as any).instances?.clear?.();
  });

  describe('브릿지 생성', () => {
    test('등록된 브릿지를 생성할 수 있어야 함', () => {
      const domain = 'test-domain';
      
      // 브릿지 등록
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      // 브릿지 생성
      const bridge = BridgeFactory.create<TestBridge>(domain);
      
      expect(bridge).toBeInstanceOf(TestBridge);
      expect(bridge).toBeDefined();
    });

    test('등록되지 않은 도메인에 대해 null을 반환해야 함', () => {
      const bridge = BridgeFactory.create('non-existent-domain');
      
      expect(bridge).toBeNull();
    });

    test('여러 다른 도메인의 브릿지를 생성할 수 있어야 함', () => {
      const domain1 = 'domain-1';
      const domain2 = 'domain-2';
      
      BridgeRegistry.register(domain1, TestBridge);
      BridgeRegistry.register(domain2, AnotherTestBridge);
      container.registerService(TestBridge);
      container.registerService(AnotherTestBridge);
      
      const bridge1 = BridgeFactory.create<TestBridge>(domain1);
      const bridge2 = BridgeFactory.create<AnotherTestBridge>(domain2);
      
      expect(bridge1).toBeInstanceOf(TestBridge);
      expect(bridge2).toBeInstanceOf(AnotherTestBridge);
      expect(bridge1).not.toBe(bridge2);
    });
  });

  describe('싱글톤 패턴', () => {
    test('같은 도메인에 대해 동일한 인스턴스를 반환해야 함', () => {
      const domain = 'singleton-test';
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      const bridge1 = BridgeFactory.create<TestBridge>(domain);
      const bridge2 = BridgeFactory.create<TestBridge>(domain);
      
      expect(bridge1).toBe(bridge2);
      expect(bridge1).toBeInstanceOf(TestBridge);
    });

    test('다른 도메인에 대해서는 다른 인스턴스를 반환해야 함', () => {
      const domain1 = 'singleton-1';
      const domain2 = 'singleton-2';
      
      BridgeRegistry.register(domain1, TestBridge);
      BridgeRegistry.register(domain2, TestBridge);
      container.registerService(TestBridge);
      
      const bridge1 = BridgeFactory.create<TestBridge>(domain1);
      const bridge2 = BridgeFactory.create<TestBridge>(domain2);
      
      expect(bridge1).not.toBe(bridge2);
      expect(bridge1).toBeInstanceOf(TestBridge);
      expect(bridge2).toBeInstanceOf(TestBridge);
    });
  });

  describe('의존성 주입 통합', () => {
    test('DI Container를 통해 브릿지를 생성해야 함', () => {
      const domain = 'di-test';
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      const resolveSpy = jest.spyOn(container, 'resolve');
      
      const bridge = BridgeFactory.create<TestBridge>(domain);
      
      expect(resolveSpy).toHaveBeenCalledWith(TestBridge);
      expect(bridge).toBeInstanceOf(TestBridge);
      
      resolveSpy.mockRestore();
    });

    test('의존성이 있는 브릿지도 생성할 수 있어야 함', () => {
      const domain = 'dependency-test';
      const dependencyValue = 'test-dependency';
      
      // 의존성 등록
      container.register('dependency', () => dependencyValue);
      container.register(DependencyBridge, () => new DependencyBridge(dependencyValue));
      
      BridgeRegistry.register(domain, DependencyBridge);
      
      const bridge = BridgeFactory.create<DependencyBridge>(domain);
      
      expect(bridge).toBeInstanceOf(DependencyBridge);
    });
  });

  describe('에러 처리', () => {
    test('DI Container 해결 실패 시 null을 반환해야 함', () => {
      const domain = 'resolve-fail-test';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // 브릿지는 등록했지만 DI Container에는 등록하지 않음
      BridgeRegistry.register(domain, TestBridge);
      
      const bridge = BridgeFactory.create(domain);
      
      expect(bridge).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create bridge for domain')
      );
      
      consoleSpy.mockRestore();
    });

    test('브릿지 클래스가 등록되지 않은 경우 에러 로그를 출력해야 함', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const bridge = BridgeFactory.create('unregistered-domain');
      
      expect(bridge).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No bridge registered for domain')
      );
      
      consoleSpy.mockRestore();
    });

    test('생성자에서 예외가 발생해도 안전하게 처리되어야 함', () => {
      const domain = 'exception-test';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // 예외를 던지는 브릿지 클래스
      class ExceptionBridge extends TestBridge {
        constructor() {
          throw new Error('Constructor error');
        }
      }
      
      BridgeRegistry.register(domain, ExceptionBridge);
      container.register(ExceptionBridge, () => new ExceptionBridge());
      
      const bridge = BridgeFactory.create(domain);
      
      expect(bridge).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create bridge for domain')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('로깅 시스템', () => {
    test('성공적인 브릿지 생성 시 info 로그를 출력해야 함', () => {
      const domain = 'logging-test';
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      BridgeFactory.create<TestBridge>(domain);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Created bridge instance for domain')
      );
      
      consoleSpy.mockRestore();
    });

    test('이미 존재하는 인스턴스 반환 시에는 로그를 출력하지 않아야 함', () => {
      const domain = 'existing-instance-test';
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      // 첫 번째 생성
      BridgeFactory.create<TestBridge>(domain);
      consoleSpy.mockClear();
      
      // 두 번째 생성 (기존 인스턴스 반환)
      BridgeFactory.create<TestBridge>(domain);
      
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Created bridge instance')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('타입 안전성', () => {
    test('올바른 타입의 브릿지 인스턴스를 반환해야 함', () => {
      const domain = 'type-safety-test';
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      const bridge = BridgeFactory.create<TestBridge>(domain);
      
      expect(bridge).toBeInstanceOf(TestBridge);
      
      // TypeScript 타입 체크를 위한 assertion
      if (bridge) {
        bridge.register('test', 42);
        const snapshot = bridge.snapshot('test');
        expect(snapshot?.value).toBe(42);
      }
    });

    test('BridgeInstance 타입과 호환되어야 함', () => {
      const domain = 'bridge-instance-test';
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      const bridge: BridgeInstance | null = BridgeFactory.create(domain);
      
      expect(bridge).toBeInstanceOf(CoreBridge);
    });
  });

  describe('메모리 관리', () => {
    test('대량의 브릿지 생성이 메모리 문제를 일으키지 않아야 함', () => {
      const bridgeCount = 100;
      const bridges: (TestBridge | null)[] = [];
      
      for (let i = 0; i < bridgeCount; i++) {
        const domain = `bulk-create-${i}`;
        BridgeRegistry.register(domain, TestBridge);
        container.registerService(TestBridge);
        
        const bridge = BridgeFactory.create<TestBridge>(domain);
        bridges.push(bridge);
      }
      
      // 모든 브릿지가 정상적으로 생성되었는지 확인
      bridges.forEach((bridge, index) => {
        expect(bridge).toBeInstanceOf(TestBridge);
        expect(bridge).not.toBeNull();
      });
    });

    test('동일한 도메인에 대한 반복 호출이 메모리 누수를 일으키지 않아야 함', () => {
      const domain = 'memory-leak-test';
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      const firstBridge = BridgeFactory.create<TestBridge>(domain);
      
      // 동일한 도메인으로 여러 번 호출
      for (let i = 0; i < 1000; i++) {
        const bridge = BridgeFactory.create<TestBridge>(domain);
        expect(bridge).toBe(firstBridge); // 동일한 인스턴스
      }
    });
  });

  describe('동시성', () => {
    test('동시에 여러 브릿지를 생성해도 안전해야 함', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const domain = `concurrent-create-${i}`;
        BridgeRegistry.register(domain, TestBridge);
        container.registerService(TestBridge);
        
        promises.push(
          new Promise<TestBridge | null>((resolve) => {
            setTimeout(() => {
              const bridge = BridgeFactory.create<TestBridge>(domain);
              resolve(bridge);
            }, Math.random() * 10);
          })
        );
      }
      
      const bridges = await Promise.all(promises);
      
      bridges.forEach((bridge, index) => {
        expect(bridge).toBeInstanceOf(TestBridge);
        expect(bridge).not.toBeNull();
      });
    });

    test('동일한 도메인에 대한 동시 생성이 안전해야 함', async () => {
      const domain = 'concurrent-same-domain';
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          new Promise<TestBridge | null>((resolve) => {
            setTimeout(() => {
              const bridge = BridgeFactory.create<TestBridge>(domain);
              resolve(bridge);
            }, Math.random() * 10);
          })
        );
      }
      
      const bridges = await Promise.all(promises);
      
      // 모든 브릿지가 동일한 인스턴스여야 함
      const firstBridge = bridges[0];
      bridges.forEach(bridge => {
        expect(bridge).toBe(firstBridge);
        expect(bridge).toBeInstanceOf(TestBridge);
      });
    });
  });

  describe('팩토리 상태 관리', () => {
    test('팩토리 인스턴스 캐시가 올바르게 작동해야 함', () => {
      const domain = 'cache-test';
      
      BridgeRegistry.register(domain, TestBridge);
      container.registerService(TestBridge);
      
      // 인스턴스 캐시에 아무것도 없는 상태
      expect((BridgeFactory as any).instances.size).toBe(0);
      
      // 첫 번째 생성
      const bridge1 = BridgeFactory.create<TestBridge>(domain);
      expect((BridgeFactory as any).instances.size).toBe(1);
      
      // 두 번째 생성 (캐시에서 반환)
      const bridge2 = BridgeFactory.create<TestBridge>(domain);
      expect((BridgeFactory as any).instances.size).toBe(1);
      expect(bridge1).toBe(bridge2);
    });

    test('다른 도메인들이 별도로 캐시되어야 함', () => {
      const domain1 = 'cache-1';
      const domain2 = 'cache-2';
      
      BridgeRegistry.register(domain1, TestBridge);
      BridgeRegistry.register(domain2, AnotherTestBridge);
      container.registerService(TestBridge);
      container.registerService(AnotherTestBridge);
      
      BridgeFactory.create<TestBridge>(domain1);
      BridgeFactory.create<AnotherTestBridge>(domain2);
      
      expect((BridgeFactory as any).instances.size).toBe(2);
    });
  });
}); 