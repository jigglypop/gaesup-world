import { AbstractBridge } from '../../bridge/AbstractBridge';
import { CacheSnapshot } from '../bridge';

type TestEngine = {
  id?: string;
  label: string;
};

type TestSnapshot = {
  engineLabel: string;
  invocation: number;
  owner: string;
};

class ObjectSnapshotHarness {
  private invocationCount = 0;

  constructor(private readonly owner: string) {}

  @CacheSnapshot(16)
  snapshot(engine: TestEngine): TestSnapshot {
    this.invocationCount += 1;
    return {
      engineLabel: engine.label,
      invocation: this.invocationCount,
      owner: this.owner,
    };
  }
}

class PrimitiveSnapshotHarness {
  private invocationCount = 0;

  @CacheSnapshot(16)
  snapshot(key: string | number): { invocation: number; key: string | number } {
    this.invocationCount += 1;
    return { invocation: this.invocationCount, key };
  }
}

class EngineAwareSnapshotHarness {
  private readonly engines = new Map<string, TestEngine>();
  private invocationCount = 0;

  register(id: string, engine: TestEngine): void {
    this.engines.set(id, engine);
  }

  getEngine(id: string): TestEngine | undefined {
    return this.engines.get(id);
  }

  @CacheSnapshot(16)
  snapshot(id: string): TestSnapshot | null {
    const engine = this.getEngine(id);
    if (!engine) return null;

    this.invocationCount += 1;
    return {
      engineLabel: engine.label,
      invocation: this.invocationCount,
      owner: 'engine-aware',
    };
  }
}

const sharedSnapshotCache = CacheSnapshot(16);

class SharedDecoratorHarness {
  @sharedSnapshotCache
  first(key: string): string {
    return `first:${key}`;
  }

  @sharedSnapshotCache
  second(key: string): string {
    return `second:${key}`;
  }
}

type StackedCacheEngine = {
  label: string;
  dispose: () => void;
};

type StackedCacheCommand = {
  type: 'noop';
};

class StackedCacheBridge extends AbstractBridge<
  StackedCacheEngine,
  TestSnapshot,
  StackedCacheCommand
> {
  private invocationCount = 0;

  protected buildEngine(_id: string, ...args: unknown[]): StackedCacheEngine {
    const [label] = args;
    return {
      label: typeof label === 'string' ? label : 'unknown',
      dispose: jest.fn(),
    };
  }

  protected executeCommand(): void {}

  @CacheSnapshot(16)
  protected createSnapshot(engine: StackedCacheEngine): TestSnapshot {
    this.invocationCount += 1;
    return {
      engineLabel: engine.label,
      invocation: this.invocationCount,
      owner: 'stacked-bridge',
    };
  }

  @CacheSnapshot(16)
  override snapshot(id: string): Readonly<TestSnapshot> | null {
    return super.snapshot(id);
  }
}

describe('CacheSnapshot', () => {
  let now: number;

  beforeEach(() => {
    now = 100;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('isolates object engines within one bridge instance', () => {
    const bridge = new ObjectSnapshotHarness('bridge');
    const firstEngine = { label: 'first' };
    const secondEngine = { label: 'second' };

    const firstSnapshot = bridge.snapshot(firstEngine);
    const secondSnapshot = bridge.snapshot(secondEngine);

    expect(firstSnapshot).toEqual({ engineLabel: 'first', invocation: 1, owner: 'bridge' });
    expect(secondSnapshot).toEqual({ engineLabel: 'second', invocation: 2, owner: 'bridge' });
    expect(bridge.snapshot(firstEngine)).toBe(firstSnapshot);
  });

  test('isolates caches between bridge instances', () => {
    const engine = { label: 'shared' };
    const firstBridge = new ObjectSnapshotHarness('first-bridge');
    const secondBridge = new ObjectSnapshotHarness('second-bridge');

    const firstSnapshot = firstBridge.snapshot(engine);
    const secondSnapshot = secondBridge.snapshot(engine);

    expect(firstSnapshot.owner).toBe('first-bridge');
    expect(secondSnapshot.owner).toBe('second-bridge');
    expect(firstSnapshot).not.toBe(secondSnapshot);
  });

  test('recomputes when an engine object is replaced for the same entity', () => {
    const bridge = new ObjectSnapshotHarness('bridge');
    const originalEngine = { id: 'entity', label: 'original' };
    const replacementEngine = { id: 'entity', label: 'replacement' };

    const originalSnapshot = bridge.snapshot(originalEngine);
    const replacementSnapshot = bridge.snapshot(replacementEngine);

    expect(replacementSnapshot.invocation).toBe(2);
    expect(replacementSnapshot).not.toBe(originalSnapshot);
    expect(bridge.snapshot(replacementEngine)).toBe(replacementSnapshot);
  });

  test('resolves primitive bridge ids through the current engine identity', () => {
    const bridge = new EngineAwareSnapshotHarness();
    bridge.register('entity', { label: 'original' });

    const originalSnapshot = bridge.snapshot('entity');
    bridge.register('entity', { label: 'replacement' });
    const replacementSnapshot = bridge.snapshot('entity');

    expect(originalSnapshot?.engineLabel).toBe('original');
    expect(replacementSnapshot?.engineLabel).toBe('replacement');
    expect(replacementSnapshot?.invocation).toBe(2);
    expect(replacementSnapshot).not.toBe(originalSnapshot);
  });

  test('hits within the TTL and recomputes at the expiry boundary', () => {
    const bridge = new ObjectSnapshotHarness('bridge');
    const engine = { label: 'entity' };

    const firstSnapshot = bridge.snapshot(engine);
    now += 15;

    expect(bridge.snapshot(engine)).toBe(firstSnapshot);

    now += 1;
    const expiredSnapshot = bridge.snapshot(engine);

    expect(expiredSnapshot.invocation).toBe(2);
    expect(expiredSnapshot).not.toBe(firstSnapshot);
  });

  test('keeps primitive keys distinct and prunes expired entries', () => {
    const bridge = new PrimitiveSnapshotHarness();
    const staleSnapshot = bridge.snapshot('stale');

    expect(bridge.snapshot('stale')).toBe(staleSnapshot);
    expect(bridge.snapshot(1).key).toBe(1);
    expect(bridge.snapshot('1').key).toBe('1');

    now += 16;
    bridge.snapshot('active');
    now -= 16;

    expect(bridge.snapshot('stale').invocation).toBe(5);
  });

  test('isolates methods when the same decorator instance is reused', () => {
    const harness = new SharedDecoratorHarness();

    expect(harness.first('entity')).toBe('first:entity');
    expect(harness.second('entity')).toBe('second:entity');
    expect(harness.first('entity')).toBe('first:entity');
    expect(harness.second('entity')).toBe('second:entity');
  });

  test('preserves public event suppression and invalidates both cache layers on engine replacement', () => {
    const bridge = new StackedCacheBridge();
    const snapshotListener = jest.fn();
    bridge.on('snapshot', snapshotListener);

    expect(bridge.snapshot('entity')).toBeNull();
    expect(bridge.snapshot('entity')).toBeNull();
    expect(snapshotListener).not.toHaveBeenCalled();

    bridge.register('entity', 'original');

    const originalSnapshot = bridge.snapshot('entity');
    expect(bridge.snapshot('entity')).toBe(originalSnapshot);
    expect(snapshotListener).toHaveBeenCalledTimes(1);

    bridge.register('entity', 'replacement');
    const replacementSnapshot = bridge.snapshot('entity');

    expect(replacementSnapshot?.engineLabel).toBe('replacement');
    expect(replacementSnapshot?.invocation).toBe(2);
    expect(replacementSnapshot).not.toBe(originalSnapshot);
    expect(snapshotListener).toHaveBeenCalledTimes(2);
    bridge.dispose();
  });
});
