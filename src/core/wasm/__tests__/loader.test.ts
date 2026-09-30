type LoaderModule = typeof import('../loader');

const RETRY_WAIT_MS = 60_000;

function loadFreshLoader(): LoaderModule {
  let loader: LoaderModule | undefined;
  jest.isolateModules(() => {
    loader = jest.requireActual<LoaderModule>('../loader');
  });
  if (!loader) throw new Error('loader module did not load');
  return loader;
}

describe('loadCoreWasm failure caching', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  test('retries after a transient network failure once the cooldown passes', async () => {
    const fetchMock = jest.fn(() => Promise.reject(new TypeError('network down')));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { loadCoreWasm } = loadFreshLoader();

    await expect(loadCoreWasm()).resolves.toBeNull();
    await expect(loadCoreWasm()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    jest.setSystemTime(RETRY_WAIT_MS);
    await expect(loadCoreWasm()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('keeps a missing module cached without refetching', async () => {
    const fetchMock = jest.fn(() => Promise.resolve({ ok: false, status: 404 } as Response));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { loadCoreWasm } = loadFreshLoader();

    await expect(loadCoreWasm()).resolves.toBeNull();
    jest.setSystemTime(RETRY_WAIT_MS);
    await expect(loadCoreWasm()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
