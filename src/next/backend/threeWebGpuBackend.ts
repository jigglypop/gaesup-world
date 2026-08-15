import type { RendererBackend, ThreeWebGpuBackendOptions } from '../types';

type WebGpuRendererLike = {
  init: () => Promise<void>;
  setSize: (width: number, height: number) => void;
  dispose: () => void;
};

type ThreeWebGpuModule = {
  WebGPURenderer: new (parameters: {
    canvas: HTMLCanvasElement;
    antialias: boolean;
  }) => WebGpuRendererLike;
};

export function isWebGpuAvailable(): boolean {
  const nav = (globalThis as { navigator?: { gpu?: unknown } }).navigator;
  return typeof nav?.gpu === 'object' && nav.gpu !== null;
}

export async function createThreeWebGpuBackend(
  options: ThreeWebGpuBackendOptions,
): Promise<RendererBackend | null> {
  if (!isWebGpuAvailable()) {
    return null;
  }
  try {
    const specifier = 'three/webgpu';
    const three = (await import(/* @vite-ignore */ specifier)) as ThreeWebGpuModule;
    const renderer = new three.WebGPURenderer({ canvas: options.canvas, antialias: true });
    await renderer.init();
    renderer.setSize(options.width, options.height);
    return {
      kind: 'webgpu',
      native: renderer,
      resize: (width: number, height: number) => renderer.setSize(width, height),
      dispose: () => renderer.dispose(),
    };
  } catch {
    return null;
  }
}
