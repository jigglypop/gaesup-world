import React, { StrictMode } from 'react';

import { act, cleanup, render } from '@testing-library/react';

import { logger, type GaesupRuntime, type SaveSystem } from 'gaesup-world';

import { loadWorldRuntime } from '../runtime';
import { WorldSystems } from '../world/useWorldSystems';

jest.mock('gaesup-world', () => {
  const actual = jest.requireActual('gaesup-world') as typeof import('gaesup-world');
  return {
    ...actual,
    useAudioStore: {
      setState: jest.fn(),
      getState: () => ({ stopBgm: jest.fn(), apply: jest.fn() }),
    },
    useAutoSave: jest.fn(),
    useCatalogTracker: jest.fn(),
    useDayChange: jest.fn(),
    useDecorationScore: jest.fn(),
    useEventsTicker: jest.fn(),
    useGameClock: jest.fn(),
    useHotbarKeyboard: jest.fn(),
    useQuestObjectiveTracker: jest.fn(),
    useWeatherTicker: jest.fn(),
  };
});

jest.mock('../runtime', () => ({
  dispatchWorldGameplayEvent: jest.fn(() => Promise.resolve()),
  loadWorldRuntime: jest.fn(),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve: ((value: T) => void) | undefined;
  let reject: ((error: unknown) => void) | undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return {
    promise,
    resolve: (value) => resolve?.(value),
    reject: (error) => reject?.(error),
  };
}

function createRuntime(
  save: SaveSystem,
  dispose: () => Promise<void> = () => Promise.resolve(),
): GaesupRuntime {
  return { save, dispose } as unknown as GaesupRuntime;
}

async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < 8; index += 1) {
    await Promise.resolve();
  }
}

const mockedLoadWorldRuntime = loadWorldRuntime as jest.MockedFunction<typeof loadWorldRuntime>;

describe('WorldSystems runtime lifecycle', () => {
  afterEach(async () => {
    cleanup();
    await flushMicrotasks();
    mockedLoadWorldRuntime.mockReset();
    jest.restoreAllMocks();
  });

  test('skips the discarded StrictMode load and runs only the active generation', async () => {
    const save = {} as SaveSystem;
    const activeLoad = createDeferred<boolean>();
    const operations: string[] = [];
    mockedLoadWorldRuntime.mockImplementationOnce(async () => {
      operations.push('load:start');
      await activeLoad.promise;
      operations.push('load:end');
      return true;
    });
    const runtime = createRuntime(save, async () => {
      operations.push('dispose');
    });
    const onRuntimeReady = jest.fn();

    const view = render(
      <StrictMode>
        <WorldSystems runtime={runtime} onRuntimeReady={onRuntimeReady} />
      </StrictMode>,
    );
    await act(flushMicrotasks);
    expect(operations).toEqual(['dispose', 'load:start']);
    expect(mockedLoadWorldRuntime).toHaveBeenCalledTimes(1);
    expect(onRuntimeReady).not.toHaveBeenCalled();

    await act(async () => {
      activeLoad.resolve(true);
      await flushMicrotasks();
    });
    expect(onRuntimeReady).toHaveBeenCalledTimes(1);

    view.unmount();
    await act(flushMicrotasks);
    expect(operations).toEqual(['dispose', 'load:start', 'load:end', 'dispose']);
  });

  test('blocks ready after unmount and disposes only after the pending load settles', async () => {
    const save = {} as SaveSystem;
    const load = createDeferred<boolean>();
    const operations: string[] = [];
    mockedLoadWorldRuntime.mockImplementationOnce(async () => {
      operations.push('load:start');
      await load.promise;
      operations.push('load:end');
      return true;
    });
    const runtime = createRuntime(save, async () => {
      operations.push('dispose');
    });
    const onRuntimeReady = jest.fn();

    const view = render(<WorldSystems runtime={runtime} onRuntimeReady={onRuntimeReady} />);
    await act(flushMicrotasks);
    view.unmount();
    expect(operations).toEqual(['load:start']);

    await act(async () => {
      load.resolve(true);
      await flushMicrotasks();
    });
    expect(operations).toEqual(['load:start', 'load:end', 'dispose']);
    expect(onRuntimeReady).not.toHaveBeenCalled();
  });

  test('shares ordering across route instances that use the same SaveSystem', async () => {
    const save = {} as SaveSystem;
    const firstLoad = createDeferred<boolean>();
    const secondLoad = createDeferred<boolean>();
    const operations: string[] = [];
    mockedLoadWorldRuntime
      .mockImplementationOnce(async () => {
        operations.push('old:load:start');
        await firstLoad.promise;
        operations.push('old:load:end');
        return true;
      })
      .mockImplementationOnce(async () => {
        operations.push('new:load:start');
        await secondLoad.promise;
        operations.push('new:load:end');
        return true;
      });
    const oldRuntime = createRuntime(save, async () => {
      operations.push('old:dispose');
    });
    const newRuntime = createRuntime(save, async () => {
      operations.push('new:dispose');
    });

    const oldView = render(<WorldSystems runtime={oldRuntime} />);
    await act(flushMicrotasks);
    oldView.unmount();
    const newView = render(<WorldSystems runtime={newRuntime} />);
    await act(flushMicrotasks);
    expect(operations).toEqual(['old:load:start']);

    await act(async () => {
      firstLoad.resolve(true);
      await flushMicrotasks();
    });
    expect(operations).toEqual(['old:load:start', 'old:load:end', 'old:dispose', 'new:load:start']);

    await act(async () => {
      secondLoad.resolve(true);
      await flushMicrotasks();
    });
    newView.unmount();
    await act(flushMicrotasks);
    expect(operations.at(-1)).toBe('new:dispose');
  });

  test('recovers the shared queue after load, dispose, and logger failures', async () => {
    const save = {} as SaveSystem;
    const firstLoad = createDeferred<boolean>();
    const operations: string[] = [];
    mockedLoadWorldRuntime
      .mockImplementationOnce(async () => {
        operations.push('old:load');
        return firstLoad.promise;
      })
      .mockImplementationOnce(async () => {
        operations.push('new:load');
        return true;
      });
    const oldRuntime = createRuntime(save, async () => {
      operations.push('old:dispose');
      throw new Error('dispose failed');
    });
    const newRuntime = createRuntime(save, async () => {
      operations.push('new:dispose');
    });
    const loggerError = jest.spyOn(logger, 'error').mockImplementation(() => {
      throw new Error('logger failed');
    });
    const onRuntimeReady = jest.fn();

    const oldView = render(<WorldSystems runtime={oldRuntime} />);
    await act(flushMicrotasks);
    oldView.unmount();
    const newView = render(<WorldSystems runtime={newRuntime} onRuntimeReady={onRuntimeReady} />);
    firstLoad.reject(new Error('load failed'));
    await act(flushMicrotasks);

    expect(operations).toEqual(['old:load', 'old:dispose', 'new:load']);
    expect(loggerError).toHaveBeenCalledTimes(2);
    expect(onRuntimeReady).toHaveBeenCalledTimes(1);

    newView.unmount();
    await act(flushMicrotasks);
    expect(operations.at(-1)).toBe('new:dispose');
  });

  test('allows runtimes backed by different SaveSystems to load in parallel', async () => {
    const firstLoad = createDeferred<boolean>();
    const secondLoad = createDeferred<boolean>();
    const operations: string[] = [];
    mockedLoadWorldRuntime
      .mockImplementationOnce(async () => {
        operations.push('first:start');
        return firstLoad.promise;
      })
      .mockImplementationOnce(async () => {
        operations.push('second:start');
        return secondLoad.promise;
      });

    const firstView = render(<WorldSystems runtime={createRuntime({} as SaveSystem)} />);
    const secondView = render(<WorldSystems runtime={createRuntime({} as SaveSystem)} />);
    await act(flushMicrotasks);
    expect(operations).toEqual(['first:start', 'second:start']);

    await act(async () => {
      firstLoad.resolve(true);
      secondLoad.resolve(true);
      await flushMicrotasks();
    });
    firstView.unmount();
    secondView.unmount();
    await act(flushMicrotasks);
  });
});
