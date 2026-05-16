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
type AnyRenderer = THREE.WebGLRenderer | WebGPURenderer;
/**
 * Check WebGPU availability (cached after first call).
 */
export declare function isWebGPUAvailable(): Promise<boolean>;
/**
 * Create a WebGPU renderer with automatic WebGL fallback.
 * Use as the `gl` prop on R3F Canvas:
 *
 *   <Canvas gl={createRenderer}>
 *
 * R3F v9 supports async gl functions natively.
 */
export declare function createRenderer(props: RendererProps): Promise<AnyRenderer>;
export {};
