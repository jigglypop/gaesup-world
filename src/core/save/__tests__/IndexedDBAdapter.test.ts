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

test('write waits for completion and one connection serves every operation until the database releases it', async () => {
  const blob = { version: 1, savedAt: 0, domains: {} };
  const close = jest.fn();
  const request = { result: 'main' };
  const transaction = {
    objectStore: () => ({ put: () => request, delete: () => request }),
    onabort: undefined as (() => void) | undefined,
    oncomplete: undefined as (() => void) | undefined,
    error: null as Error | null,
  };
  const db = {
    transaction: () => transaction,
    close,
    onversionchange: undefined as (() => void) | undefined,
    onclose: undefined as (() => void) | undefined,
  };
  const openRequest = { result: db, onsuccess: undefined as (() => void) | undefined };
  const open = jest.fn(() => openRequest);
  const flush = async () => { for (let i = 0; i < 3; i++) await Promise.resolve(); };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: { open } });
  try {
    const adapter = new IndexedDBAdapter();
    let completed = false;
    const write = adapter.write('main', blob);
    void write.then(() => {
      completed = true;
    });
    openRequest.onsuccess?.();
    await flush();
    expect(completed).toBe(false);
    transaction.oncomplete?.();
    await write;
    expect(completed).toBe(true);

    const failedWrite = adapter.write('main', blob);
    const rejection = expect(failedWrite).rejects.toThrow('quota exceeded');
    await flush();
    transaction.error = new Error('quota exceeded');
    transaction.onabort?.();
    await rejection;
    const removal = adapter.remove('main');
    await flush();
    transaction.oncomplete?.();
    await removal;
    expect(open).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();

    // Another tab's upgrade or a storage reset releases the connection; the next operation reopens.
    db.onversionchange?.();
    expect(close).toHaveBeenCalledTimes(1);
    const reopened = adapter.write('main', blob);
    expect(open).toHaveBeenCalledTimes(2);
    openRequest.onsuccess?.();
    await flush();
    transaction.oncomplete?.();
    await reopened;
    db.onclose?.();
    void adapter.list().catch(() => undefined);
    expect(open).toHaveBeenCalledTimes(3);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'indexedDB', descriptor);
    else Reflect.deleteProperty(globalThis, 'indexedDB');
  }
});

test('a failed open does not poison later operations', async () => {
  const openRequest = { result: { transaction: jest.fn() }, onsuccess: undefined as (() => void) | undefined };
  const open = jest.fn()
    .mockImplementationOnce(() => { throw new Error('blocked'); })
    .mockImplementation(() => openRequest);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: { open } });
  try {
    const adapter = new IndexedDBAdapter();
    await expect(adapter.read('main')).rejects.toThrow('blocked');
    void adapter.read('main').catch(() => undefined);
    expect(open).toHaveBeenCalledTimes(2);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'indexedDB', descriptor);
    else Reflect.deleteProperty(globalThis, 'indexedDB');
  }
});
