import { hasWebGPUApi, initWebGPURenderer } from '../../core/rendering/webgpu';
import type { RendererBackend, ThreeWebGpuBackendOptions } from '../types';

export { hasWebGPUApi as isWebGpuAvailable };

/**
 * Creates a Three WebGPURenderer facade. Its `kind` does not prove that Three resolved a native
 * WebGPU adapter because Three may fall back internally. Every construction or initialization failure
 * resolves to null.
 */
export async function createThreeWebGpuBackend(
  options: ThreeWebGpuBackendOptions,
): Promise<RendererBackend | null> {
  if (!hasWebGPUApi()) return null;

  const renderer = await initWebGPURenderer({ canvas: options.canvas, antialias: true }).catch(() => null);
  if (!renderer) return null;

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
