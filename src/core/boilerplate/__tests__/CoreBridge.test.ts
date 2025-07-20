import 'reflect-metadata';
import { CoreBridge } from '../bridge/CoreBridge';
import { IDisposable } from '../types';

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

// 테스트용 CoreBridge 구현
class TestCoreBridge extends CoreBridge<MockEngine, MockSnapshot, MockCommand> {
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

// 메트릭스 활성화 테스트용 브릿지
class MetricsEnabledBridge extends TestCoreBridge {
  constructor() {
    super();
    // 메트릭스 메타데이터 설정
    Reflect.defineMetadata('enableMetrics', true, Object.getPrototypeOf(this));
  }
}

// 이벤트 로그 활성화 테스트용 브릿지
class EventLogEnabledBridge extends TestCoreBridge {
  constructor() {
    super();
    // 이벤트 로그 메타데이터 설정
    Reflect.defineMetadata('enableEventLog', true, Object.getPrototypeOf(this));
  }
}

describe('CoreBridge', () => {
  let bridge: TestCoreBridge;
  const testId = 'test-entity';

  beforeEach(() => {
    bridge = new TestCoreBridge();
  });

  afterEach(() => {
    bridge.dispose();
  });

  describe('기본 기능 상속', () => {
    test('AbstractBridge의 모든 기능을 상속해야 함', () => {
      // 엔진 등록
      bridge.register(testId, 42);
      expect(bridge.getEngine(testId)).toBeDefined();

      // 명령 실행
      bridge.execute(testId, { type: 'set', value: 100 });
      const snapshot = bridge.snapshot(testId);
      expect(snapshot?.value).toBe(100);

      // 등록 해제
      bridge.unregister(testId);
      expect(bridge.getEngine(testId)).toBeUndefined();
    });

    test('이벤트 시스템이 정상 작동해야 함', () => {
      const listener = jest.fn();
      bridge.on('register', listener);

      bridge.register(testId, 42);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'register',
          id: testId
        })
      );
    });

    test('미들웨어 시스템이 정상 작동해야 함', () => {
      const middleware = jest.fn((event, next) => next());
      bridge.use(middleware);

      bridge.register(testId, 42);

      expect(middleware).toHaveBeenCalled();
    });
  });

  describe('메트릭스 시스템', () => {
    test('메트릭스가 비활성화된 경우 로그가 출력되지 않아야 함', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const normalBridge = new TestCoreBridge();
      normalBridge.register(testId, 42);

      // 메트릭스 관련 로그가 없어야 함
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[Metrics]')
      );

      consoleSpy.mockRestore();
      normalBridge.dispose();
    });

    test('메트릭스가 활성화된 경우 적절한 로그가 출력되어야 함', () => {
      // NODE_ENV를 development로 설정
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const metricsBridge = new MetricsEnabledBridge();
      metricsBridge.register(testId, 42);

      // 메트릭스 로그가 출력되어야 함
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Metrics]')
      );

      consoleSpy.mockRestore();
      metricsBridge.dispose();
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('production 환경에서는 메트릭스 로그가 출력되지 않아야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const metricsBridge = new MetricsEnabledBridge();
      metricsBridge.register(testId, 42);

      // production에서는 로그가 출력되지 않아야 함
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[Metrics]')
      );

      consoleSpy.mockRestore();
      metricsBridge.dispose();
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('이벤트 로그 시스템', () => {
    test('이벤트 로그가 비활성화된 경우 이벤트 로그가 출력되지 않아야 함', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const normalBridge = new TestCoreBridge();
      normalBridge.register(testId, 42);
      normalBridge.execute(testId, { type: 'set', value: 100 });
      normalBridge.unregister(testId);

      // 이벤트 로그가 없어야 함
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[Event]')
      );

      consoleSpy.mockRestore();
      normalBridge.dispose();
    });

    test('이벤트 로그가 활성화된 경우 적절한 로그가 출력되어야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const eventLogBridge = new EventLogEnabledBridge();

      // 등록 이벤트 로그
      eventLogBridge.register(testId, 42);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Event] Registered entity')
      );

      // 실행 이벤트 로그
      eventLogBridge.execute(testId, { type: 'set', value: 100 });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Event] Executed command')
      );

      // 등록 해제 이벤트 로그
      eventLogBridge.unregister(testId);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Event] Unregistered entity')
      );

      consoleSpy.mockRestore();
      eventLogBridge.dispose();
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('로그 활성화 환경 변수로 제어할 수 있어야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalViteEnableLogs = process.env.VITE_ENABLE_BRIDGE_LOGS;
      
      process.env.NODE_ENV = 'development';
      process.env.VITE_ENABLE_BRIDGE_LOGS = 'false';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const eventLogBridge = new EventLogEnabledBridge();
      eventLogBridge.register(testId, 42);

      // 환경 변수로 비활성화되어 로그가 출력되지 않아야 함
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[Event]')
      );

      consoleSpy.mockRestore();
      eventLogBridge.dispose();
      process.env.NODE_ENV = originalNodeEnv;
      process.env.VITE_ENABLE_BRIDGE_LOGS = originalViteEnableLogs;
    });
  });

  describe('미들웨어와 로깅 시스템 통합', () => {
    test('메트릭스 미들웨어가 다른 미들웨어와 함께 작동해야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const customMiddleware = jest.fn((event, next) => next());

      const metricsBridge = new MetricsEnabledBridge();
      metricsBridge.use(customMiddleware);
      metricsBridge.register(testId, 42);

      // 메트릭스 로그와 커스텀 미들웨어가 모두 실행되어야 함
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Metrics]')
      );
      expect(customMiddleware).toHaveBeenCalled();

      consoleSpy.mockRestore();
      metricsBridge.dispose();
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('이벤트 로그 리스너가 다른 이벤트 리스너와 함께 작동해야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const customListener = jest.fn();

      const eventLogBridge = new EventLogEnabledBridge();
      eventLogBridge.on('register', customListener);
      eventLogBridge.register(testId, 42);

      // 이벤트 로그와 커스텀 리스너가 모두 실행되어야 함
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Event] Registered entity')
      );
      expect(customListener).toHaveBeenCalled();

      consoleSpy.mockRestore();
      eventLogBridge.dispose();
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('성능 최적화', () => {
    test('대량의 이벤트 처리 시 성능 문제가 없어야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const metricsBridge = new MetricsEnabledBridge();
      const start = performance.now();

      // 대량의 작업 수행
      for (let i = 0; i < 1000; i++) {
        metricsBridge.register(`entity-${i}`, i);
        metricsBridge.execute(`entity-${i}`, { type: 'increment', value: 1 });
        metricsBridge.snapshot(`entity-${i}`);
        metricsBridge.unregister(`entity-${i}`);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // 1초 이내

      metricsBridge.dispose();
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('메모리 누수가 발생하지 않아야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const eventLogBridge = new EventLogEnabledBridge();

      // 대량의 엔티티 등록/해제
      for (let i = 0; i < 100; i++) {
        eventLogBridge.register(`entity-${i}`, i);
        eventLogBridge.unregister(`entity-${i}`);
      }

      // 메모리 정리 확인
      eventLogBridge.dispose();
      expect(() => eventLogBridge.register('test', 1)).not.toThrow();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('에러 처리', () => {
    test('잘못된 메타데이터로 인한 오류가 발생하지 않아야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // 잘못된 메타데이터 설정
      const bridgeWithBadMetadata = new TestCoreBridge();
      Reflect.defineMetadata('enableMetrics', 'invalid', Object.getPrototypeOf(bridgeWithBadMetadata));

      expect(() => {
        bridgeWithBadMetadata.register(testId, 42);
      }).not.toThrow();

      bridgeWithBadMetadata.dispose();
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('console.log 오류가 발생해도 브릿지 기능에 영향을 주지 않아야 함', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // console.log를 오류를 던지도록 설정
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Console error');
      });

      const metricsBridge = new MetricsEnabledBridge();

      expect(() => {
        metricsBridge.register(testId, 42);
        metricsBridge.execute(testId, { type: 'set', value: 100 });
        const snapshot = metricsBridge.snapshot(testId);
        expect(snapshot?.value).toBe(100);
      }).not.toThrow();

      consoleSpy.mockRestore();
      metricsBridge.dispose();
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
}); 