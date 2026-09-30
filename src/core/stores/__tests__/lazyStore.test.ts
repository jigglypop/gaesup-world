import { create } from 'zustand';

import { logger } from '../../utils/logger';
import { lazyStore } from '../lazyStore';
import { lazyScopedStore } from '../scopedStore';

const createCounter = () => create<{ count: number }>(() => ({ count: 0 }));

test('a lazy store is created on first access and every later access reaches the same store', () => {
  const factory = jest.fn(createCounter);
  const store = lazyStore(factory);
  expect(factory).not.toHaveBeenCalled();

  const listener = jest.fn();
  const unsubscribe = store.subscribe(listener);
  store.setState({ count: 1 });
  expect(store.getState().count).toBe(1);
  expect(store.getInitialState().count).toBe(0);
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
  expect(factory).toHaveBeenCalledTimes(1);
});

test('the legacy store behind a scoped store warns once when created outside production', () => {
  const original = process.env['NODE_ENV'];
  const warn = jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  try {
    process.env['NODE_ENV'] = 'development';
    const { useStore } = lazyScopedStore('useCounterStore', createCounter, () => undefined);
    expect(warn).not.toHaveBeenCalled();
    useStore.setState({ count: 2 });
    expect(useStore.getState().count).toBe(2);
    expect(warn).toHaveBeenCalledTimes(1);

    process.env['NODE_ENV'] = 'production';
    lazyScopedStore('useQuietStore', createCounter, () => undefined).useStore.getState();
    expect(warn).toHaveBeenCalledTimes(1);
  } finally {
    if (original === undefined) delete process.env['NODE_ENV'];
    else process.env['NODE_ENV'] = original;
    warn.mockRestore();
  }
});
