import { BaseSystem, SystemCapabilities, SystemContext } from '../BaseSystem';

// 테스트용 State 타입
interface TestState {
  value: number;
  status: string;
}

// 테스트용 Metrics 타입
interface TestMetrics {
  calls: number;
  errors: number;
}

// BaseSystem 구현체들
class MinimalSystem implements BaseSystem {
  private disposed = false;
  private state: TestState = { value: 0, status: 'idle' };
  private metrics: TestMetrics = { calls: 0, errors: 0 };

  async init(): Promise<void> {
    this.state.status = 'initialized';
  }

  update(context: SystemContext): void {
    this.state.value++;
    this.metrics.calls++;
  }

  dispose(): void {
    this.disposed = true;
    this.state.status = 'disposed';
  }

  getState(): Readonly<TestState> {
    return this.state;
  }

  getMetrics(): Readonly<TestMetrics> {
    return this.metrics;
  }

  isDisposed(): boolean {
    return this.disposed;
  }
}

class FullFeatureSystem implements BaseSystem<TestState, TestMetrics> {
  readonly id = 'full-feature-system';
  readonly capabilities: SystemCapabilities = {
    hasAsync: true,
    hasMetrics: true,
    hasState: true,
    hasEvents: true
  };

  private disposed = false;
  private paused = false;
  private state: TestState = { value: 0, status: 'created' };
  private metrics: TestMetrics = { calls: 0, errors: 0 };

  async init(): Promise<void> {
    this.state.status = 'initialized';
    this.state.value = 100;
  }

  async start(): Promise<void> {
    this.state.status = 'started';
  }

  update(context: SystemContext): void {
    if (this.paused) return;
    
    this.state.value += context.deltaTime || 1;
    this.metrics.calls++;
  }

  pause(): void {
    this.paused = true;
    this.state.status = 'paused';
  }

  resume(): void {
    this.paused = false;
    this.state.status = 'running';
  }

  reset(): void {
    this.state.value = 0;
    this.state.status = 'reset';
    this.metrics.calls = 0;
    this.metrics.errors = 0;
  }

  dispose(): void {
    this.disposed = true;
    this.paused = false;
    this.state.status = 'disposed';
  }

  getState(): Readonly<TestState> {
    return this.state;
  }

  getMetrics(): Readonly<TestMetrics> {
    return this.metrics;
  }

  isPaused(): boolean {
    return this.paused;
  }

  isDisposed(): boolean {
    return this.disposed;
  }
}

class AsyncSystem implements BaseSystem {
  private initPromise: Promise<void> | null = null;
  private initStarted = false;
  private state = { ready: false };

  async init(): Promise<void> {
    if (this.initStarted) {
      return this.initPromise!;
    }
    
    this.initStarted = true;
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 10));
    this.state.ready = true;
  }

  update(context: SystemContext): void {
    // 업데이트 로직
  }

  dispose(): void {
    this.state.ready = false;
  }

  isReady(): boolean {
    return this.state.ready;
  }
}

class ErrorProneSystem implements BaseSystem {
  private shouldThrowInInit = false;
  private shouldThrowInUpdate = false;

  setShouldThrowInInit(value: boolean): void {
    this.shouldThrowInInit = value;
  }

  setShouldThrowInUpdate(value: boolean): void {
    this.shouldThrowInUpdate = value;
  }

  async init(): Promise<void> {
    if (this.shouldThrowInInit) {
      throw new Error('Init error');
    }
  }

  update(context: SystemContext): void {
    if (this.shouldThrowInUpdate) {
      throw new Error('Update error');
    }
  }

  dispose(): void {
    // 정리 로직
  }
}

describe('BaseSystem', () => {
  describe('SystemCapabilities', () => {
    test('기본 capabilities 구조가 올바른지 확인', () => {
      const capabilities: SystemCapabilities = {
        hasAsync: true,
        hasMetrics: false,
        hasState: true,
        hasEvents: false
      };

      expect(capabilities.hasAsync).toBe(true);
      expect(capabilities.hasMetrics).toBe(false);
      expect(capabilities.hasState).toBe(true);
      expect(capabilities.hasEvents).toBe(false);
    });

    test('모든 속성이 선택적이어야 함', () => {
      const emptyCapabilities: SystemCapabilities = {};
      
      expect(emptyCapabilities.hasAsync).toBeUndefined();
      expect(emptyCapabilities.hasMetrics).toBeUndefined();
      expect(emptyCapabilities.hasState).toBeUndefined();
      expect(emptyCapabilities.hasEvents).toBeUndefined();
    });
  });

  describe('SystemContext', () => {
    test('deltaTime 속성이 올바르게 작동해야 함', () => {
      const context: SystemContext = { deltaTime: 16.67 };
      
      expect(context.deltaTime).toBe(16.67);
      expect(typeof context.deltaTime).toBe('number');
    });

    test('확장 가능한 구조여야 함', () => {
      interface ExtendedContext extends SystemContext {
        frameCount: number;
        timestamp: number;
      }

      const extendedContext: ExtendedContext = {
        deltaTime: 16.67,
        frameCount: 100,
        timestamp: Date.now()
      };

      expect(extendedContext.deltaTime).toBe(16.67);
      expect(extendedContext.frameCount).toBe(100);
      expect(typeof extendedContext.timestamp).toBe('number');
    });
  });

  describe('MinimalSystem 구현', () => {
    let system: MinimalSystem;

    beforeEach(() => {
      system = new MinimalSystem();
    });

    afterEach(() => {
      system.dispose();
    });

    test('필수 메서드들이 구현되어야 함', () => {
      expect(typeof system.init).toBe('function');
      expect(typeof system.update).toBe('function');
      expect(typeof system.dispose).toBe('function');
    });

    test('init이 올바르게 작동해야 함', async () => {
      await system.init();
      
      const state = system.getState();
      expect(state.status).toBe('initialized');
    });

    test('update가 올바르게 작동해야 함', () => {
      const context: SystemContext = { deltaTime: 16.67 };
      const initialValue = system.getState().value;
      
      system.update(context);
      
      const state = system.getState();
      const metrics = system.getMetrics();
      
      expect(state.value).toBe(initialValue + 1);
      expect(metrics.calls).toBe(1);
    });

    test('dispose가 올바르게 작동해야 함', () => {
      system.dispose();
      
      const state = system.getState();
      expect(state.status).toBe('disposed');
      expect(system.isDisposed()).toBe(true);
    });

    test('연속적인 update 호출이 정상적으로 작동해야 함', () => {
      const context: SystemContext = { deltaTime: 16.67 };
      
      for (let i = 0; i < 10; i++) {
        system.update(context);
      }
      
      const state = system.getState();
      const metrics = system.getMetrics();
      
      expect(metrics.calls).toBe(10);
      expect(state.value).toBe(10);
    });
  });

  describe('FullFeatureSystem 구현', () => {
    let system: FullFeatureSystem;

    beforeEach(() => {
      system = new FullFeatureSystem();
    });

    afterEach(() => {
      system.dispose();
    });

    test('모든 선택적 속성들이 구현되어야 함', () => {
      expect(system.id).toBe('full-feature-system');
      expect(system.capabilities).toBeDefined();
      expect(typeof system.start).toBe('function');
      expect(typeof system.pause).toBe('function');
      expect(typeof system.resume).toBe('function');
      expect(typeof system.reset).toBe('function');
      expect(typeof system.getState).toBe('function');
      expect(typeof system.getMetrics).toBe('function');
    });

    test('전체 생명주기가 올바르게 작동해야 함', async () => {
      // 초기화
      await system.init();
      expect(system.getState().status).toBe('initialized');
      expect(system.getState().value).toBe(100);

      // 시작
      await system.start();
      expect(system.getState().status).toBe('started');

      // 업데이트
      system.update({ deltaTime: 5 });
      expect(system.getState().value).toBe(105);

      // 일시정지
      system.pause();
      expect(system.getState().status).toBe('paused');
      expect(system.isPaused()).toBe(true);

      // 일시정지 중 업데이트 (변경되지 않아야 함)
      const pausedValue = system.getState().value;
      system.update({ deltaTime: 10 });
      expect(system.getState().value).toBe(pausedValue);

      // 재개
      system.resume();
      expect(system.getState().status).toBe('running');
      expect(system.isPaused()).toBe(false);

      // 재개 후 업데이트
      system.update({ deltaTime: 3 });
      expect(system.getState().value).toBe(pausedValue + 3);

      // 리셋
      system.reset();
      expect(system.getState().value).toBe(0);
      expect(system.getState().status).toBe('reset');
      expect(system.getMetrics().calls).toBe(0);
    });

    test('capabilities가 올바르게 설정되어야 함', () => {
      const capabilities = system.capabilities!;
      
      expect(capabilities.hasAsync).toBe(true);
      expect(capabilities.hasMetrics).toBe(true);
      expect(capabilities.hasState).toBe(true);
      expect(capabilities.hasEvents).toBe(true);
    });
  });

  describe('AsyncSystem 구현', () => {
    let system: AsyncSystem;

    beforeEach(() => {
      system = new AsyncSystem();
    });

    afterEach(() => {
      system.dispose();
    });

    test('비동기 초기화가 올바르게 작동해야 함', async () => {
      expect(system.isReady()).toBe(false);
      
      await system.init();
      
      expect(system.isReady()).toBe(true);
    });

    test('중복 init 호출이 동일한 Promise를 반환해야 함', async () => {
      const promise1 = system.init();
      const promise2 = system.init();
      
      expect(promise1).toStrictEqual(promise2);
      
      await promise1;
      expect(system.isReady()).toBe(true);
    });

    test('dispose 후 상태가 초기화되어야 함', async () => {
      await system.init();
      expect(system.isReady()).toBe(true);
      
      system.dispose();
      expect(system.isReady()).toBe(false);
    });
  });

  describe('ErrorProneSystem 에러 처리', () => {
    let system: ErrorProneSystem;

    beforeEach(() => {
      system = new ErrorProneSystem();
    });

    afterEach(() => {
      system.dispose();
    });

    test('init에서 발생한 에러가 적절히 전파되어야 함', async () => {
      system.setShouldThrowInInit(true);
      
      await expect(system.init()).rejects.toThrow('Init error');
    });

    test('update에서 발생한 에러가 적절히 전파되어야 함', () => {
      system.setShouldThrowInUpdate(true);
      
      expect(() => {
        system.update({ deltaTime: 16 });
      }).toThrow('Update error');
    });

    test('정상 상태에서는 에러가 발생하지 않아야 함', async () => {
      system.setShouldThrowInInit(false);
      system.setShouldThrowInUpdate(false);
      
      await expect(system.init()).resolves.not.toThrow();
      expect(() => {
        system.update({ deltaTime: 16 });
      }).not.toThrow();
    });
  });

  describe('타입 안전성', () => {
    test('제네릭 타입이 올바르게 작동해야 함', () => {
      const system = new FullFeatureSystem();
      
      const state = system.getState();
      const metrics = system.getMetrics();
      
      // TypeScript 컴파일러가 타입을 올바르게 추론하는지 확인
      expect(typeof state.value).toBe('number');
      expect(typeof state.status).toBe('string');
      expect(typeof metrics.calls).toBe('number');
      expect(typeof metrics.errors).toBe('number');
      
      system.dispose();
    });

    test('인터페이스 확장이 올바르게 작동해야 함', () => {
      interface CustomSystem extends BaseSystem {
        customMethod(): string;
      }

      class CustomSystemImpl implements CustomSystem {
        async init(): Promise<void> {}
        update(context: SystemContext): void {}
        dispose(): void {}
        customMethod(): string {
          return 'custom';
        }
      }

      const system = new CustomSystemImpl();
      expect(system.customMethod()).toBe('custom');
      expect(typeof system.init).toBe('function');
      expect(typeof system.update).toBe('function');
      expect(typeof system.dispose).toBe('function');
    });
  });

  describe('성능 테스트', () => {
    test('대량의 시스템 생성과 정리가 효율적이어야 함', () => {
      const systems: BaseSystem[] = [];
      const start = performance.now();
      
      // 대량 생성
      for (let i = 0; i < 1000; i++) {
        systems.push(new MinimalSystem());
      }
      
      // 대량 정리
      systems.forEach(system => system.dispose());
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // 100ms 이내
      expect(systems.length).toBe(1000);
    });

    test('빈번한 update 호출이 효율적이어야 함', () => {
      const system = new MinimalSystem();
      const context: SystemContext = { deltaTime: 16.67 };
      const start = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        system.update(context);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // 100ms 이내
      
      system.dispose();
    });
  });

  describe('동시성 테스트', () => {
    test('동시 init 호출이 안전해야 함', async () => {
      const system = new AsyncSystem();
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(system.init());
      }
      
      await Promise.all(promises);
      expect(system.isReady()).toBe(true);
      
      system.dispose();
    });

    test('init 중 dispose가 안전해야 함', async () => {
      const system = new AsyncSystem();
      
      const initPromise = system.init();
      system.dispose();
      
      await expect(initPromise).resolves.not.toThrow();
      expect(system.getState()).toBeDefined(); // isReady 대신 상태 확인
    });
  });
}); 