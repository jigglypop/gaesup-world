import type { RendererBackend, ThreeWebGpuBackendOptions } from '../types';

type WebGpuRendererLike = {
  init: () => Promise<void>;
  setSize: (width: number, height: number) => void;
  dispose: () => void;
};

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
 * WebGPU adapter because Three may fall back internally. Three r178 also exposes no public-safe
 * cleanup for a partially initialized renderer, so an `init()` rejection is returned as `null`
 * without calling `dispose()`.
 */
export async function createThreeWebGpuBackend(
  options: ThreeWebGpuBackendOptions,
): Promise<RendererBackend | null> {
  if (!isWebGpuAvailable()) return null;

  let three: ThreeWebGpuModule;
  try {
    const specifier = 'three/webgpu';
    three = (await import(/* @vite-ignore */ specifier)) as ThreeWebGpuModule;
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

  try {
    await renderer.init();
  } catch {
    return null;
  }

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
