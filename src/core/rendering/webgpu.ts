import * as THREE from 'three';
import type { WebGPURenderer } from 'three/webgpu';

import { logger } from '../utils/logger';

type WebGPUNavigator = Navigator & {
  gpu?: {
    requestAdapter: () => Promise<object | null>;
  };
};

type RendererProps = Omit<THREE.WebGLRendererParameters, 'canvas' | 'context'> & {
  canvas: EventTarget;
};

type AnyRenderer = THREE.WebGLRenderer | WebGPURenderer;
type WebGPURendererParameters = ConstructorParameters<typeof import('three/webgpu').WebGPURenderer>[0];
type WebGPURendererWithContextLoss = WebGPURenderer & {
  forceContextLoss: () => void;
};

/**
 * How a renderer draws. A `WebGPURenderer` runs TSL node materials on a WebGPU device (`'webgpu'`) or on its
 * WebGL2 fallback (`'webgpu-fallback'`); any other renderer is a classic `WebGLRenderer` (`'webgl'`).
 * Compute, storage buffers and GPU batches need `'webgpu'`.
 */
export type RendererKind = 'webgpu' | 'webgpu-fallback' | 'webgl';

export function rendererKind(renderer: unknown): RendererKind {
  const value = renderer as { isWebGPURenderer?: boolean; backend?: { isWebGPUBackend?: boolean } } | null | undefined;
  if (value?.isWebGPURenderer !== true) return 'webgl';
  return value.backend?.isWebGPUBackend === true ? 'webgpu' : 'webgpu-fallback';
}

/** Whether the environment exposes the WebGPU API at all; `isWebGPUAvailable` also requires an adapter. */
export function hasWebGPUApi(): boolean {
  try {
    const gpu = (globalThis as { navigator?: { gpu?: unknown } }).navigator?.gpu;
    return typeof gpu === 'object' && gpu !== null;
  } catch {
    return false;
  }
}

let webgpuAvailability: Promise<boolean> | null = null;

function disposeBackend(backend: object | undefined): void {
  try {
    if (backend && 'dispose' in backend && typeof backend.dispose === 'function') backend.dispose();
  } catch (error) {
    logger.error('Renderer backend cleanup failed', error instanceof Error ? error : String(error));
  }
}

async function detectWebGPUAvailability(): Promise<boolean> {
  if (!hasWebGPUApi()) return false;
  try {
    return Boolean(await (navigator as WebGPUNavigator).gpu?.requestAdapter());
  } catch {
    return false;
  }
}

export function createLegacyRenderer(props: RendererProps): THREE.WebGLRenderer {
  const rendererProps = {
    ...props,
    antialias: props.antialias ?? true,
    powerPreference: props.powerPreference ?? 'high-performance',
  } as unknown as ConstructorParameters<typeof THREE.WebGLRenderer>[0];
  return new THREE.WebGLRenderer(rendererProps);
}

function installDisposalCompatibility(renderer: WebGPURenderer): WebGPURendererWithContextLoss {
  const nativeDispose = renderer.dispose;
  let disposed = false;
  const disposeOnce = (): void => {
    if (disposed) return;
    disposed = true;
    nativeDispose.call(renderer);
  };

  try {
    const extensible = Object.isExtensible(renderer);
    for (const property of ['dispose', 'forceContextLoss'] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(renderer, property);
      if ((!descriptor && !extensible) || (descriptor && !descriptor.configurable)) {
        throw new TypeError(`Cannot install renderer disposal compatibility for ${property}`);
      }
    }

    Object.defineProperties(renderer, {
      dispose: {
        configurable: true,
        enumerable: false,
        value: disposeOnce,
        writable: true,
      },
      forceContextLoss: {
        configurable: true,
        enumerable: false,
        value: disposeOnce,
        writable: true,
      },
    });
  } catch (installationError) {
    try {
      disposeOnce();
    } catch {
      // Preserve the compatibility installation error after best-effort native cleanup.
    }
    throw installationError;
  }

  return renderer as WebGPURendererWithContextLoss;
}

/** Dispatched on `window` when a renderer from `createRenderer` loses its device; `useRendererRecovery` listens. */
export const RENDERER_LOST_EVENT = 'gaesup:renderer-lost';

function isWindows(): boolean {
  const nav = (globalThis as { navigator?: Navigator & { userAgentData?: { platform?: string } } }).navigator;
  return nav?.userAgentData?.platform === 'Windows' || /Windows/.test(nav?.userAgent ?? '');
}

/**
 * Check WebGPU availability (cached after first call).
 */
export function isWebGPUAvailable(): Promise<boolean> {
  webgpuAvailability ??= detectWebGPUAvailability();
  return webgpuAvailability;
}

/**
 * Constructs and initializes a Three `WebGPURenderer`; null when its module or constructor is unavailable.
 * Initialization failures release each distinct backend and propagate: a partially initialized canvas cannot
 * safely host another renderer, and Three's dispose() would await the failed initialization again.
 */
export async function initWebGPURenderer(parameters: WebGPURendererParameters): Promise<WebGPURenderer | null> {
  let Renderer: typeof import('three/webgpu').WebGPURenderer | undefined;
  try {
    // Dynamic import to avoid bundling WebGPU code when not available.
    Renderer = (await import('three/webgpu')).WebGPURenderer;
  } catch {
    return null;
  }
  if (typeof Renderer !== 'function') return null;

  let renderer: WebGPURenderer;
  try {
    renderer = new Renderer(parameters);
  } catch {
    return null;
  }

  const initialBackend = renderer.backend;
  try {
    await renderer.init();
  } catch (error) {
    disposeBackend(initialBackend);
    if (renderer.backend !== initialBackend) disposeBackend(renderer.backend);
    throw error;
  }
  if (renderer.backend !== initialBackend) disposeBackend(initialBackend);
  return renderer;
}

/**
 * Create a WebGPU renderer with WebGL fallback for unavailable capabilities/modules/constructors.
 * Initialization failures propagate (see `initWebGPURenderer`).
 * Use as the `gl` prop on R3F Canvas:
 *
 *   <Canvas gl={createRenderer}>
 *
 * R3F v9 supports async gl functions natively.
 */
export async function createRenderer(props: RendererProps): Promise<AnyRenderer> {
  if (!(await isWebGPUAvailable())) return createLegacyRenderer(props);

  const { context, powerPreference, ...restProps } = props as RendererProps & {
    context?: unknown;
  };
  void context;
  // GPU timestamps where the adapter has them: `quality="auto"` tells GPU-bound frames from CPU-bound ones by them.
  // Windows ignores the power preference and warns about it, so it is left out there.
  const preference = powerPreference === 'default' || isWindows() ? {} : { powerPreference };
  const parameters = { trackTimestamp: true, ...restProps, ...preference };
  const renderer = await initWebGPURenderer(parameters as unknown as WebGPURendererParameters);
  if (!renderer) return createLegacyRenderer(props);
  const installed = installDisposalCompatibility(renderer);
  // A lost device (driver reset, GPU switch) takes every GPU resource with it; the canvas owner remounts on this event.
  installed.onDeviceLost = (info) => {
    logger.warn(`WebGPU device lost: ${info.message}`);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(RENDERER_LOST_EVENT, { detail: info }));
  };
  return installed;
}
