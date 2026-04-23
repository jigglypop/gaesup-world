import * as THREE from 'three';
import type { WebGPURenderer } from 'three/webgpu';

declare global {
  interface Navigator {
    gpu?: {
      requestAdapter: () => Promise<object | null>;
    };
  }
}

type RendererProps = Omit<THREE.WebGLRendererParameters, 'context'> & {
  canvas: HTMLCanvasElement;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
};

let webgpuAvailable: boolean | null = null;
type AnyRenderer = THREE.WebGLRenderer | WebGPURenderer;

/**
 * Check WebGPU availability (cached after first call).
 */
export async function isWebGPUAvailable(): Promise<boolean> {
  if (webgpuAvailable !== null) return webgpuAvailable;
  try {
    if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
      webgpuAvailable = false;
      return false;
    }
    const adapter = await navigator.gpu?.requestAdapter();
    webgpuAvailable = adapter !== null;
    return webgpuAvailable;
  } catch {
    webgpuAvailable = false;
    return false;
  }
}

/**
 * Create a WebGPU renderer with automatic WebGL fallback.
 * Use as the `gl` prop on R3F Canvas:
 *
 *   <Canvas gl={createRenderer}>
 *
 * R3F v9 supports async gl functions natively.
 */
export async function createRenderer(props: RendererProps): Promise<AnyRenderer> {
  const available = await isWebGPUAvailable();

  if (available) {
    try {
      // Dynamic import to avoid bundling WebGPU code when not available.
      const webgpuModule = await import('three/webgpu');

      const WebGPURenderer = webgpuModule.WebGPURenderer;
      if (WebGPURenderer) {
        const { powerPreference, ...restProps } = props;
        const renderer = new WebGPURenderer(
          powerPreference === 'default'
            ? restProps
            : { ...restProps, powerPreference },
        );
        await renderer.init();
        return renderer;
      }
    } catch {
      // WebGPU import failed; fall through to WebGL.
    }
  }

  // Fallback: standard WebGL renderer.
  return new THREE.WebGLRenderer({
    ...props,
    antialias: props.antialias ?? true,
    powerPreference: props.powerPreference ?? 'high-performance',
  });
}
