/**
 * TSL (Three Shading Language) compute shader for GPU-driven grass wind.
 *
 * When WebGPU is available, wind displacement is calculated entirely on the GPU
 * via compute shaders, eliminating CPU-side per-blade calculations.
 *
 * Falls back to the existing GLSL vertex shader on WebGL.
 *
 * Usage:
 *   import { createGrassWindCompute } from './grass';
 *   const compute = createGrassWindCompute(instanceCount);
 *   // In frame loop: renderer.computeAsync(compute);
 *
 * Note: This module uses dynamic imports to avoid bundling TSL when WebGPU is
 * unavailable. It is safe to import on WebGL-only builds; the functions will
 * return null gracefully.
 */
export type GrassWindCompute = {
    dispose: () => void;
    update: (time: number) => void;
    windBuffer: Float32Array;
};
/**
 * Try to create a GPU compute node for grass wind simulation.
 * Returns null if WebGPU/TSL is not available.
 *
 * @param instanceCount Number of grass instances
 * @param windStrength Wind strength multiplier (0.3 default)
 */
export declare function createGrassWindCompute(instanceCount: number, windStrength?: number): Promise<GrassWindCompute | null>;
/**
 * TSL node material definition for grass.
 *
 * This replaces the GLSL shaderMaterial with a TSL-based NodeMaterial
 * that works on both WebGPU (WGSL) and WebGL (GLSL) renderers.
 *
 * Integration point: When Three.js TSL API stabilizes further,
 * the vertex displacement, wind, and color mixing can be expressed
 * as TSL nodes for optimal cross-renderer compilation.
 */
export declare function isWebGPURenderer(renderer: object | null | undefined): boolean;
