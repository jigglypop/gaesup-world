import { StrictMode, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';

import { logger, useAutoSave, SaveSystem, type GaesupRuntime } from 'gaesup-world';

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
  test('callback changes retain the pending and ready runtime and notify the latest listener', async () => {
    const load = createDeferred<boolean>();
    mockedLoadWorldRuntime.mockReturnValue(load.promise);
    const dispose = jest.fn(async () => undefined);
    const runtime = createRuntime({} as SaveSystem, dispose);
    const firstReady = jest.fn();
    const latestReady = jest.fn();
    const view = render(<WorldSystems runtime={runtime} onRuntimeReady={firstReady} />);
    await act(flushMicrotasks);
    view.rerender(<WorldSystems runtime={runtime} onRuntimeReady={latestReady} />);
    await act(async () => {
      load.resolve(true);
      await flushMicrotasks();
    });
    expect(firstReady).not.toHaveBeenCalled();
    expect(latestReady).toHaveBeenCalledTimes(1);
    expect(mockedLoadWorldRuntime).toHaveBeenCalledTimes(1);
    expect(dispose).not.toHaveBeenCalled();
    expect(useAutoSave).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true }));
    view.rerender(<WorldSystems runtime={runtime} onRuntimeReady={() => undefined} />);
    await act(flushMicrotasks);
    expect(mockedLoadWorldRuntime).toHaveBeenCalledTimes(1);
    expect(dispose).not.toHaveBeenCalled();
    view.unmount();
    await act(flushMicrotasks);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  test('replacing the runtime still disposes the old generation before loading the new one', async () => {
    const save = {} as SaveSystem;
    const operations: string[] = [];
    const first = createRuntime(save, async () => { operations.push('first:dispose'); });
    const second = createRuntime(save, async () => { operations.push('second:dispose'); });
    mockedLoadWorldRuntime.mockImplementation(async (runtime) => {
      operations.push(runtime === first ? 'first:load' : 'second:load');
      return true;
    });
    const onRuntimeReady = jest.fn();
    const view = render(<WorldSystems runtime={first} onRuntimeReady={onRuntimeReady} />);
    await act(flushMicrotasks);
    view.rerender(<WorldSystems runtime={second} onRuntimeReady={onRuntimeReady} />);
    await act(flushMicrotasks);
    expect(operations).toEqual(['first:load', 'first:dispose', 'second:load']);
    expect(onRuntimeReady).toHaveBeenCalledTimes(2);
    view.unmount();
    await act(flushMicrotasks);
    expect(operations.at(-1)).toBe('second:dispose');
  });

  test('an inline ready callback that updates its parent does not restart the runtime', async () => {
    mockedLoadWorldRuntime.mockResolvedValue(true);
    const dispose = jest.fn(async () => undefined);
    const runtime = createRuntime({} as SaveSystem, dispose);
    function Parent() {
      const [ready, setReady] = useState(false);
      return <>
        <output>{ready ? 'ready' : 'loading'}</output>
        <WorldSystems runtime={runtime} onRuntimeReady={() => setReady(true)} />
      </>;
    }
    const view = render(<Parent />);
    await act(flushMicrotasks);
    await act(flushMicrotasks);
    expect(view.getByText('ready')).toBeDefined();
    expect(mockedLoadWorldRuntime).toHaveBeenCalledTimes(1);
    expect(dispose).not.toHaveBeenCalled();
  });

  afterEach(async () => {
    cleanup();
    await flushMicrotasks();
    mockedLoadWorldRuntime.mockReset();
    jest.mocked(useAutoSave).mockReset();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('keeps actual autosave disabled when a registered domain fails to hydrate', async () => {
    jest.useFakeTimers();
    const actual = jest.requireActual('gaesup-world') as typeof import('gaesup-world');
    jest.mocked(useAutoSave).mockImplementation(actual.useAutoSave);
    jest.spyOn(logger, 'error').mockImplementation(() => undefined);
    const original = { version: 1, savedAt: 0, domains: { inventory: { count: 50 } } };
    const write = jest.fn(async () => undefined);
    const save = new SaveSystem({ adapter: {
      read: async () => original,
      write,
      list: async () => ['main'],
      remove: async () => undefined,
    } });
    save.register({
      key: 'inventory',
      serialize: () => ({ count: 0 }),
      hydrate: () => { throw new Error('Invalid inventory'); },
    });
    mockedLoadWorldRuntime.mockImplementation(() => save.load());
    const onRuntimeReady = jest.fn();
    render(<WorldSystems runtime={createRuntime(save)} onRuntimeReady={onRuntimeReady} />);
    await act(flushMicrotasks);
    await act(async () => {
      jest.advanceTimersByTime(120_000);
      window.dispatchEvent(new Event('beforeunload'));
      await flushMicrotasks();
    });
    expect(onRuntimeReady).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(await save.list()).toEqual(['main']);
    expect(original.domains.inventory.count).toBe(50);
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
    expect(useAutoSave).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));

    await act(async () => {
      activeLoad.resolve(true);
      await flushMicrotasks();
    });
    expect(onRuntimeReady).toHaveBeenCalledTimes(1);
    expect(useAutoSave).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true }));

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
    const signal = mockedLoadWorldRuntime.mock.calls.at(-1)?.[1];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal?.aborted).toBe(false);
    view.unmount();
    expect(signal?.aborted).toBe(true);
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
