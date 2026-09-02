import type {
  BaseMetrics,
  BaseState,
  RuntimeRecord,
  SystemOptions,
  SystemUpdateArgs,
} from '../../types';
import { AbstractSystem } from '../AbstractSystem';
import type { SystemContext } from '../BaseSystem';

type TestState = BaseState & {
  configuredValue: number;
  runtimeValue: number;
  nested: { value: number };
};

type TestMetrics = BaseMetrics & {
  configuredValue: number;
  runtimeValue: number;
  nested: { value: number };
};

type TestInitializer<ValueType> =
  | ValueType
  | ((overrides?: RuntimeRecord) => ValueType);

class TestSystem extends AbstractSystem<TestState, TestMetrics> {
  resetCount = 0;

  constructor(
    defaultState: TestInitializer<TestState>,
    defaultMetrics: TestInitializer<TestMetrics>,
    options?: SystemOptions,
  ) {
    super(defaultState, defaultMetrics, options);
  }

  mutateState(mutator: (state: TestState) => void): void {
    mutator(this.state);
  }

  mutateMetrics(mutator: (metrics: TestMetrics) => void): void {
    mutator(this.metrics);
  }

  protected createUpdateArgs(context: SystemContext): SystemUpdateArgs {
    return context;
  }

  protected performUpdate(args: SystemUpdateArgs): void {
    this.state.runtimeValue += args.deltaTime;
    this.metrics.runtimeValue += args.deltaTime;
  }

  protected onReset(): void {
    this.resetCount++;
  }
}

const UPDATE_CONTEXT: SystemContext = {
  deltaTime: 1,
  totalTime: 1,
  frameCount: 1,
};

describe('AbstractSystem initialization', () => {
  test('preserves legacy object reset semantics and override precedence', () => {
    const nestedState = { value: 1 };
    const nestedMetrics = { value: 2 };
    const system = new TestSystem(
      {
        lastUpdate: 99,
        configuredValue: 1,
        runtimeValue: 2,
        nested: nestedState,
      },
      {
        frameTime: 99,
        configuredValue: 3,
        runtimeValue: 4,
        nested: nestedMetrics,
      },
      {
        initialState: { configuredValue: 10, lastUpdate: 88 },
        initialMetrics: { configuredValue: 20, frameTime: 88 },
      },
    );

    system.mutateState((state) => {
      state.configuredValue = 11;
      state.runtimeValue = 12;
      state.nested.value = 13;
    });
    system.mutateMetrics((metrics) => {
      metrics.configuredValue = 21;
      metrics.runtimeValue = 22;
      metrics.nested.value = 23;
    });
    system.update(UPDATE_CONTEXT);

    const previousState = system.getState();
    const previousMetrics = system.getMetrics();

    system.reset();

    expect(system.getState()).not.toBe(previousState);
    expect(system.getMetrics()).not.toBe(previousMetrics);
    expect(system.getState()).toEqual({
      lastUpdate: 0,
      configuredValue: 10,
      runtimeValue: 13,
      nested: nestedState,
    });
    expect(system.getMetrics()).toEqual({
      frameTime: 0,
      configuredValue: 20,
      runtimeValue: 23,
      nested: nestedMetrics,
    });
    expect(system.updateCount).toBe(0);
    expect(system.resetCount).toBe(1);
  });

  test('initializer reset restores configured seeds with fresh references', () => {
    let stateCalls = 0;
    let metricsCalls = 0;
    const createState = (overrides?: RuntimeRecord): TestState => {
      stateCalls++;
      return {
        lastUpdate: 99,
        configuredValue:
          typeof overrides?.configuredValue === 'number'
            ? overrides.configuredValue
            : 1,
        runtimeValue: 2,
        nested: { value: 3 },
      };
    };
    const createMetrics = (overrides?: RuntimeRecord): TestMetrics => {
      metricsCalls++;
      return {
        frameTime: 99,
        configuredValue:
          typeof overrides?.configuredValue === 'number'
            ? overrides.configuredValue
            : 4,
        runtimeValue: 5,
        nested: { value: 6 },
      };
    };
    const system = new TestSystem(createState, createMetrics, {
      initialState: { configuredValue: 10 },
      initialMetrics: { configuredValue: 20 },
    });

    const initialState = system.getState();
    const initialMetrics = system.getMetrics();
    system.mutateState((state) => {
      state.configuredValue = 11;
      state.runtimeValue = 12;
      state.nested.value = 13;
    });
    system.mutateMetrics((metrics) => {
      metrics.configuredValue = 21;
      metrics.runtimeValue = 22;
      metrics.nested.value = 23;
    });
    system.update(UPDATE_CONTEXT);

    system.reset();

    expect(system.getState()).toEqual({
      lastUpdate: 0,
      configuredValue: 10,
      runtimeValue: 2,
      nested: { value: 3 },
    });
    expect(system.getMetrics()).toEqual({
      frameTime: 0,
      configuredValue: 20,
      runtimeValue: 5,
      nested: { value: 6 },
    });
    expect(system.getState()).not.toBe(initialState);
    expect(system.getState().nested).not.toBe(initialState.nested);
    expect(system.getMetrics()).not.toBe(initialMetrics);
    expect(system.getMetrics().nested).not.toBe(initialMetrics.nested);
    expect(system.updateCount).toBe(0);
    expect(stateCalls).toBe(2);
    expect(metricsCalls).toBe(2);
  });

  test('keeps both state and metrics unchanged when metrics initialization fails', () => {
    let shouldFailMetrics = false;
    const system = new TestSystem(
      () => ({
        lastUpdate: 0,
        configuredValue: 1,
        runtimeValue: 2,
        nested: { value: 3 },
      }),
      () => {
        if (shouldFailMetrics) {
          throw new Error('metrics initialization failed');
        }
        return {
          frameTime: 0,
          configuredValue: 4,
          runtimeValue: 5,
          nested: { value: 6 },
        };
      },
    );

    system.mutateState((state) => {
      state.nested.value = 13;
    });
    system.mutateMetrics((metrics) => {
      metrics.nested.value = 16;
    });
    system.update(UPDATE_CONTEXT);

    const previousState = system.getState();
    const previousMetrics = system.getMetrics();
    const previousLastUpdate = previousState.lastUpdate;
    const previousFrameTime = previousMetrics.frameTime;
    shouldFailMetrics = true;

    expect(() => system.reset()).not.toThrow();
    expect(system.getState()).toBe(previousState);
    expect(system.getMetrics()).toBe(previousMetrics);
    expect(system.getState()).toEqual({
      lastUpdate: previousLastUpdate,
      configuredValue: 1,
      runtimeValue: 3,
      nested: { value: 13 },
    });
    expect(system.getMetrics()).toEqual({
      frameTime: previousFrameTime,
      configuredValue: 4,
      runtimeValue: 6,
      nested: { value: 16 },
    });
    expect(system.updateCount).toBe(1);
    expect(system.resetCount).toBe(0);
  });
});
