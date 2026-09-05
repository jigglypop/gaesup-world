import { createRef, type RefObject } from 'react';

import { act, renderHook } from '@testing-library/react';

import { AbstractBridge } from '../../bridge/AbstractBridge';
import type { ManagedEntity } from '../../entity/ManagedEntity';
import type { IDisposable, RuntimeValue } from '../../types';
import { useBatchManagedEntities } from '../useManagedEntity';

type MockSnapshot = {
  id: string;
};

type MockCommand = {
  type: 'noop';
};

type MockFrameState = {
  clock: {
    elapsedTime: number;
  };
};

type MockFrameHandler = (state: MockFrameState, delta: number) => void;

type MockManagedEntity = {
  id: string;
  engine: MockEngine;
  initialize: jest.Mock<void, []>;
  dispose: jest.Mock<void, []>;
  getId: () => string;
};

const mockUseFrame = jest.fn();
const mockInjectProperties = jest.fn();
const mockCreatedEntities: MockManagedEntity[] = [];
const mockManagedEntityConstructor = jest.fn((id: string, engine: MockEngine) => {
  const entity: MockManagedEntity = {
    id,
    engine,
    initialize: jest.fn(),
    dispose: jest.fn(),
    getId: () => id,
  };
  mockCreatedEntities.push(entity);
  return entity;
});

jest.mock('@react-three/fiber', () => ({
  useFrame: (callback: unknown, priority?: number) => mockUseFrame(callback, priority),
}));

jest.mock('../../di', () => ({
  DIContainer: {
    getInstance: () => ({
      injectProperties: (instance: unknown) => mockInjectProperties(instance),
    }),
  },
}));

jest.mock('../../entity/ManagedEntity', () => ({
  ManagedEntity: function MockManagedEntityConstructor(id: string, engine: MockEngine) {
    return mockManagedEntityConstructor(id, engine);
  },
}));

class MockEngine implements IDisposable {
  disposed = false;

  dispose(): void {
    this.disposed = true;
  }
}

class MockBridge extends AbstractBridge<MockEngine, MockSnapshot, MockCommand> {
  override notifyListeners = jest.fn();

  protected override buildEngine(_id: string, ...args: RuntimeValue[]): MockEngine | null {
    const engine = args[0];
    return engine instanceof MockEngine ? engine : null;
  }

  protected override executeCommand(
    engine: MockEngine,
    command: MockCommand,
    id: string,
  ): void {
    void engine;
    void command;
    void id;
  }

  protected override createSnapshot(engine: MockEngine, id: string): MockSnapshot {
    void engine;
    return { id };
  }
}

type BatchEntry = {
  id: string;
  ref: RefObject<MockEngine>;
};

function createEngineRef(): RefObject<MockEngine> {
  const ref = createRef<MockEngine>();
  ref.current = new MockEngine();
  return ref;
}

function getCreatedEntity(id: string): MockManagedEntity {
  const entity = mockCreatedEntities.find((candidate) => candidate.id === id);
  if (!entity) throw new Error(`Expected managed entity ${id} to exist`);
  return entity;
}

describe('useBatchManagedEntities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatedEntities.length = 0;
  });

  test('owns entities by ID across add, remove, and reorder with one frame hook', () => {
    const bridge = new MockBridge();
    const aRef = createEngineRef();
    const bRef = createEngineRef();
    const cRef = createEngineRef();
    const onInit = jest.fn();
    const onDispose = jest.fn();
    const onRegister = jest.fn(() => jest.fn());
    const onUnregister = jest.fn();
    const frameCallback = jest.fn();
    const initialEntries: BatchEntry[] = [
      { id: 'a', ref: aRef },
      { id: 'b', ref: bRef },
    ];
    const { result, rerender, unmount } = renderHook(
      ({ entries }: { entries: BatchEntry[] }) =>
        useBatchManagedEntities(bridge, entries, {
          frameCallback,
          onDispose,
          onInit,
          onRegister,
          onUnregister,
        }),
      { initialProps: { entries: initialEntries } },
    );

    expect(result.current.map((entity) => entity?.getId())).toEqual(['a', 'b']);
    expect(mockManagedEntityConstructor).toHaveBeenCalledTimes(2);
    expect(onInit).toHaveBeenCalledTimes(2);
    expect(onRegister).toHaveBeenCalledTimes(2);

    const aEntity = getCreatedEntity('a');
    const bEntity = getCreatedEntity('b');
    expect(aEntity.initialize).toHaveBeenCalledTimes(1);
    expect(bEntity.initialize).toHaveBeenCalledTimes(1);
    mockUseFrame.mockClear();
    rerender({
      entries: [
        { id: 'b', ref: bRef },
        { id: 'a', ref: aRef },
      ],
    });

    expect(result.current).toEqual([
      bEntity as unknown as ManagedEntity<MockEngine, MockSnapshot, MockCommand>,
      aEntity as unknown as ManagedEntity<MockEngine, MockSnapshot, MockCommand>,
    ]);
    expect(mockManagedEntityConstructor).toHaveBeenCalledTimes(2);
    expect(aEntity.dispose).not.toHaveBeenCalled();
    expect(bEntity.dispose).not.toHaveBeenCalled();
    expect(mockUseFrame).toHaveBeenCalledTimes(1);

    const frameHandler = mockUseFrame.mock.calls[0]?.[0] as MockFrameHandler | undefined;
    expect(frameHandler).toBeDefined();
    act(() => frameHandler?.({ clock: { elapsedTime: 1 } }, 0.016));
    expect(bridge.notifyListeners.mock.calls.map(([id]) => id)).toEqual(['b', 'a']);
    expect(frameCallback).toHaveBeenCalledTimes(2);

    rerender({
      entries: [
        { id: 'b', ref: bRef },
        { id: 'c', ref: cRef },
      ],
    });

    const cEntity = getCreatedEntity('c');
    expect(result.current.map((entity) => entity?.getId())).toEqual(['b', 'c']);
    expect(aEntity.dispose).toHaveBeenCalledTimes(1);
    expect(bEntity.dispose).not.toHaveBeenCalled();
    expect(cEntity.dispose).not.toHaveBeenCalled();
    expect(onDispose).toHaveBeenCalledTimes(1);
    expect(onUnregister).toHaveBeenCalledTimes(1);
    expect(mockManagedEntityConstructor).toHaveBeenCalledTimes(3);

    unmount();
    expect(aEntity.dispose).toHaveBeenCalledTimes(1);
    expect(bEntity.dispose).toHaveBeenCalledTimes(1);
    expect(cEntity.dispose).toHaveBeenCalledTimes(1);
    expect(onDispose).toHaveBeenCalledTimes(3);
    expect(onUnregister).toHaveBeenCalledTimes(3);
  });

  test('replaces only the entity whose engine changes under a stable ID', () => {
    const bridge = new MockBridge();
    const firstRef = createEngineRef();
    const replacementRef = createEngineRef();
    const { result, rerender } = renderHook(
      ({ ref }: { ref: RefObject<MockEngine> }) =>
        useBatchManagedEntities(bridge, [{ id: 'stable', ref }]),
      { initialProps: { ref: firstRef } },
    );

    rerender({ ref: replacementRef });

    expect(getCreatedEntity('stable').engine).toBe(firstRef.current);
    expect(mockCreatedEntities).toHaveLength(2);
    expect(mockCreatedEntities[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(mockCreatedEntities[1]?.engine).toBe(replacementRef.current);
    expect(mockCreatedEntities[1]?.initialize).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toBe(
      mockCreatedEntities[1] as unknown as ManagedEntity<MockEngine, MockSnapshot, MockCommand>,
    );
  });

  test('recreates records only after committed dependency values change', () => {
    const bridge = new MockBridge();
    const ref = createEngineRef();
    const firstDependency = { revision: 1 };
    const secondDependency = { revision: 2 };
    const { rerender } = renderHook(
      ({ dependency }: { dependency: RuntimeValue }) =>
        useBatchManagedEntities(bridge, [{ id: 'stable', ref }], {
          dependencies: [dependency],
        }),
      { initialProps: { dependency: firstDependency } },
    );

    const firstEntity = mockCreatedEntities[0];
    rerender({ dependency: firstDependency });
    expect(mockCreatedEntities).toHaveLength(1);
    expect(firstEntity?.dispose).not.toHaveBeenCalled();

    rerender({ dependency: secondDependency });
    expect(mockCreatedEntities).toHaveLength(2);
    expect(firstEntity?.dispose).toHaveBeenCalledTimes(1);
  });

  test('reconciles registration callbacks without recreating the entity', () => {
    const bridge = new MockBridge();
    const ref = createEngineRef();
    const firstCleanup = jest.fn();
    const secondCleanup = jest.fn();
    const firstOnRegister = jest.fn(() => firstCleanup);
    const secondOnRegister = jest.fn(() => secondCleanup);
    const firstOnUnregister = jest.fn();
    const secondOnUnregister = jest.fn();
    const { rerender, unmount } = renderHook(
      ({
        onRegister,
        onUnregister,
      }: {
        onRegister: (engine: MockEngine) => () => void;
        onUnregister: (engine: MockEngine) => void;
      }) =>
        useBatchManagedEntities(bridge, [{ id: 'stable', ref }], {
          onRegister,
          onUnregister,
        }),
      {
        initialProps: {
          onRegister: firstOnRegister,
          onUnregister: firstOnUnregister,
        },
      },
    );

    const entity = mockCreatedEntities[0];
    rerender({
      onRegister: secondOnRegister,
      onUnregister: secondOnUnregister,
    });

    expect(mockCreatedEntities).toHaveLength(1);
    expect(entity?.dispose).not.toHaveBeenCalled();
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(firstOnUnregister).toHaveBeenCalledWith(ref.current);
    expect(secondOnRegister).toHaveBeenCalledWith(ref.current);

    unmount();
    expect(secondCleanup).toHaveBeenCalledTimes(1);
    expect(secondOnUnregister).toHaveBeenCalledWith(ref.current);
    expect(entity?.dispose).toHaveBeenCalledTimes(1);
  });

  test('does not treat its publication rerender as an inline callback change', () => {
    const bridge = new MockBridge();
    const ref = createEngineRef();
    const registrationCleanup = jest.fn();
    const onRegister = jest.fn();
    const onUnregister = jest.fn();
    const { unmount } = renderHook(() =>
      useBatchManagedEntities(bridge, [{ id: 'stable', ref }], {
        onRegister: (engine) => {
          onRegister(engine);
          return registrationCleanup;
        },
        onUnregister: (engine) => onUnregister(engine),
      }),
    );

    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(registrationCleanup).not.toHaveBeenCalled();
    expect(onUnregister).not.toHaveBeenCalled();

    unmount();
    expect(registrationCleanup).toHaveBeenCalledTimes(1);
    expect(onUnregister).toHaveBeenCalledTimes(1);
  });

  test('uses the first engine and one lifecycle for duplicate IDs', () => {
    const bridge = new MockBridge();
    const firstRef = createEngineRef();
    const secondRef = createEngineRef();
    const frameCallback = jest.fn();
    const { result, unmount } = renderHook(() =>
      useBatchManagedEntities(
        bridge,
        [
          { id: 'duplicate', ref: firstRef },
          { id: 'duplicate', ref: secondRef },
        ],
        { frameCallback },
      ),
    );

    expect(mockCreatedEntities).toHaveLength(1);
    expect(mockCreatedEntities[0]?.engine).toBe(firstRef.current);
    expect(result.current[0]).toBe(result.current[1]);

    const frameHandler = mockUseFrame.mock.calls[mockUseFrame.mock.calls.length - 1]?.[0] as
      | MockFrameHandler
      | undefined;
    act(() => frameHandler?.({ clock: { elapsedTime: 1 } }, 0.016));
    expect(bridge.notifyListeners).toHaveBeenCalledTimes(1);
    expect(frameCallback).toHaveBeenCalledTimes(1);

    unmount();
    expect(mockCreatedEntities[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(firstRef.current?.disposed).toBe(true);
    expect(secondRef.current?.disposed).toBe(false);
  });

  test('starts a newly added entity on its own throttle cadence', () => {
    const bridge = new MockBridge();
    const aRef = createEngineRef();
    const bRef = createEngineRef();
    const { rerender } = renderHook(
      ({ entries }: { entries: BatchEntry[] }) =>
        useBatchManagedEntities(bridge, entries, { throttle: 1_000 }),
      { initialProps: { entries: [{ id: 'a', ref: aRef }] } },
    );
    let frameHandler = mockUseFrame.mock.calls[mockUseFrame.mock.calls.length - 1]?.[0] as
      | MockFrameHandler
      | undefined;

    act(() => frameHandler?.({ clock: { elapsedTime: 1 } }, 0.016));
    expect(bridge.notifyListeners.mock.calls.map(([id]) => id)).toEqual(['a']);

    rerender({
      entries: [
        { id: 'a', ref: aRef },
        { id: 'b', ref: bRef },
      ],
    });
    frameHandler = mockUseFrame.mock.calls[mockUseFrame.mock.calls.length - 1]?.[0] as
      | MockFrameHandler
      | undefined;
    bridge.notifyListeners.mockClear();

    act(() => frameHandler?.({ clock: { elapsedTime: 1.5 } }, 0.016));
    expect(bridge.notifyListeners.mock.calls.map(([id]) => id)).toEqual(['b']);

    act(() => frameHandler?.({ clock: { elapsedTime: 2.1 } }, 0.016));
    expect(bridge.notifyListeners.mock.calls.map(([id]) => id)).toEqual(['b', 'a']);
  });

  test('rolls back earlier creations when a later record fails to initialize', () => {
    const bridge = new MockBridge();
    const aRef = createEngineRef();
    const bRef = createEngineRef();
    const registrationCleanups = [jest.fn(), jest.fn()];
    const onDispose = jest.fn();
    const onRegister = jest
      .fn<() => void, [MockEngine]>()
      .mockReturnValueOnce(registrationCleanups[0])
      .mockReturnValueOnce(registrationCleanups[1]);
    const onUnregister = jest.fn();
    const onInit = jest.fn(
      (entity: ManagedEntity<MockEngine, MockSnapshot, MockCommand>) => {
        if (entity.getId() === 'b') throw new Error('initialize b');
      },
    );

    expect(() =>
      renderHook(() =>
        useBatchManagedEntities(
          bridge,
          [
            { id: 'a', ref: aRef },
            { id: 'b', ref: bRef },
          ],
          { onDispose, onInit, onRegister, onUnregister },
        ),
      ),
    ).toThrow('initialize b');

    expect(mockCreatedEntities).toHaveLength(2);
    expect(mockCreatedEntities[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(mockCreatedEntities[1]?.dispose).toHaveBeenCalledTimes(1);
    expect(registrationCleanups[0]).not.toHaveBeenCalled();
    expect(registrationCleanups[1]).not.toHaveBeenCalled();
    expect(onRegister).not.toHaveBeenCalled();
    expect(onDispose).toHaveBeenCalledTimes(2);
    expect(onUnregister).not.toHaveBeenCalled();
    expect(aRef.current?.disposed).toBe(true);
    expect(bRef.current?.disposed).toBe(true);
  });

  test('disposes every record before rethrowing the first unmount error', () => {
    const bridge = new MockBridge();
    const aRef = createEngineRef();
    const bRef = createEngineRef();
    const registrationCleanups = [jest.fn(), jest.fn()];
    const onRegister = jest
      .fn<() => void, [MockEngine]>()
      .mockReturnValueOnce(registrationCleanups[0])
      .mockReturnValueOnce(registrationCleanups[1]);
    const onUnregister = jest.fn();
    const onDispose = jest.fn((entity: ManagedEntity<MockEngine, MockSnapshot, MockCommand>) => {
      if (entity.getId() === 'a') throw new Error('dispose a');
    });
    const { unmount } = renderHook(() =>
      useBatchManagedEntities(
        bridge,
        [
          { id: 'a', ref: aRef },
          { id: 'b', ref: bRef },
        ],
        { onDispose, onRegister, onUnregister },
      ),
    );

    expect(() => unmount()).toThrow('dispose a');
    expect(mockCreatedEntities).toHaveLength(2);
    expect(mockCreatedEntities[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(mockCreatedEntities[1]?.dispose).toHaveBeenCalledTimes(1);
    expect(registrationCleanups[0]).toHaveBeenCalledTimes(1);
    expect(registrationCleanups[1]).toHaveBeenCalledTimes(1);
    expect(onUnregister).toHaveBeenCalledTimes(2);
    expect(aRef.current?.disposed).toBe(true);
    expect(bRef.current?.disposed).toBe(true);
  });
});
