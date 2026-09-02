type WebGPUModuleFactory = () => object;

type DisposableRenderer = {
  dispose: () => void;
  forceContextLoss: () => void;
};

function setNavigatorGpu(gpu: unknown): void {
  Object.defineProperty(navigator, 'gpu', {
    configurable: true,
    value: gpu,
  });
}

async function loadRendering(webgpuModuleFactory: WebGPUModuleFactory = () => ({})) {
  jest.resetModules();

  const webGLRenderer = jest.fn((props: unknown) => ({
    props,
    render: jest.fn(),
  }));
  const trackedWebGPUModuleFactory = jest.fn(webgpuModuleFactory);

  jest.doMock('three', () => ({ WebGLRenderer: webGLRenderer }));
  jest.doMock('three/webgpu', trackedWebGPUModuleFactory);

  const rendering = await import('../webgpu');
  return { rendering, trackedWebGPUModuleFactory, webGLRenderer };
}

function createWebGPURenderer(init: () => Promise<unknown> = () => Promise.resolve()) {
  return {
    dispose: jest.fn(),
    init: jest.fn(init),
    render: jest.fn(),
  };
}

describe('WebGPU renderer factory', () => {
  const originalGpuDescriptor = Object.getOwnPropertyDescriptor(navigator, 'gpu');

  afterEach(() => {
    if (originalGpuDescriptor) {
      Object.defineProperty(navigator, 'gpu', originalGpuDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'gpu');
    }
    jest.clearAllMocks();
  });

  it('shares one in-flight and settled availability promise', async () => {
    let resolveAdapter: (adapter: object | null) => void = () => undefined;
    const adapterPromise = new Promise<object | null>((resolve) => {
      resolveAdapter = resolve;
    });
    const requestAdapter = jest.fn(() => adapterPromise);
    setNavigatorGpu({ requestAdapter });
    const { rendering } = await loadRendering();

    const first = rendering.isWebGPUAvailable();
    const second = rendering.isWebGPUAvailable();

    expect(first).toBe(second);
    expect(requestAdapter).toHaveBeenCalledTimes(1);

    resolveAdapter({});
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);

    const settled = rendering.isWebGPUAvailable();
    expect(settled).toBe(first);
    await expect(settled).resolves.toBe(true);
    expect(requestAdapter).toHaveBeenCalledTimes(1);
  });

  it('caches false when the GPU capability is absent', async () => {
    setNavigatorGpu(undefined);
    const { rendering } = await loadRendering();

    const first = rendering.isWebGPUAvailable();
    await expect(first).resolves.toBe(false);
    expect(rendering.isWebGPUAvailable()).toBe(first);
  });

  it('caches false when navigator is unavailable', async () => {
    const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    if (!navigatorDescriptor) throw new Error('Expected jsdom to define navigator');
    let availability: Promise<boolean> | undefined;

    try {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: undefined,
      });
      const { rendering } = await loadRendering();
      availability = rendering.isWebGPUAvailable();
    } finally {
      Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
    }

    await expect(availability).resolves.toBe(false);
  });

  it('normalizes adapter absence and probe rejection to cached false results', async () => {
    const requestAdapter = jest.fn().mockResolvedValue(null);
    setNavigatorGpu({ requestAdapter });
    const absentAdapterModule = await loadRendering();

    await expect(absentAdapterModule.rendering.isWebGPUAvailable()).resolves.toBe(false);
    expect(requestAdapter).toHaveBeenCalledTimes(1);

    const probeError = new Error('adapter probe failed');
    const rejectedRequestAdapter = jest.fn().mockRejectedValue(probeError);
    setNavigatorGpu({ requestAdapter: rejectedRequestAdapter });
    const rejectedProbeModule = await loadRendering();

    const rejectedProbe = rejectedProbeModule.rendering.isWebGPUAvailable();
    await expect(rejectedProbe).resolves.toBe(false);
    expect(rejectedProbeModule.rendering.isWebGPUAvailable()).toBe(rejectedProbe);
    expect(rejectedRequestAdapter).toHaveBeenCalledTimes(1);
  });

  it('uses legacy defaults when WebGPU is unavailable and preserves explicit props', async () => {
    setNavigatorGpu(undefined);
    const { rendering, trackedWebGPUModuleFactory, webGLRenderer } = await loadRendering();
    const canvas = document.createElement('canvas');

    await rendering.createRenderer({ canvas });
    await rendering.createRenderer({
      alpha: true,
      antialias: false,
      canvas,
      powerPreference: 'low-power',
    });

    expect(trackedWebGPUModuleFactory).not.toHaveBeenCalled();
    expect(webGLRenderer).toHaveBeenNthCalledWith(1, {
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
    });
    expect(webGLRenderer).toHaveBeenNthCalledWith(2, {
      alpha: true,
      antialias: false,
      canvas,
      powerPreference: 'low-power',
    });
  });

  it('falls back to legacy rendering when the WebGPU module import fails', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const importError = new Error('module unavailable');
    const { rendering, webGLRenderer } = await loadRendering(() => {
      throw importError;
    });
    const canvas = document.createElement('canvas');

    await expect(rendering.createRenderer({ canvas })).resolves.toBeDefined();
    expect(webGLRenderer).toHaveBeenCalledTimes(1);
  });

  it('falls back to legacy rendering when the WebGPU constructor is missing', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const { rendering, webGLRenderer } = await loadRendering(() => ({}));
    const canvas = document.createElement('canvas');

    await expect(rendering.createRenderer({ canvas })).resolves.toBeDefined();
    expect(webGLRenderer).toHaveBeenCalledTimes(1);
  });

  it('falls back to legacy rendering when WebGPURenderer construction fails', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const constructorError = new Error('constructor failed');
    const WebGPURenderer = jest.fn(() => {
      throw constructorError;
    });
    const { rendering, webGLRenderer } = await loadRendering(() => ({ WebGPURenderer }));
    const canvas = document.createElement('canvas');

    await expect(rendering.createRenderer({ canvas })).resolves.toBeDefined();
    expect(WebGPURenderer).toHaveBeenCalledTimes(1);
    expect(webGLRenderer).toHaveBeenCalledTimes(1);
  });

  it('propagates the original init rejection without fallback or partial disposal', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const initError = new Error('renderer init failed');
    const renderer = createWebGPURenderer(() => Promise.reject(initError));
    const WebGPURenderer = jest.fn(() => renderer);
    const { rendering, webGLRenderer } = await loadRendering(() => ({ WebGPURenderer }));

    const result = rendering.createRenderer({ canvas: document.createElement('canvas') });

    await expect(result).rejects.toBe(initError);
    expect(webGLRenderer).not.toHaveBeenCalled();
    expect(renderer.dispose).not.toHaveBeenCalled();
    expect(renderer).not.toHaveProperty('forceContextLoss');
  });

  it('preserves WebGPU props and disposes once across direct and R3F cleanup paths', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const renderer = createWebGPURenderer();
    const nativeDispose = jest.fn();
    renderer.dispose = nativeDispose;
    const WebGPURenderer = jest.fn(() => renderer);
    const { rendering, webGLRenderer } = await loadRendering(() => ({ WebGPURenderer }));
    const canvas = document.createElement('canvas');
    const context = {};
    const rendererProps = {
      alpha: true,
      canvas,
      context,
      powerPreference: 'high-performance',
    } as unknown as Parameters<typeof rendering.createRenderer>[0];

    const created = await rendering.createRenderer(rendererProps);
    const disposable = created as unknown as DisposableRenderer;

    expect(created).toBe(renderer);
    expect(WebGPURenderer).toHaveBeenCalledWith({
      alpha: true,
      canvas,
      powerPreference: 'high-performance',
    });
    expect(renderer.init).toHaveBeenCalledTimes(1);
    expect(webGLRenderer).not.toHaveBeenCalled();

    disposable.dispose();
    disposable.forceContextLoss();
    disposable.dispose();

    expect(nativeDispose).toHaveBeenCalledTimes(1);
    expect(nativeDispose.mock.contexts[0]).toBe(renderer);
  });

  it('marks cleanup complete before native disposal throws', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const disposeError = new Error('dispose failed');
    const renderer = createWebGPURenderer();
    renderer.dispose.mockImplementation(() => {
      throw disposeError;
    });
    const nativeDispose = renderer.dispose;
    const WebGPURenderer = jest.fn(() => renderer);
    const { rendering } = await loadRendering(() => ({ WebGPURenderer }));
    const created = (await rendering.createRenderer({
      canvas: document.createElement('canvas'),
      powerPreference: 'default',
    })) as unknown as DisposableRenderer;

    expect(WebGPURenderer).toHaveBeenCalledWith({ canvas: expect.any(HTMLCanvasElement) });
    expect(() => created.forceContextLoss()).toThrow(disposeError);
    expect(() => created.dispose()).not.toThrow();
    expect(nativeDispose).toHaveBeenCalledTimes(1);
  });

  it('disposes once when R3F cleanup leads and native disposal re-enters', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const renderer = createWebGPURenderer();
    const nativeDispose = jest.fn(() => {
      (renderer as unknown as DisposableRenderer).dispose();
    });
    renderer.dispose = nativeDispose;
    const WebGPURenderer = jest.fn(() => renderer);
    const { rendering } = await loadRendering(() => ({ WebGPURenderer }));
    const created = (await rendering.createRenderer({
      canvas: document.createElement('canvas'),
    })) as unknown as DisposableRenderer;

    created.forceContextLoss();
    created.dispose();

    expect(nativeDispose).toHaveBeenCalledTimes(1);
  });

  it('cleans up and rejects without fallback when compatibility methods cannot be installed', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const cleanupError = new Error('native cleanup failed');
    const renderer = createWebGPURenderer();
    const nativeDispose = jest.fn(() => {
      throw cleanupError;
    });
    renderer.dispose = nativeDispose;
    Object.preventExtensions(renderer);
    const WebGPURenderer = jest.fn(() => renderer);
    const { rendering, webGLRenderer } = await loadRendering(() => ({ WebGPURenderer }));

    const result = rendering.createRenderer({ canvas: document.createElement('canvas') });

    await expect(result).rejects.toThrow(
      'Cannot install renderer disposal compatibility for forceContextLoss',
    );
    expect(nativeDispose).toHaveBeenCalledTimes(1);
    expect(webGLRenderer).not.toHaveBeenCalled();
  });

  it('rejects and cleans up when an own compatibility method is non-configurable', async () => {
    setNavigatorGpu({ requestAdapter: jest.fn().mockResolvedValue({}) });
    const renderer = createWebGPURenderer();
    const nativeDispose = renderer.dispose;
    Object.defineProperty(renderer, 'forceContextLoss', {
      configurable: false,
      value: jest.fn(),
      writable: false,
    });
    const WebGPURenderer = jest.fn(() => renderer);
    const { rendering, webGLRenderer } = await loadRendering(() => ({ WebGPURenderer }));

    const installationError: unknown = await rendering
      .createRenderer({ canvas: document.createElement('canvas') })
      .catch((error: unknown) => error);

    expect(installationError).toBeInstanceOf(TypeError);
    expect(installationError).toHaveProperty(
      'message',
      'Cannot install renderer disposal compatibility for forceContextLoss',
    );
    expect(nativeDispose).toHaveBeenCalledTimes(1);
    expect(webGLRenderer).not.toHaveBeenCalled();
  });
});
