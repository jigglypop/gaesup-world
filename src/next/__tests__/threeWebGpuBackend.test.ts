import type { RendererBackend } from '../types';

type WebGpuModuleFactory = () => object;

const ORIGINAL_NAVIGATOR_DESCRIPTOR = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
const ORIGINAL_GPU_DESCRIPTOR = Object.getOwnPropertyDescriptor(navigator, 'gpu');

function restoreNavigator(): void {
  if (ORIGINAL_NAVIGATOR_DESCRIPTOR) {
    Object.defineProperty(globalThis, 'navigator', ORIGINAL_NAVIGATOR_DESCRIPTOR);
  }
  if (ORIGINAL_GPU_DESCRIPTOR) {
    Object.defineProperty(navigator, 'gpu', ORIGINAL_GPU_DESCRIPTOR);
  } else {
    Reflect.deleteProperty(navigator, 'gpu');
  }
}

function setNavigatorGpu(gpu: unknown): void {
  Object.defineProperty(navigator, 'gpu', {
    configurable: true,
    value: gpu,
  });
}

async function loadBackend(moduleFactory: WebGpuModuleFactory = () => ({})) {
  jest.resetModules();
  const trackedModuleFactory = jest.fn(moduleFactory);
  jest.doMock('three/webgpu', trackedModuleFactory);
  const backend = await import('../backend/threeWebGpuBackend');
  return { backend, trackedModuleFactory };
}

function createRenderer() {
  return {
    dispose: jest.fn(),
    init: jest.fn(() => Promise.resolve()),
    setSize: jest.fn(),
  };
}

describe('next Three WebGPU backend lifecycle', () => {
  afterEach(() => {
    restoreNavigator();
    jest.restoreAllMocks();
  });

  test('returns false and skips import when navigator or GPU capability is absent', async () => {
    const missingNavigator = await loadBackend();
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: undefined,
    });

    expect(missingNavigator.backend.isWebGpuAvailable()).toBe(false);
    await expect(
      missingNavigator.backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
    expect(missingNavigator.trackedModuleFactory).not.toHaveBeenCalled();

    restoreNavigator();
    setNavigatorGpu(undefined);
    const missingGpu = await loadBackend();
    expect(missingGpu.backend.isWebGpuAvailable()).toBe(false);
    await expect(
      missingGpu.backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
    expect(missingGpu.trackedModuleFactory).not.toHaveBeenCalled();
  });

  test('normalizes throwing navigator and GPU getters to unavailable', async () => {
    const navigatorGetter = await loadBackend();
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      get: () => {
        throw new Error('navigator getter failed');
      },
    });
    expect(navigatorGetter.backend.isWebGpuAvailable()).toBe(false);
    await expect(
      navigatorGetter.backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
    expect(navigatorGetter.trackedModuleFactory).not.toHaveBeenCalled();

    restoreNavigator();
    Object.defineProperty(navigator, 'gpu', {
      configurable: true,
      get: () => {
        throw new Error('GPU getter failed');
      },
    });
    const gpuGetter = await loadBackend();
    expect(gpuGetter.backend.isWebGpuAvailable()).toBe(false);
    await expect(
      gpuGetter.backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
    expect(gpuGetter.trackedModuleFactory).not.toHaveBeenCalled();
  });

  test('returns null when the WebGPU module import fails', async () => {
    setNavigatorGpu({});
    const importError = new Error('module import failed');
    const { backend, trackedModuleFactory } = await loadBackend(() => {
      throw importError;
    });

    await expect(
      backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
    expect(trackedModuleFactory).toHaveBeenCalledTimes(1);
  });

  test('returns null when the renderer constructor is missing', async () => {
    setNavigatorGpu({});
    const { backend } = await loadBackend(() => ({}));

    await expect(
      backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
  });

  test('returns null when renderer construction throws', async () => {
    setNavigatorGpu({});
    const constructorError = new Error('renderer construction failed');
    const WebGPURenderer = jest.fn(() => {
      throw constructorError;
    });
    const { backend } = await loadBackend(() => ({ WebGPURenderer }));

    await expect(
      backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
    expect(WebGPURenderer).toHaveBeenCalledTimes(1);
  });

  test('does not dispose the unsafe partial renderer when init rejects', async () => {
    setNavigatorGpu({});
    const renderer = { ...createRenderer(), backend: { dispose: jest.fn() } };
    renderer.init.mockRejectedValue(new Error('renderer init failed'));
    const WebGPURenderer = jest.fn(() => renderer);
    const { backend } = await loadBackend(() => ({ WebGPURenderer }));

    await expect(
      backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
    expect(renderer.init).toHaveBeenCalledTimes(1);
    expect(renderer.setSize).not.toHaveBeenCalled();
    expect(renderer.dispose).not.toHaveBeenCalled();
    expect(renderer.backend.dispose).toHaveBeenCalledTimes(1);
  });

  test.each([false, true])('releases distinct failed backends even if original cleanup throws: %s', async (cleanupThrows) => {
    setNavigatorGpu({});
    const original = { dispose: jest.fn(() => { if (cleanupThrows) throw new Error('partial cleanup'); }) };
    const fallback = { dispose: jest.fn() };
    const renderer = { ...createRenderer(), backend: original };
    renderer.init.mockImplementation(async () => {
      renderer.backend = fallback;
      throw new Error('init failed');
    });
    const { backend } = await loadBackend(() => ({ WebGPURenderer: jest.fn(() => renderer) }));
    await expect(backend.createThreeWebGpuBackend({
      canvas: document.createElement('canvas'), width: 640, height: 480,
    })).resolves.toBeNull();
    expect(original.dispose).toHaveBeenCalledTimes(1);
    expect(fallback.dispose).toHaveBeenCalledTimes(1);
    expect(renderer.dispose).not.toHaveBeenCalled();
  });

  test('only releases the abandoned backend after successful fallback', async () => {
    setNavigatorGpu({});
    const original = { dispose: jest.fn() };
    const fallback = { dispose: jest.fn() };
    const renderer = { ...createRenderer(), backend: original };
    renderer.init.mockImplementation(async () => { renderer.backend = fallback; });
    const { backend } = await loadBackend(() => ({ WebGPURenderer: jest.fn(() => renderer) }));
    const created = await backend.createThreeWebGpuBackend({
      canvas: document.createElement('canvas'), width: 640, height: 480,
    });
    expect(created).not.toBeNull();
    expect(original.dispose).toHaveBeenCalledTimes(1);
    expect(fallback.dispose).not.toHaveBeenCalled();
    created?.dispose();
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
  });

  test('disposes once and returns null when initial setSize and cleanup throw', async () => {
    setNavigatorGpu({});
    const renderer = createRenderer();
    renderer.setSize.mockImplementation(() => {
      throw new Error('initial setSize failed');
    });
    renderer.dispose.mockImplementation(() => {
      throw new Error('native dispose failed');
    });
    const WebGPURenderer = jest.fn(() => renderer);
    const { backend } = await loadBackend(() => ({ WebGPURenderer }));

    await expect(
      backend.createThreeWebGpuBackend({
        canvas: document.createElement('canvas'),
        height: 480,
        width: 640,
      }),
    ).resolves.toBeNull();
    expect(renderer.init).toHaveBeenCalledTimes(1);
    expect(renderer.setSize).toHaveBeenCalledWith(640, 480);
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(renderer.dispose.mock.contexts[0]).toBe(renderer);
  });

  test('constructs, initializes, and resizes the successful facade', async () => {
    setNavigatorGpu({});
    const renderer = createRenderer();
    const WebGPURenderer = jest.fn(() => renderer);
    const { backend } = await loadBackend(() => ({ WebGPURenderer }));
    const canvas = document.createElement('canvas');

    const created = await backend.createThreeWebGpuBackend({
      canvas,
      height: 480,
      width: 640,
    });
    if (!created) throw new Error('Expected a renderer backend.');

    expect(WebGPURenderer).toHaveBeenCalledWith({ antialias: true, canvas });
    expect(renderer.init).toHaveBeenCalledTimes(1);
    expect(renderer.setSize).toHaveBeenNthCalledWith(1, 640, 480);
    expect(created.kind).toBe('webgpu');
    expect(created.native).toBe(renderer);

    created.resize(1280, 720);
    expect(renderer.setSize).toHaveBeenNthCalledWith(2, 1280, 720);
  });

  test('marks disposal complete before native throw and reentry', async () => {
    setNavigatorGpu({});
    const renderer = createRenderer();
    const disposeError = new Error('native dispose failed');
    let created: RendererBackend | null = null;
    renderer.dispose.mockImplementation(() => {
      created?.dispose();
      throw disposeError;
    });
    const WebGPURenderer = jest.fn(() => renderer);
    const { backend } = await loadBackend(() => ({ WebGPURenderer }));
    created = await backend.createThreeWebGpuBackend({
      canvas: document.createElement('canvas'),
      height: 480,
      width: 640,
    });
    if (!created) throw new Error('Expected a renderer backend.');

    expect(() => created?.dispose()).toThrow(disposeError);
    expect(() => created?.dispose()).not.toThrow();
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
  });

  test('makes resize and repeated disposal no-ops after disposal', async () => {
    setNavigatorGpu({});
    const renderer = createRenderer();
    const WebGPURenderer = jest.fn(() => renderer);
    const { backend } = await loadBackend(() => ({ WebGPURenderer }));
    const created = await backend.createThreeWebGpuBackend({
      canvas: document.createElement('canvas'),
      height: 480,
      width: 640,
    });
    if (!created) throw new Error('Expected a renderer backend.');
    renderer.setSize.mockClear();

    created.dispose();
    created.resize(1280, 720);
    created.dispose();

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(renderer.setSize).not.toHaveBeenCalled();
  });
});
