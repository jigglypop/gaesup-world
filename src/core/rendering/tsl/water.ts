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
export function computeWaveDisplacement(
  config: WaterComputeConfig,
  time: number,
  out?: Float32Array,
): Float32Array {
  const { segments, waveSpeed, waveAmplitude } = config;
  const vertCount = (segments + 1) * (segments + 1);
  const result = out ?? new Float32Array(vertCount);

  const t = time * waveSpeed;
  const segsInv = 1.0 / segments;

  for (let iz = 0; iz <= segments; iz++) {
    const z = iz * segsInv;
    for (let ix = 0; ix <= segments; ix++) {
      const x = ix * segsInv;
      const idx = iz * (segments + 1) + ix;
      // Two-octave Gerstner-like wave.
      result[idx] =
        Math.sin(x * 6.2832 + t) * waveAmplitude +
        Math.sin(z * 4.1888 + t * 0.7) * waveAmplitude * 0.5;
    }
  }

  return result;
}

/**
 * LOD configuration for water based on camera distance.
 * Returns recommended segment count.
 */
export function getWaterLODSegments(
  distance: number,
  near: number = 30,
  far: number = 180,
): number {
  if (distance <= near) return 64;
  if (distance >= far) return 8;
  const t = (distance - near) / (far - near);
  // Exponential falloff: more segments close, fewer far.
  const segments = Math.round(64 * Math.exp(-t * 2));
  return Math.max(8, segments);
}
