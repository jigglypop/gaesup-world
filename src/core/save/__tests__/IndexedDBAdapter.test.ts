import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';

test.each(['read', 'list', 'remove'] as const)('propagates %s failures instead of reporting success', async (operation) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: { open: () => { throw new Error('storage unavailable'); } },
  });
  try {
    const adapter = new IndexedDBAdapter();
    const result = operation === 'list' ? adapter.list() : adapter[operation]('main');
    await expect(result).rejects.toThrow('storage unavailable');
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'indexedDB', descriptor);
    else Reflect.deleteProperty(globalThis, 'indexedDB');
  }
});

test('write waits for transaction completion and closes its database connection', async () => {
  const close = jest.fn();
  const request = { result: 'main' };
  const transaction = {
    objectStore: () => ({ put: () => request }),
    onabort: undefined as (() => void) | undefined,
    oncomplete: undefined as (() => void) | undefined,
    error: null as Error | null,
  };
  const openRequest = {
    result: { transaction: () => transaction, close },
    onsuccess: undefined as (() => void) | undefined,
  };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: { open: () => openRequest },
  });
  try {
    const adapter = new IndexedDBAdapter();
    let completed = false;
    const write = adapter.write('main', { version: 1, savedAt: 0, domains: {} });
    void write.then(() => {
      completed = true;
    });
    openRequest.onsuccess?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(completed).toBe(false);
    transaction.oncomplete?.();
    await write;
    expect(completed).toBe(true);
    expect(close).toHaveBeenCalledTimes(1);

    const failedWrite = adapter.write('main', { version: 1, savedAt: 0, domains: {} });
    const rejection = expect(failedWrite).rejects.toThrow('quota exceeded');
    openRequest.onsuccess?.();
    await Promise.resolve();
    transaction.error = new Error('quota exceeded');
    transaction.onabort?.();
    await rejection;
    expect(close).toHaveBeenCalledTimes(2);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'indexedDB', descriptor);
    else Reflect.deleteProperty(globalThis, 'indexedDB');
  }
});
