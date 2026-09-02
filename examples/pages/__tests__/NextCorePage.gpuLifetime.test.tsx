import React, { StrictMode } from 'react';

import { act, cleanup, render } from '@testing-library/react';

import { logger } from 'gaesup-world';
import {
  createGpuCulledInstances,
  createThreeWebGpuBackend,
  type GpuCulledInstancesResult,
  type RendererBackend,
  type ThreeWebGpuBackendOptions,
} from 'gaesup-world/next';

import { NextCorePage } from '../NextCorePage';

jest.mock('@react-three/drei', () => ({ OrbitControls: () => null }));
jest.mock('@react-three/fiber', () => ({ Canvas: () => null, useFrame: () => undefined }));

jest.mock('gaesup-world', () => ({
  logger: { error: jest.fn() },
}));

jest.mock('gaesup-world/next', () => {
  class MockNextWorld {
    public entityCount = 0;
    public readonly transforms = {
      positions: new Float32Array(0),
      setPosition: () => undefined,
    };

    public createEntity(): number {
      const entity = this.entityCount;
      this.entityCount += 1;
      return entity;
    }
  }

  return {
    compactVisible: () => 0,
    createGpuCulledInstances: jest.fn(),
    createThreeWebGpuBackend: jest.fn(),
    cullSpheres: () => undefined,
    entityIndexOf: (entity: number) => entity,
    extractFrustumPlanes: () => undefined,
    FRUSTUM_PLANES_LENGTH: 24,
    isWebGpuAvailable: () => true,
    MATRIX_STRIDE: 16,
    NextWorld: MockNextWorld,
    packInstanceMatrices: () => undefined,
  };
});

jest.mock('three', () => {
  const state = {
    events: [] as string[],
    geometryDisposeError: null as Error | null,
    geometryDisposeHook: null as (() => void) | null,
    throwGeometry: false,
    throwMesh: false,
  };

  class MockBoxGeometry {
    public constructor() {
      if (state.throwGeometry) throw new Error('geometry construction failed');
    }

    public dispose(): void {
      state.events.push('geometry');
      state.geometryDisposeHook?.();
      if (state.geometryDisposeError) throw state.geometryDisposeError;
    }
  }

  class MockInstancedMesh {
    public count = 0;
    public frustumCulled = true;
    public readonly instanceMatrix = {
      array: { set: () => undefined },
      needsUpdate: false,
    };

    public constructor() {
      if (state.throwMesh) throw new Error('mesh construction failed');
    }
  }

  class MockMatrix4 {
    public readonly elements = new Float32Array(16);

    public multiplyMatrices(): this {
      return this;
    }
  }

  class MockPerspectiveCamera {
    public readonly matrixWorldInverse = {};
    public readonly position = { set: () => undefined };
    public readonly projectionMatrix = {};

    public lookAt(): void {}
    public updateMatrixWorld(): void {}
  }

  class MockScene {
    public background: unknown = null;
    public add(): void {}
  }

  class MockVector4 {
    public set(): this {
      return this;
    }
  }

  return {
    __mockState: state,
    BoxGeometry: MockBoxGeometry,
    Color: class MockColor {},
    InstancedMesh: MockInstancedMesh,
    Matrix4: MockMatrix4,
    MeshNormalMaterial: class MockMeshNormalMaterial {
      public dispose(): void {}
    },
    PerspectiveCamera: MockPerspectiveCamera,
    Scene: MockScene,
    Vector4: MockVector4,
  };
});

type Deferred<T> = {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T | PromiseLike<T>) => void;
};

type ThreeMockState = {
  events: string[];
  geometryDisposeError: Error | null;
  geometryDisposeHook: (() => void) | null;
  throwGeometry: boolean;
  throwMesh: boolean;
};

type MockRenderer = {
  compute: jest.Mock<void, [unknown]>;
  lastCallback: (() => void) | null;
  render: jest.Mock<void, [unknown, unknown]>;
  setAnimationLoop: jest.Mock<Promise<void>, [(() => void) | null]>;
  setPixelRatio: jest.Mock<void, [number]>;
};

type CulledFixture = {
  dispose: jest.Mock<void, []>;
  resource: GpuCulledInstancesResult;
};

type BackendFixture = {
  dispose: jest.Mock<void, []>;
  renderer: MockRenderer;
  resource: RendererBackend;
};

const mockedCreateCulled = jest.mocked(createGpuCulledInstances);
const mockedCreateBackend = jest.mocked(createThreeWebGpuBackend);
const mockedLoggerError = jest.mocked(logger.error);
const threeState = (jest.requireMock('three') as { __mockState: ThreeMockState }).__mockState;

function createDeferred<T>(): Deferred<T> {
  let resolvePromise: Deferred<T>['resolve'] = () => undefined;
  let rejectPromise: Deferred<T>['reject'] = () => undefined;
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, reject: rejectPromise, resolve: resolvePromise };
}

function createCulledFixture(label = 'culled', disposeError?: Error): CulledFixture {
  const dispose = jest.fn<void, []>(() => {
    threeState.events.push(label);
    if (disposeError) throw disposeError;
  });
  return {
    dispose,
    resource: {
      computeNode: {},
      dispose,
      material: { dispose: () => undefined, positionNode: null },
      updatePlanes: () => undefined,
    },
  };
}

function createBackendFixture(options?: {
  disposeError?: Error;
  label?: string;
  pixelRatioError?: Error;
  startPromise?: Promise<void>;
  stopError?: Error;
  stopPromise?: Promise<void>;
}): BackendFixture {
  const label = options?.label ?? 'backend';
  const renderer: MockRenderer = {
    compute: jest.fn<void, [unknown]>(),
    lastCallback: null,
    render: jest.fn<void, [unknown, unknown]>(),
    setAnimationLoop: jest.fn<Promise<void>, [(() => void) | null]>(),
    setPixelRatio: jest.fn<void, [number]>(),
  };
  renderer.setPixelRatio.mockImplementation(() => {
    if (options?.pixelRatioError) throw options.pixelRatioError;
  });
  renderer.setAnimationLoop.mockImplementation((callback) => {
    renderer.lastCallback = callback;
    if (callback) {
      threeState.events.push(`${label}:start`);
      return options?.startPromise ?? Promise.resolve();
    }
    threeState.events.push('loop-stop');
    if (options?.stopError) throw options.stopError;
    return options?.stopPromise ?? Promise.resolve();
  });
  const dispose = jest.fn<void, []>(() => {
    threeState.events.push(label);
    if (options?.disposeError) throw options.disposeError;
  });
  return {
    dispose,
    renderer,
    resource: {
      dispose,
      kind: 'webgpu',
      native: renderer,
      resize: () => undefined,
    },
  };
}

async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    for (let turn = 0; turn < 6; turn += 1) await Promise.resolve();
  });
}

async function settle<T>(deferred: Deferred<T>, value: T): Promise<void> {
  await act(async () => {
    deferred.resolve(value);
    for (let turn = 0; turn < 6; turn += 1) await Promise.resolve();
  });
}

async function reject<T>(deferred: Deferred<T>, error: Error): Promise<void> {
  await act(async () => {
    deferred.reject(error);
    for (let turn = 0; turn < 6; turn += 1) await Promise.resolve();
  });
}

function renderGpu(element: React.ReactElement = <NextCorePage />) {
  window.history.replaceState({}, '', '/next?gpu');
  return render(element);
}

describe('NextCorePage GPU scene lifetime', () => {
  beforeEach(() => {
    mockedCreateCulled.mockReset();
    mockedCreateBackend.mockReset();
    mockedLoggerError.mockReset();
    threeState.events.length = 0;
    threeState.geometryDisposeError = null;
    threeState.geometryDisposeHook = null;
    threeState.throwGeometry = false;
    threeState.throwMesh = false;
  });

  afterEach(() => {
    cleanup();
  });

  test('disposes a culled result that resolves after unmount without starting a backend', async () => {
    const pendingCulled = createDeferred<GpuCulledInstancesResult | null>();
    const culled = createCulledFixture();
    mockedCreateCulled.mockReturnValue(pendingCulled.promise);

    const view = renderGpu();
    expect(mockedCreateCulled).toHaveBeenCalledTimes(1);
    view.unmount();
    await settle(pendingCulled, culled.resource);

    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(mockedCreateBackend).not.toHaveBeenCalled();
    expect(mockedLoggerError).not.toHaveBeenCalled();
  });

  test('disposes a backend that resolves after unmount and restores the retained canvas style', async () => {
    const pendingBackend = createDeferred<RendererBackend | null>();
    const culled = createCulledFixture();
    const backend = createBackendFixture();
    const factoryCapture: { options?: ThreeWebGpuBackendOptions } = {};
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockImplementation((options) => {
      factoryCapture.options = options;
      return pendingBackend.promise;
    });

    const view = renderGpu();
    await flushMicrotasks();
    const canvas = factoryCapture.options?.canvas;
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    view.unmount();
    if (!canvas) throw new Error('backend factory did not receive the canvas');
    canvas.style.width = '640px';
    canvas.style.height = '480px';
    await settle(pendingBackend, backend.resource);

    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
    expect(canvas.style.width).toBe('100%');
    expect(canvas.style.height).toBe('100%');
    expect(mockedLoggerError).not.toHaveBeenCalled();
  });

  test('treats a null backend as a quiet terminal result and releases culling', async () => {
    const culled = createCulledFixture();
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockImplementation(async ({ canvas }) => {
      canvas.style.width = '640px';
      canvas.style.height = '480px';
      return null;
    });

    const view = renderGpu();
    await flushMicrotasks();
    const canvas = view.container.querySelector('canvas');

    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(canvas?.style.width).toBe('100%');
    expect(canvas?.style.height).toBe('100%');
    expect(mockedLoggerError).not.toHaveBeenCalled();
    view.unmount();
    expect(culled.dispose).toHaveBeenCalledTimes(1);
  });

  test('logs an active backend rejection, restores canvas style, and releases culling', async () => {
    const culled = createCulledFixture();
    const failure = new Error('backend failed');
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockImplementation(async ({ canvas }) => {
      canvas.style.width = '640px';
      canvas.style.height = '480px';
      throw failure;
    });

    const view = renderGpu();
    await flushMicrotasks();
    const canvas = view.container.querySelector('canvas');

    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(canvas?.style.width).toBe('100%');
    expect(canvas?.style.height).toBe('100%');
    expect(mockedLoggerError).toHaveBeenCalledWith(
      '[NextCorePage] GPU scene setup failed.',
      failure,
    );
  });

  test('releases geometry and earlier owners when post-init mesh construction fails', async () => {
    const culled = createCulledFixture();
    const backend = createBackendFixture();
    threeState.throwMesh = true;
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    renderGpu();
    await flushMicrotasks();

    expect(threeState.events).toEqual(['geometry', 'culled', 'backend']);
    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
    expect(mockedLoggerError).toHaveBeenCalledWith(
      '[NextCorePage] GPU scene setup failed.',
      expect.any(Error),
    );
  });

  test('releases only acquired owners when post-init pixel ratio setup fails', async () => {
    const culled = createCulledFixture();
    const backend = createBackendFixture({
      pixelRatioError: new Error('pixel ratio setup failed'),
    });
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    renderGpu();
    await flushMicrotasks();

    expect(threeState.events).toEqual(['culled', 'backend']);
    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
    expect(backend.renderer.setAnimationLoop).not.toHaveBeenCalled();
    expect(mockedLoggerError).toHaveBeenCalledTimes(1);
  });

  test('releases earlier owners when geometry construction fails', async () => {
    const culled = createCulledFixture();
    const backend = createBackendFixture();
    threeState.throwGeometry = true;
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    renderGpu();
    await flushMicrotasks();

    expect(threeState.events).toEqual(['culled', 'backend']);
    expect(mockedLoggerError).toHaveBeenCalledTimes(1);
  });

  test('turns an active loop start rejection into one terminal release', async () => {
    const start = createDeferred<void>();
    const culled = createCulledFixture();
    const backend = createBackendFixture({ startPromise: start.promise });
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    const view = renderGpu();
    await flushMicrotasks();
    threeState.events.length = 0;
    await reject(start, new Error('loop start failed'));

    expect(threeState.events).toEqual(['loop-stop', 'geometry', 'culled', 'backend']);
    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
    expect(mockedLoggerError).toHaveBeenCalledWith(
      '[NextCorePage] GPU animation loop failed to start.',
      expect.any(Error),
    );
    view.unmount();
    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
  });

  test('cleans up a running generation in loop, geometry, culling, backend order', async () => {
    const culled = createCulledFixture();
    const backend = createBackendFixture();
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    const view = renderGpu();
    await flushMicrotasks();
    threeState.events.length = 0;
    view.unmount();

    expect(threeState.events).toEqual(['loop-stop', 'geometry', 'culled', 'backend']);
    expect(backend.renderer.setAnimationLoop).toHaveBeenCalledTimes(2);
    expect(mockedLoggerError).not.toHaveBeenCalled();
  });

  test('isolates disposer and logger failures while attempting every owner once', async () => {
    const culled = createCulledFixture('culled', new Error('culled cleanup failed'));
    const backend = createBackendFixture({
      disposeError: new Error('backend cleanup failed'),
      stopError: new Error('loop cleanup failed'),
    });
    threeState.geometryDisposeError = new Error('geometry cleanup failed');
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);
    mockedLoggerError.mockImplementation(() => {
      throw new Error('logger failed');
    });

    const view = renderGpu();
    await flushMicrotasks();
    threeState.events.length = 0;
    expect(() => view.unmount()).not.toThrow();

    expect(threeState.events).toEqual(['loop-stop', 'geometry', 'culled', 'backend']);
    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
    expect(mockedLoggerError).toHaveBeenCalledTimes(4);
  });

  test('detaches every owner before a disposer reenters effect cleanup', async () => {
    const start = createDeferred<void>();
    const culled = createCulledFixture();
    const backend = createBackendFixture({ startPromise: start.promise });
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    const view = renderGpu();
    await flushMicrotasks();
    threeState.geometryDisposeHook = () => view.unmount();
    threeState.events.length = 0;
    await reject(start, new Error('loop start failed'));

    expect(threeState.events).toEqual(['loop-stop', 'geometry', 'culled', 'backend']);
    expect(backend.renderer.setAnimationLoop).toHaveBeenCalledTimes(2);
    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
  });

  test('observes an asynchronous loop stop rejection without blocking later cleanup', async () => {
    const stop = createDeferred<void>();
    const culled = createCulledFixture();
    const backend = createBackendFixture({ stopPromise: stop.promise });
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    const view = renderGpu();
    await flushMicrotasks();
    threeState.events.length = 0;
    view.unmount();
    expect(threeState.events).toEqual(['loop-stop', 'geometry', 'culled', 'backend']);
    await reject(stop, new Error('stop rejected'));

    expect(mockedLoggerError).toHaveBeenCalledWith(
      '[NextCorePage] GPU animation loop cleanup failed.',
      expect.any(Error),
    );
  });

  test('ignores a late start rejection and guards a stale callback after unmount', async () => {
    const start = createDeferred<void>();
    const culled = createCulledFixture();
    const backend = createBackendFixture({ startPromise: start.promise });
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    const view = renderGpu();
    await flushMicrotasks();
    const staleCallback = backend.renderer.lastCallback;
    view.unmount();
    staleCallback?.();
    await reject(start, new Error('late start rejection'));

    expect(culled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
    expect(backend.renderer.compute).not.toHaveBeenCalled();
    expect(backend.renderer.render).not.toHaveBeenCalled();
    expect(mockedLoggerError).not.toHaveBeenCalled();
  });

  test('keeps StrictMode generations isolated when the first culled result settles late', async () => {
    const firstPending = createDeferred<GpuCulledInstancesResult | null>();
    const secondPending = createDeferred<GpuCulledInstancesResult | null>();
    const firstCulled = createCulledFixture('culled:first');
    const secondCulled = createCulledFixture('culled:second');
    const backend = createBackendFixture();
    mockedCreateCulled
      .mockReturnValueOnce(firstPending.promise)
      .mockReturnValueOnce(secondPending.promise);
    mockedCreateBackend.mockResolvedValue(backend.resource);

    const view = renderGpu(
      <StrictMode>
        <NextCorePage />
      </StrictMode>,
    );
    expect(mockedCreateCulled).toHaveBeenCalledTimes(2);
    await settle(firstPending, firstCulled.resource);
    await settle(secondPending, secondCulled.resource);

    expect(firstCulled.dispose).toHaveBeenCalledTimes(1);
    expect(secondCulled.dispose).not.toHaveBeenCalled();
    expect(mockedCreateBackend).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(firstCulled.dispose).toHaveBeenCalledTimes(1);
    expect(secondCulled.dispose).toHaveBeenCalledTimes(1);
    expect(backend.dispose).toHaveBeenCalledTimes(1);
  });

  test('restores responsive canvas styles after a successful backend factory call', async () => {
    const culled = createCulledFixture();
    const backend = createBackendFixture();
    mockedCreateCulled.mockResolvedValue(culled.resource);
    mockedCreateBackend.mockImplementation(async ({ canvas }) => {
      canvas.style.width = '800px';
      canvas.style.height = '600px';
      return backend.resource;
    });

    const view = renderGpu();
    await flushMicrotasks();
    const canvas = view.container.querySelector('canvas');

    expect(canvas?.style.width).toBe('100%');
    expect(canvas?.style.height).toBe('100%');
    view.unmount();
  });
});
