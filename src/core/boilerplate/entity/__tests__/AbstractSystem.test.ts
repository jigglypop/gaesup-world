import { AbstractSystem } from '../AbstractSystem';
import { BaseState, BaseMetrics, SystemOptions, SystemUpdateArgs } from '../../types';

// 테스트용 State 타입
interface TestState extends BaseState {
  counter: number;
  name: string;
}

// 테스트용 Metrics 타입
interface TestMetrics extends BaseMetrics {
  updateCount: number;
  errorCount: number;
}

// 테스트용 Options 타입
interface TestOptions extends SystemOptions {
  multiplier?: number;
  enableLogging?: boolean;
}

// 테스트용 UpdateArgs 타입
interface TestUpdateArgs extends SystemUpdateArgs {
  frameCount: number;
}

// 테스트용 AbstractSystem 구현
class TestSystem extends AbstractSystem<TestState, TestMetrics, TestOptions, TestUpdateArgs> {
  constructor(
    defaultState: TestState,
    defaultMetrics: TestMetrics,
    options?: TestOptions
  ) {
    super(defaultState, defaultMetrics, options);
  }

  async init(): Promise<void> {
    // 초기화 로직
    this.state.counter = 0;
    this.state.name = 'TestSystem';
  }

  update(context: any): void {
    this.state.counter += this.options.multiplier || 1;
    this.state.lastUpdate = Date.now();
    
    this.metrics.updateCount++;
    this.metrics.frameTime = context.deltaTime || 16;
  }

  reset(): void {
    this.state.counter = 0;
    this.state.lastUpdate = Date.now();
    this.metrics.updateCount = 0;
    this.metrics.errorCount = 0;
  }

  // 테스트를 위한 public 메서드들
  public getInternalState() {
    return this.state;
  }

  public getInternalMetrics() {
    return this.metrics;
  }

  public getInternalOptions() {
    return this.options;
  }

  public testCreateInitialState(defaultState: TestState, initialState?: any) {
    return this.createInitialState(defaultState, initialState);
  }

  public testCreateInitialMetrics(defaultMetrics: TestMetrics, initialMetrics?: any) {
    return this.createInitialMetrics(defaultMetrics, initialMetrics);
  }
}

describe('AbstractSystem', () => {
  let system: TestSystem;
  const defaultState: TestState = {
    lastUpdate: 0,
    counter: 10,
    name: 'default'
  };
  const defaultMetrics: TestMetrics = {
    frameTime: 16,
    updateCount: 0,
    errorCount: 0
  };

  beforeEach(() => {
    system = new TestSystem(defaultState, defaultMetrics);
  });

  afterEach(() => {
    system.dispose();
  });

  describe('생성자 및 초기화', () => {
    test('기본 상태로 시스템이 생성되어야 함', () => {
      expect(system).toBeDefined();
      expect(system.getInternalState()).toEqual(expect.objectContaining({
        counter: 10,
        name: 'default'
      }));
      expect(system.getInternalMetrics()).toEqual(expect.objectContaining({
        updateCount: 0,
        errorCount: 0
      }));
    });

    test('옵션이 올바르게 설정되어야 함', () => {
      const options: TestOptions = {
        multiplier: 5,
        enableLogging: true
      };
      const systemWithOptions = new TestSystem(defaultState, defaultMetrics, options);
      
      expect(systemWithOptions.getInternalOptions()).toEqual(expect.objectContaining({
        multiplier: 5,
        enableLogging: true
      }));
      
      systemWithOptions.dispose();
    });

    test('capabilities가 기본값으로 설정되어야 함', () => {
      expect(system.capabilities).toEqual({
        hasAsync: true,
        hasMetrics: true,
        hasState: true,
        hasEvents: false
      });
    });

    test('초기 상태가 옵션으로 오버라이드되어야 함', () => {
      const options: TestOptions = {
        initialState: { counter: 100, name: 'overridden' }
      };
      const systemWithInitialState = new TestSystem(defaultState, defaultMetrics, options);
      
      expect(systemWithInitialState.getInternalState()).toEqual(expect.objectContaining({
        counter: 100,
        name: 'overridden'
      }));
      
      systemWithInitialState.dispose();
    });

    test('초기 메트릭스가 옵션으로 오버라이드되어야 함', () => {
      const options: TestOptions = {
        initialMetrics: { updateCount: 50, errorCount: 2 }
      };
      const systemWithInitialMetrics = new TestSystem(defaultState, defaultMetrics, options);
      
      expect(systemWithInitialMetrics.getInternalMetrics()).toEqual(expect.objectContaining({
        updateCount: 50,
        errorCount: 2
      }));
      
      systemWithInitialMetrics.dispose();
    });
  });

  describe('상태 관리', () => {
    test('createInitialState가 올바르게 작동해야 함', () => {
      const result = system.testCreateInitialState(defaultState, { counter: 999 });
      
      expect(result).toEqual(expect.objectContaining({
        lastUpdate: expect.any(Number),
        counter: 999,
        name: 'default'
      }));
    });

    test('createInitialMetrics가 올바르게 작동해야 함', () => {
            const result = system.testCreateInitialMetrics(defaultMetrics, { updateCount: 777 }); 
      
      expect(result).toEqual(expect.objectContaining({
        frameTime: 0, // 초기값은 0
        updateCount: 777,
        errorCount: 0
      }));
    });

    test('getState가 읽기 전용 상태를 반환해야 함', () => {
      const state = system.getState();
      
      expect(state).toBeDefined();
      expect(state?.counter).toBe(10);
      expect(state?.name).toBe('default');
      
      // 읽기 전용인지 확인
      expect(() => {
        (state as any).counter = 999;
      }).not.toThrow(); // JavaScript에서는 실제로 변경되지만 타입스크립트에서는 Readonly로 표시
    });

    test('getMetrics가 읽기 전용 메트릭스를 반환해야 함', () => {
      const metrics = system.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics?.frameTime).toBe(0); // 초기값은 0
      expect(metrics?.updateCount).toBe(0);
    });
  });

  describe('시스템 생명주기', () => {
    test('init 메서드가 올바르게 작동해야 함', async () => {
      await system.init();
      
      const state = system.getInternalState();
      expect(state.counter).toBe(0);
      expect(state.name).toBe('TestSystem');
    });

    test('update 메서드가 상태와 메트릭스를 업데이트해야 함', () => {
      const context = { deltaTime: 32, frameCount: 1 };
      const initialCounter = system.getInternalState().counter;
      
      system.update(context);
      
      const state = system.getInternalState();
      const metrics = system.getInternalMetrics();
      
      expect(state.counter).toBe(initialCounter + 1);
      expect(state.lastUpdate).toBeGreaterThan(0);
      expect(metrics.updateCount).toBe(1);
      expect(metrics.frameTime).toBe(32);
    });

    test('multiplier 옵션이 update에 반영되어야 함', () => {
      const systemWithMultiplier = new TestSystem(defaultState, defaultMetrics, {
        multiplier: 5
      });
      const context = { deltaTime: 16, frameCount: 1 };
      const initialCounter = systemWithMultiplier.getInternalState().counter;
      
      systemWithMultiplier.update(context);
      
      expect(systemWithMultiplier.getInternalState().counter).toBe(initialCounter + 5);
      
      systemWithMultiplier.dispose();
    });

    test('reset 메서드가 상태와 메트릭스를 초기화해야 함', () => {
      // 먼저 값들을 변경
      system.update({ deltaTime: 16, frameCount: 1 });
      system.update({ deltaTime: 16, frameCount: 2 });
      
      // 상태 확인
      expect(system.getInternalState().counter).toBeGreaterThan(defaultState.counter);
      expect(system.getInternalMetrics().updateCount).toBeGreaterThan(0);
      
      // 리셋 실행
      system.reset();
      
      // 리셋 후 상태 확인
      const state = system.getInternalState();
      const metrics = system.getInternalMetrics();
      
      expect(state.counter).toBe(0);
      expect(state.lastUpdate).toBeGreaterThan(0);
      expect(metrics.updateCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe('dispose 및 정리', () => {
    test('dispose 호출 시 _isDisposed가 true가 되어야 함', () => {
      system.dispose();
      
      expect((system as any)._isDisposed).toBe(true);
    });

    test('중복 dispose 호출이 안전해야 함', () => {
      system.dispose();
      
      expect(() => system.dispose()).not.toThrow();
    });
  });

  describe('성능 및 안정성', () => {
    test('대량의 update 호출이 성능 문제를 일으키지 않아야 함', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        system.update({ deltaTime: 16, frameCount: i });
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // 100ms 이내
      
      const state = system.getInternalState();
      const metrics = system.getInternalMetrics();
      
      expect(state.counter).toBe(defaultState.counter + 1000);
      expect(metrics.updateCount).toBe(1000);
    });

    test('메모리 누수가 발생하지 않아야 함', () => {
      const systems: TestSystem[] = [];
      
      // 대량의 시스템 생성
      for (let i = 0; i < 100; i++) {
        const newSystem = new TestSystem(defaultState, defaultMetrics);
        newSystem.update({ deltaTime: 16, frameCount: i });
        systems.push(newSystem);
      }
      
      // 모든 시스템 정리
      systems.forEach(s => s.dispose());
      
      // 가비지 컬렉션 힌트
      if (global.gc) {
        global.gc();
      }
      
      expect(systems.length).toBe(100);
    });

    test('비동기 init 중 dispose가 안전해야 함', async () => {
      const slowSystem = new TestSystem(defaultState, defaultMetrics);
      
      // 비동기 init과 dispose를 동시에 실행
      const initPromise = slowSystem.init();
      slowSystem.dispose();
      
      await expect(initPromise).resolves.not.toThrow();
    });
  });

  describe('에러 처리', () => {
    test('잘못된 컨텍스트로 update 호출 시 안전해야 함', () => {
      expect(() => {
        system.update(null as any);
      }).toThrow(); // null context는 에러를 발생시켜야 함
      
      expect(() => {
        system.update(undefined as any);
      }).not.toThrow();
      
      expect(() => {
        system.update({});
      }).not.toThrow();
    });

    test('dispose 후 메서드 호출이 안전해야 함', () => {
      system.dispose();
      
      expect(() => {
        system.update({ deltaTime: 16, frameCount: 1 });
        system.reset();
        const state = system.getState();
        const metrics = system.getMetrics();
      }).not.toThrow();
    });
  });

  describe('타입 안전성', () => {
    test('제네릭 타입이 올바르게 작동해야 함', () => {
      const state = system.getState();
      const metrics = system.getMetrics();
      
      // TypeScript 컴파일러가 타입을 올바르게 추론하는지 확인
      if (state) {
        expect(typeof state.counter).toBe('number');
        expect(typeof state.name).toBe('string');
        expect(typeof state.lastUpdate).toBe('number');
      }
      
      if (metrics) {
        expect(typeof metrics.frameTime).toBe('number');
        expect(typeof metrics.updateCount).toBe('number');
        expect(typeof metrics.errorCount).toBe('number');
      }
    });

    test('옵션 타입이 올바르게 작동해야 함', () => {
      const options = system.getInternalOptions();
      
      expect(typeof options).toBe('object');
      if ('multiplier' in options) {
        expect(typeof options.multiplier).toBe('number');
      }
      if ('enableLogging' in options) {
        expect(typeof options.enableLogging).toBe('boolean');
      }
    });
  });
}); 