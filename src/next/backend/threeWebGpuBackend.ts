import type { RendererBackend, ThreeWebGpuBackendOptions } from '../types';

type WebGpuRendererLike = {
  backend?: { dispose?: () => void };
  init: () => Promise<void>;
  setSize: (width: number, height: number) => void;
  dispose: () => void;
};

function disposeBackend(backend: WebGpuRendererLike['backend']): void {
  try {
    backend?.dispose?.();
  } catch {
    // Partial backends may reject cleanup; preserve the factory's null failure contract.
  }
}

type ThreeWebGpuModule = {
  WebGPURenderer?: new (parameters: {
    canvas: HTMLCanvasElement;
    antialias: boolean;
  }) => WebGpuRendererLike;
};

export function isWebGpuAvailable(): boolean {
  try {
    const nav = (globalThis as { navigator?: { gpu?: unknown } }).navigator;
    const gpu = nav?.gpu;
    return typeof gpu === 'object' && gpu !== null;
  } catch {
    return false;
  }
}

/**
 * Creates a Three WebGPURenderer facade. Its `kind` does not prove that Three resolved a native
 * WebGPU adapter because Three may fall back internally. Failed initialization releases each
 * distinct backend directly; renderer.dispose() would await the failed initialization again.
 */
export async function createThreeWebGpuBackend(
  options: ThreeWebGpuBackendOptions,
): Promise<RendererBackend | null> {
  if (!isWebGpuAvailable()) return null;

  let three: ThreeWebGpuModule;
  try {
    three = (await import('three/webgpu')) as unknown as ThreeWebGpuModule;
  } catch {
    return null;
  }

  const Renderer = three.WebGPURenderer;
  if (typeof Renderer !== 'function') return null;

  let renderer: WebGpuRendererLike;
  try {
    renderer = new Renderer({ canvas: options.canvas, antialias: true });
  } catch {
    return null;
  }

  const initialBackend = renderer.backend;
  try {
    await renderer.init();
  } catch {
    disposeBackend(initialBackend);
    if (renderer.backend !== initialBackend) disposeBackend(renderer.backend);
    return null;
  }
  if (renderer.backend !== initialBackend) disposeBackend(initialBackend);

  const nativeDispose = renderer.dispose;
  let disposed = false;
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    nativeDispose.call(renderer);
  };

  try {
    renderer.setSize(options.width, options.height);
  } catch {
    try {
      dispose();
    } catch {
      // The factory preserves its null compatibility contract after post-init cleanup failures.
    }
    return null;
  }

  return {
    kind: 'webgpu',
    native: renderer,
    resize: (width: number, height: number) => {
      if (disposed) return;
      renderer.setSize(width, height);
    },
    dispose,
  };
}
