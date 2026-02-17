import * as THREE from 'three';

type RendererProps = {
  canvas: HTMLCanvasElement;
  antialias?: boolean;
  alpha?: boolean;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  [key: string]: unknown;
};

let webgpuAvailable: boolean | null = null;

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
    const adapter = await (navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown | null> } }).gpu.requestAdapter();
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
export async function createRenderer(props: RendererProps): Promise<THREE.WebGLRenderer> {
  const available = await isWebGPUAvailable();

  if (available) {
    try {
      // Dynamic import to avoid bundling WebGPU code when not available.
      const webgpuModule = await import('three/webgpu') as unknown as {
        default?: { new(props: RendererProps): THREE.WebGLRenderer & { init(): Promise<void> } };
        WebGPURenderer?: { new(props: RendererProps): THREE.WebGLRenderer & { init(): Promise<void> } };
      };

      const WebGPURenderer = webgpuModule.WebGPURenderer ?? webgpuModule.default;
      if (WebGPURenderer) {
        const renderer = new WebGPURenderer(props);
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
