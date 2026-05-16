/**
 * TSL-ready water rendering utilities.
 *
 * When WebGPU is active, water simulation can leverage compute shaders
 * for wave displacement, eliminating CPU-side uniform updates.
 *
 * Current implementation: Optimized uniform update path.
 * Future: Full TSL compute water with LOD geometry.
 */
export type WaterComputeConfig = {
    width: number;
    height: number;
    segments: number;
    waveSpeed: number;
    waveAmplitude: number;
};
/**
 * Pre-compute wave displacement data for a water plane.
 * This can be used to generate vertex displacement on the GPU
 * or as a fallback CPU path.
 *
 * @param config Water configuration
 * @param time Current time
 * @param out Optional pre-allocated output buffer
 * @returns Float32Array of Y displacements for each vertex
 */
export declare function computeWaveDisplacement(config: WaterComputeConfig, time: number, out?: Float32Array): Float32Array;
/**
 * LOD configuration for water based on camera distance.
 * Returns recommended segment count.
 */
export declare function getWaterLODSegments(distance: number, near?: number, far?: number): number;
