import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

import { getSaveSystem, SaveSystem } from '../core/SaveSystem';
import { useAutoSave, useLoadOnMount } from '../hooks/useAutoSave';
import type { SaveAdapter, SaveBlob } from '../types';

test('callback rerenders preserve edits and notify the latest callback without reloading', async () => {
  let finishRead!: (blob: SaveBlob) => void;
  const pendingRead = new Promise<SaveBlob>((resolve) => {
    finishRead = resolve;
  });
  const read = jest.fn(() => pendingRead);
  const saveSystem = new SaveSystem({
    adapter: {
      read,
      write: async () => undefined,
      list: async () => [],
      remove: async () => undefined,
    },
  });
  let counter = 0;
  const hydrate = jest.fn((value: unknown) => {
    if (typeof value === 'number') counter = value;
  });
  saveSystem.register({ key: 'counter', serialize: () => counter, hydrate });
  const onFirst = jest.fn();
  const onLatest = jest.fn();
  const view = renderHook(
    ({ onLoaded }) => {
      const [loaded, setLoaded] = useState(false);
      useLoadOnMount(
        'main',
        (ok) => {
          setLoaded(ok);
          onLoaded(ok);
        },
        saveSystem,
      );
      return loaded;
    },
    { initialProps: { onLoaded: onFirst } },
  );
  try {
    view.rerender({ onLoaded: onLatest });
    await act(async () => {
      finishRead({ version: 1, savedAt: 0, domains: { counter: 7 } });
    });
    expect(view.result.current).toBe(true);
    expect(onFirst).not.toHaveBeenCalled();
    expect(onLatest).toHaveBeenCalledTimes(1);
    expect(onLatest).toHaveBeenCalledWith(true);
    counter = 42;
    await act(async () => {
      view.rerender({ onLoaded: onLatest });
    });
    expect(counter).toBe(42);
    expect(read).toHaveBeenCalledTimes(1);
    expect(hydrate).toHaveBeenCalledTimes(1);
  } finally {
    view.unmount();
  }
});

test.each(['switch', 'unmount'] as const)(
  'a pending load cannot hydrate after %s',
  async (operation) => {
    let finishFirst!: (blob: SaveBlob) => void;
    const firstRead = new Promise<SaveBlob>((resolve) => {
      finishFirst = resolve;
    });
    const adapter: SaveAdapter = {
      read: async (slot) =>
        slot === 'first' ? firstRead : { version: 1, savedAt: 0, domains: { counter: 20 } },
      write: async () => undefined,
      list: async () => [],
      remove: async () => undefined,
    };
    const saveSystem = new SaveSystem({ adapter });
    let counter = 0;
    const hydrate = jest.fn((value: unknown) => {
      if (typeof value === 'number') counter = value;
    });
    saveSystem.register({ key: 'counter', serialize: () => counter, hydrate });
    const onLoaded = jest.fn();
    const { rerender, unmount } = renderHook(
      ({ slot }) => {
        useLoadOnMount(slot, onLoaded, saveSystem);
      },
      { initialProps: { slot: 'first' } },
    );

    try {
      if (operation === 'switch') {
        await act(async () => {
          rerender({ slot: 'second' });
        });
        expect(counter).toBe(20);
        expect(onLoaded).toHaveBeenCalledWith(true);
      } else {
        unmount();
        counter = 30;
      }
      hydrate.mockClear();
      onLoaded.mockClear();
      await act(async () => {
        finishFirst({ version: 1, savedAt: 0, domains: { counter: 10 } });
      });
      expect(counter).toBe(operation === 'switch' ? 20 : 30);
      expect(hydrate).not.toHaveBeenCalled();
      expect(onLoaded).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  },
);

test('disabled autosave does not save on timers or unload until enabled', async () => {
  jest.useFakeTimers();
  const save = jest.fn(async () => undefined);
  const saveSystem = { save } as unknown as SaveSystem;
  const { rerender, unmount } = renderHook(
    ({ enabled }) => {
      useAutoSave({ enabled, saveSystem, intervalMs: 1000 });
    },
    { initialProps: { enabled: false } },
  );
  try {
    await act(async () => {
      window.dispatchEvent(new Event('beforeunload'));
      await jest.advanceTimersByTimeAsync(1000);
    });
    expect(save).not.toHaveBeenCalled();
    rerender({ enabled: true });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });
    expect(save).toHaveBeenCalledTimes(1);
    rerender({ enabled: false });
    window.dispatchEvent(new Event('beforeunload'));
    expect(save).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    unmount();
    jest.useRealTimers();
  }
});

test('injected save system owns automatic save and load, and unmount stops saving', async () => {
  jest.useFakeTimers();
  const globalSave = jest.spyOn(getSaveSystem(), 'save');
  const blob: SaveBlob = { version: 1, savedAt: 0, domains: { counter: 7 } };
  const adapter: SaveAdapter = {
    read: jest.fn(async () => blob),
    write: jest.fn(async () => undefined),
    list: async () => [],
    remove: async () => undefined,
  };
  const saveSystem = new SaveSystem({ adapter });
  let counter = 0;
  saveSystem.register({
    key: 'counter',
    serialize: () => counter,
    hydrate: (value) => {
      if (typeof value === 'number') counter = value;
    },
  });
  const onLoaded = jest.fn();
  const { unmount } = renderHook(() => {
    useLoadOnMount('custom', onLoaded, saveSystem);
    useAutoSave({ intervalMs: 1000, slot: 'custom', saveSystem });
  });
  try {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });
    expect(counter).toBe(7);
    expect(onLoaded).toHaveBeenCalledWith(true);
    expect(adapter.read).toHaveBeenCalledWith('custom');
    expect(adapter.write).toHaveBeenCalledWith(
      'custom',
      expect.objectContaining({
        domains: { counter: 7 },
      }),
    );
    expect(globalSave).not.toHaveBeenCalled();
    unmount();
    window.dispatchEvent(new Event('beforeunload'));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });
    expect(adapter.write).toHaveBeenCalledTimes(1);
  } finally {
    unmount();
    globalSave.mockRestore();
    jest.useRealTimers();
  }
});
