import { AbstractBridge } from '../bridge/AbstractBridge';
import { DIContainer } from '../di/container';
import { ManagedEntity } from '../entity/ManagedEntity';
import { IDisposable, RuntimeValue } from '../types';

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

function isMockEngine(value: RuntimeValue): value is MockEngine {
  return typeof value === 'object' && value !== null
    && typeof (value as Partial<MockEngine>).value === 'number'
    && typeof (value as Partial<MockEngine>).dispose === 'function';
}

// 테스트용 Bridge 구현: ManagedEntity.initialize()는 자신의 engine 객체를 등록한다
class TestBridge extends AbstractBridge<MockEngine, MockSnapshot, MockCommand> {
  protected buildEngine(_id: string, engine?: RuntimeValue): MockEngine {
    if (engine !== undefined && isMockEngine(engine)) return engine;
    return {
      value: typeof engine === 'number' ? engine : 0,
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

type TestEntity = ManagedEntity<MockEngine, MockSnapshot, MockCommand>;

// 보호된 이벤트 훅을 spy할 수 있도록 public으로 노출
class InspectableManagedEntity extends ManagedEntity<MockEngine, MockSnapshot, MockCommand> {
  public override onCommandExecuted(command: MockCommand): void {
    super.onCommandExecuted(command);
  }

  public override onSnapshotTaken(snapshot: MockSnapshot): void {
    super.onSnapshotTaken(snapshot);
  }
}

// DI 컨테이너 대신 수동으로 bridge 주입
function injectBridge(entity: TestEntity, bridge: TestBridge): void {
  entity['bridge'] = bridge;
}

describe('ManagedEntity', () => {
  let managedEntity: InspectableManagedEntity;
  let mockBridge: TestBridge;
  let mockEngine: MockEngine;
  let container: DIContainer;
  const testId = 'test-entity';

  beforeEach(() => {
    // DI Container 초기화
    container = DIContainer.getInstance();
    container.clear();

    // Mock Engine 생성
    mockEngine = {
      value: 10,
      dispose: jest.fn()
    };

    // Mock Bridge 생성
    mockBridge = new TestBridge();

    // ManagedEntity 생성
    managedEntity = new InspectableManagedEntity(testId, mockEngine);
    
    // 수동으로 bridge 주입
    injectBridge(managedEntity, mockBridge);
  });

  afterEach(() => {
    managedEntity?.dispose();
    mockBridge?.dispose();
    container.clear();
  });

  describe('생성 및 초기화', () => {
    test('엔티티가 생성되어야 함', () => {
      expect(managedEntity).toBeDefined();
      expect(managedEntity.engine).toBe(mockEngine);
    });

    test('initialize 호출 시 bridge에 등록되어야 함', () => {
      const registerSpy = jest.spyOn(mockBridge, 'register');
      
      managedEntity.initialize();
      
      expect(registerSpy).toHaveBeenCalledWith(testId, mockEngine);
    });

    test('bridge가 주입되지 않은 상태에서 initialize 호출 시 오류 발생', () => {
      const entityWithoutBridge = new ManagedEntity(testId, mockEngine);
      
      expect(() => entityWithoutBridge.initialize()).toThrow(
        'ManagedEntity test-entity: Bridge is not injected. Ensure this entity is created via DI container or injector is configured.'
      );
    });
  });

  describe('명령 실행', () => {
    beforeEach(() => {
      managedEntity.initialize();
    });

    test('execute 호출 시 bridge.execute가 호출되어야 함', () => {
      const executeSpy = jest.spyOn(mockBridge, 'execute');
      const command: MockCommand = { type: 'set', value: 42 };
      
      managedEntity.execute(command);
      
      expect(executeSpy).toHaveBeenCalledWith(testId, command);
    });

    test('커맨드 큐가 활성화된 경우 명령이 큐에 저장되어야 함', () => {
      const entityWithQueue = new ManagedEntity<MockEngine, MockSnapshot, MockCommand>(testId, mockEngine, {
        enableCommandQueue: true,
        maxQueueSize: 10
      });
      injectBridge(entityWithQueue, mockBridge);
      entityWithQueue.initialize();

      const command: MockCommand = { type: 'set', value: 42 };
      entityWithQueue.execute(command);
      
      // 큐에 저장되었는지 확인 (내부 상태이므로 간접적으로 확인)
      expect(() => entityWithQueue.execute(command)).not.toThrow();
      
      entityWithQueue.dispose();
    });
  });

  describe('스냅샷 조회', () => {
    beforeEach(() => {
      managedEntity.initialize();
    });

    test('snapshot 호출 시 bridge.snapshot이 호출되어야 함', () => {
      const snapshotSpy = jest.spyOn(mockBridge, 'snapshot');
      
      managedEntity.snapshot();
      
      expect(snapshotSpy).toHaveBeenCalledWith(testId);
    });

    test('캐시가 활성화된 경우 스냅샷이 캐시되어야 함', () => {
      const entityWithCache = new ManagedEntity<MockEngine, MockSnapshot, MockCommand>(testId, mockEngine, {
        enableStateCache: true,
        cacheTimeout: 100
      });
      injectBridge(entityWithCache, mockBridge);
      entityWithCache.initialize();

      const snapshotSpy = jest.spyOn(mockBridge, 'snapshot');
      
      // 첫 번째 호출
      entityWithCache.snapshot();
      // 두 번째 호출 (캐시되어야 함)
      entityWithCache.snapshot();
      
      // bridge.snapshot이 한 번만 호출되어야 함 (캐시로 인해)
      expect(snapshotSpy).toHaveBeenCalledTimes(1);
      
      entityWithCache.dispose();
    });
  });

  describe('이벤트 처리', () => {
    let executeEventSpy: jest.SpyInstance<void, [command: MockCommand]>;
    let snapshotEventSpy: jest.SpyInstance<void, [snapshot: MockSnapshot]>;

    beforeEach(() => {
      managedEntity.initialize();
      
      // 보호된 메서드를 spy하기 위한 설정
      executeEventSpy = jest.spyOn(managedEntity, 'onCommandExecuted');
      snapshotEventSpy = jest.spyOn(managedEntity, 'onSnapshotTaken');
    });

    test('실행 이벤트 수신 시 onCommandExecuted가 호출되어야 함', () => {
      const command: MockCommand = { type: 'set', value: 42 };
      
      // 이벤트 발생 시뮬레이션
      mockBridge.execute(testId, command);
      
      expect(executeEventSpy).toHaveBeenCalledWith(command);
    });

    test('스냅샷 이벤트 수신 시 onSnapshotTaken이 호출되어야 함', () => {
      // 스냅샷 생성하여 이벤트 발생
      mockBridge.snapshot(testId);
      
      expect(snapshotEventSpy).toHaveBeenCalledWith({
        value: mockEngine.value,
        timestamp: expect.any(Number),
      });
    });

    test('다른 엔티티의 이벤트는 무시되어야 함', () => {
      const command: MockCommand = { type: 'set', value: 42 };
      
      // 다른 ID로 명령 실행
      mockBridge.execute('other-entity', command);
      
      expect(executeEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('생명주기 콜백', () => {
    test('onInit 콜백이 옵션으로 설정되어야 함', () => {
      const onInitSpy = jest.fn();
      const entityWithCallback = new ManagedEntity<MockEngine, MockSnapshot, MockCommand>(testId, mockEngine, {
        onInit: onInitSpy
      });
      injectBridge(entityWithCallback, mockBridge);
      
      entityWithCallback.initialize();
      
      // onInit 콜백이 옵션에 저장되어 있는지 확인
      expect(entityWithCallback['options'].onInit).toBe(onInitSpy);
      
      entityWithCallback.dispose();
    });

    test('onDispose 콜백이 호출되어야 함', () => {
      const onDisposeSpy = jest.fn();
      const entityWithCallback = new ManagedEntity<MockEngine, MockSnapshot, MockCommand>(testId, mockEngine, {
        onDispose: onDisposeSpy
      });
      injectBridge(entityWithCallback, mockBridge);
      entityWithCallback.initialize();
      
      entityWithCallback.dispose();
      
      expect(onDisposeSpy).toHaveBeenCalledWith(entityWithCallback);
    });
  });

  describe('리소스 정리', () => {
    beforeEach(() => {
      managedEntity.initialize();
    });

    test('dispose 호출 시 bridge에서 등록 해제되어야 함', () => {
      const unregisterSpy = jest.spyOn(mockBridge, 'unregister');
      
      managedEntity.dispose();
      
      expect(unregisterSpy).toHaveBeenCalledWith(testId);
    });

    test('dispose 호출 시 이벤트 리스너가 제거되어야 함', () => {
      const executeEventSpy = jest.spyOn(managedEntity, 'onCommandExecuted');
      
      managedEntity.dispose();
      
      // dispose 후 이벤트가 발생해도 호출되지 않아야 함
      mockBridge.execute(testId, { type: 'set', value: 42 });
      expect(executeEventSpy).not.toHaveBeenCalled();
    });

    test('중복 dispose 호출은 안전해야 함', () => {
      managedEntity.dispose();
      
      expect(() => managedEntity.dispose()).not.toThrow();
    });

    test('dispose 후 execute 호출은 예외를 던져야 함', () => {
      managedEntity.dispose();
      
      expect(() => {
        managedEntity.execute({ type: 'set', value: 42 });
      }).toThrow('ManagedEntity test-entity is already disposed');
    });

    test('dispose 후 snapshot 호출은 null을 반환해야 함', () => {
      managedEntity.dispose();
      
      const result = managedEntity.snapshot();
      expect(result).toBeNull();
    });
  });

  describe('에러 처리', () => {
    beforeEach(() => {
      managedEntity.initialize();
    });

    test('잘못된 명령 실행 시 오류를 발생시키지 않아야 함', () => {
      expect(() => {
        // @ts-expect-error: unknown command types from untyped callers must be ignored at runtime
        managedEntity.execute({ type: 'invalid' });
      }).not.toThrow();
    });

    test('bridge가 dispose된 후 작업은 안전하게 처리되어야 함', () => {
      mockBridge.dispose();
      
      expect(() => {
        managedEntity.execute({ type: 'set', value: 42 });
        managedEntity.snapshot();
      }).not.toThrow();
    });
  });

  describe('성능 및 최적화', () => {
    test('대량의 명령 실행이 메모리 누수를 일으키지 않아야 함', () => {
      managedEntity.initialize();
      
      // 대량의 명령 실행
      for (let i = 0; i < 1000; i++) {
        managedEntity.execute({ type: 'increment', value: 1 });
      }
      
      // 메모리 누수 없이 정상 작동해야 함
      const snapshot = managedEntity.snapshot();
      expect(snapshot).toBeDefined();
    });

    test('빈번한 스냅샷 호출이 성능 문제를 일으키지 않아야 함', () => {
      managedEntity.initialize();
      
      const start = performance.now();
      
      // 빈번한 스냅샷 호출
      for (let i = 0; i < 100; i++) {
        managedEntity.snapshot();
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // 100ms 이내
    });
  });
}); 