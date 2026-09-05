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
type WebGPURendererWithContextLoss = WebGPURenderer & {
  forceContextLoss: () => void;
};

let webgpuAvailability: Promise<boolean> | null = null;

function disposeBackend(backend: WebGPURenderer['backend']): void {
  try {
    if ('dispose' in backend && typeof backend.dispose === 'function') backend.dispose();
  } catch (error) {
    logger.error('Renderer backend cleanup failed', error instanceof Error ? error : String(error));
  }
}

async function detectWebGPUAvailability(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined') return false;

    const webgpuNavigator = navigator as WebGPUNavigator;
    if (!webgpuNavigator.gpu) return false;

    const adapter = await webgpuNavigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

function createLegacyRenderer(props: RendererProps): THREE.WebGLRenderer {
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

/**
 * Check WebGPU availability (cached after first call).
 */
export function isWebGPUAvailable(): Promise<boolean> {
  webgpuAvailability ??= detectWebGPUAvailability();
  return webgpuAvailability;
}

/**
 * Create a WebGPU renderer with WebGL fallback for unavailable capabilities/modules/constructors.
 * Initialization failures propagate: a partially initialized canvas cannot safely be reused
 * for another renderer, and Three's dispose() awaits initialization again through setAnimationLoop().
 * Use as the `gl` prop on R3F Canvas:
 *
 *   <Canvas gl={createRenderer}>
 *
 * R3F v9 supports async gl functions natively.
 */
export async function createRenderer(props: RendererProps): Promise<AnyRenderer> {
  const available = await isWebGPUAvailable();

  if (!available) return createLegacyRenderer(props);

  let WebGPURendererConstructor: typeof import('three/webgpu').WebGPURenderer;
  try {
    // Dynamic import to avoid bundling WebGPU code when not available.
    const webgpuModule = await import('three/webgpu');
    WebGPURendererConstructor = webgpuModule.WebGPURenderer;
  } catch {
    return createLegacyRenderer(props);
  }

  if (typeof WebGPURendererConstructor !== 'function') return createLegacyRenderer(props);

  const { context, powerPreference, ...restProps } = props as RendererProps & {
    context?: unknown;
  };
  void context;
  const rendererProps = (powerPreference === 'default'
    ? restProps
    : { ...restProps, powerPreference }) as unknown as ConstructorParameters<
    typeof WebGPURendererConstructor
  >[0];
  let renderer: WebGPURenderer;
  try {
    renderer = new WebGPURendererConstructor(rendererProps);
  } catch {
    return createLegacyRenderer(props);
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
  return installDisposalCompatibility(renderer);
}
