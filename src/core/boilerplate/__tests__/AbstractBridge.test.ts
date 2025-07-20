import { AbstractBridge } from '../bridge/AbstractBridge';
import { IDisposable, BridgeEvent } from '../types';

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

// 테스트용 AbstractBridge 구현
class TestBridge extends AbstractBridge<MockEngine, MockSnapshot, MockCommand> {
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

describe('AbstractBridge', () => {
  let bridge: TestBridge;
  const testId = 'test-entity';

  beforeEach(() => {
    bridge = new TestBridge();
  });

  afterEach(() => {
    bridge.dispose();
  });

  describe('엔진 등록 및 관리', () => {
    test('엔진을 등록할 수 있어야 함', () => {
      bridge.register(testId, 42);
      const engine = bridge.getEngine(testId);
      
      expect(engine).toBeDefined();
      expect(engine?.value).toBe(42);
    });

    test('동일한 ID로 중복 등록 시 기존 엔진을 대체해야 함', () => {
      bridge.register(testId, 10);
      const firstEngine = bridge.getEngine(testId);
      
      bridge.register(testId, 20);
      const secondEngine = bridge.getEngine(testId);
      
      expect(firstEngine?.dispose).toHaveBeenCalled();
      expect(secondEngine?.value).toBe(20);
    });

    test('엔진을 등록 해제할 수 있어야 함', () => {
      bridge.register(testId, 42);
      const engine = bridge.getEngine(testId);
      
      bridge.unregister(testId);
      
      expect(bridge.getEngine(testId)).toBeUndefined();
      expect(engine?.dispose).toHaveBeenCalled();
    });

    test('존재하지 않는 엔진 등록 해제는 오류를 발생시키지 않아야 함', () => {
      expect(() => bridge.unregister('nonexistent')).not.toThrow();
    });
  });

  describe('명령 실행', () => {
    beforeEach(() => {
      bridge.register(testId, 10);
    });

    test('등록된 엔진에 명령을 실행할 수 있어야 함', () => {
      bridge.execute(testId, { type: 'set', value: 100 });
      
      const snapshot = bridge.snapshot(testId);
      expect(snapshot?.value).toBe(100);
    });

    test('여러 명령을 순차적으로 실행할 수 있어야 함', () => {
      bridge.execute(testId, { type: 'set', value: 50 });
      bridge.execute(testId, { type: 'increment', value: 5 });
      bridge.execute(testId, { type: 'increment' }); // 기본값 1
      
      const snapshot = bridge.snapshot(testId);
      expect(snapshot?.value).toBe(56);
    });

    test('존재하지 않는 엔진에 명령 실행 시 오류를 발생시키지 않아야 함', () => {
      expect(() => {
        bridge.execute('nonexistent', { type: 'set', value: 100 });
      }).not.toThrow();
    });
  });

  describe('스냅샷 생성', () => {
    beforeEach(() => {
      bridge.register(testId, 42);
    });

    test('등록된 엔진의 스냅샷을 생성할 수 있어야 함', () => {
      const snapshot = bridge.snapshot(testId);
      
      expect(snapshot).toBeDefined();
      expect(snapshot?.value).toBe(42);
      expect(snapshot?.timestamp).toBeGreaterThan(0);
    });

    test('존재하지 않는 엔진의 스냅샷은 null을 반환해야 함', () => {
      const snapshot = bridge.snapshot('nonexistent');
      expect(snapshot).toBeNull();
    });
  });

  describe('이벤트 시스템', () => {
    test('등록 이벤트가 발생해야 함', () => {
      const listener = jest.fn();
      bridge.on('register', listener);
      
      bridge.register(testId, 42);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'register',
          id: testId,
          timestamp: expect.any(Number)
        })
      );
    });

    test('실행 이벤트가 발생해야 함', () => {
      const listener = jest.fn();
      bridge.register(testId, 42);
      bridge.on('execute', listener);
      
      const command = { type: 'set', value: 100 } as MockCommand;
      bridge.execute(testId, command);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'execute',
          id: testId,
          data: expect.objectContaining({ command })
        })
      );
    });

    test('스냅샷 이벤트가 발생해야 함', () => {
      const listener = jest.fn();
      bridge.register(testId, 42);
      bridge.on('snapshot', listener);
      
      bridge.snapshot(testId);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'snapshot',
          id: testId,
          data: expect.objectContaining({
            snapshot: expect.objectContaining({ value: 42 })
          })
        })
      );
    });

    test('등록 해제 이벤트가 발생해야 함', () => {
      const listener = jest.fn();
      bridge.register(testId, 42);
      bridge.on('unregister', listener);
      
      bridge.unregister(testId);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'unregister',
          id: testId
        })
      );
    });

    test('이벤트 리스너를 제거할 수 있어야 함', () => {
      const listener = jest.fn();
      const unsubscribe = bridge.on('register', listener);
      
      unsubscribe();
      bridge.register(testId, 42);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('미들웨어 시스템', () => {
    test('미들웨어를 추가하고 실행할 수 있어야 함', () => {
      const middleware = jest.fn((event, next) => {
        next();
      });
      
      bridge.use(middleware);
      bridge.register(testId, 42);
      
      expect(middleware).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'register' }),
        expect.any(Function)
      );
    });

    test('여러 미들웨어가 순서대로 실행되어야 함', () => {
      const calls: number[] = [];
      
      bridge.use((event, next) => {
        calls.push(1);
        next();
      });
      
      bridge.use((event, next) => {
        calls.push(2);
        next();
      });
      
      bridge.register(testId, 42);
      
      expect(calls).toEqual([1, 2]);
    });

    test('미들웨어에서 next를 호출하지 않으면 체인이 중단되어야 함', () => {
      const middleware1 = jest.fn((event, next) => {
        // next()를 호출하지 않음
      });
      const middleware2 = jest.fn((event, next) => {
        next();
      });
      
      bridge.use(middleware1);
      bridge.use(middleware2);
      bridge.register(testId, 42);
      
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).not.toHaveBeenCalled();
    });
  });

  describe('스냅샷 변경 알림', () => {
    test('스냅샷 변경 리스너를 등록하고 알림을 받을 수 있어야 함', () => {
      const listener = jest.fn();
      bridge.register(testId, 42);
      
      const unsubscribe = bridge.subscribe(listener);
      bridge.notifyListeners(testId);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ value: 42 }),
        testId
      );
      
      unsubscribe();
      bridge.notifyListeners(testId);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('존재하지 않는 엔진에 대한 알림은 무시되어야 함', () => {
      const listener = jest.fn();
      bridge.subscribe(listener);
      
      bridge.notifyListeners('nonexistent');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('리소스 정리', () => {
    test('dispose 호출 시 모든 엔진을 정리해야 함', () => {
      bridge.register('engine1', 10);
      bridge.register('engine2', 20);
      
      const engine1 = bridge.getEngine('engine1');
      const engine2 = bridge.getEngine('engine2');
      
      bridge.dispose();
      
      expect(engine1?.dispose).toHaveBeenCalled();
      expect(engine2?.dispose).toHaveBeenCalled();
      expect(bridge.getEngine('engine1')).toBeUndefined();
      expect(bridge.getEngine('engine2')).toBeUndefined();
    });

    test('dispose 호출 시 모든 이벤트 리스너와 미들웨어를 정리해야 함', () => {
      const listener = jest.fn();
      const middleware = jest.fn((event, next) => next());
      
      bridge.on('register', listener);
      bridge.use(middleware);
      bridge.dispose();
      
      bridge.register(testId, 42);
      
      expect(listener).not.toHaveBeenCalled();
      expect(middleware).not.toHaveBeenCalled();
    });
  });
}); 