import type { CoverLook } from './geometry';
import { worldNoise as noise2D } from '../../../terrain/grid';

/** Dunes over a thin base, one field across every tile, and a broad drift between the sand's two colors. */
export const SAND: CoverLook = {
  color: '#b89b66',
  accent: '#e0c27a',
  segments: [6, 20],
  base: 0.03,
  relief: (x, z) => 0.075 + noise2D(x / 6.4, z / 6.4) * 0.07 + noise2D(x / 2.6 + 8.3, z / 3.4 - 5.4) * 0.025 + Math.sin(x * 1.35 + z * 0.42) * 0.01,
  tint: (x, z) => 0.5 + 0.5 * noise2D(x * 0.22 + 5.1, z * 0.22 - 3.6),
  mix: 0.45,
  shade: [0.86, 0.18],
  skirt: 0.62,
  specks: { density: 10, count: [90, 240], lift: [0.01, 0.015], mix: [0, 0.55], shade: [0.92, 0.12], size: [0.02, 0.008], opacity: 0.85 },
};

/** Soft drifts over a thin base, one field across every tile, with a broad drift toward the brighter accent. */
export const SNOW: CoverLook = {
  color: '#dcecff',
  accent: '#ffffff',
  segments: [7, 22],
  base: 0.035,
  relief: (x, z) => 0.13 + noise2D(x / 7.2 - 3.3, z / 7.2 + 1.9) * 0.09 + noise2D(x / 2.8, z / 2.8) * 0.06 + noise2D(x / 0.96 + 6.1, z / 0.96 - 3.7) * 0.018,
  tint: (x, z) => 0.5 + 0.5 * noise2D(x * 0.16 - 2.4, z * 0.16 + 7.2),
  mix: 0.55,
  shade: [0.9, 0.1],
  skirt: 0.72,
  specks: { density: 3, count: [28, 96], lift: [0.016, 0.02], mix: [0.6, 0.4], shade: [1, 0], size: [0.03, 0.01], opacity: 0.55 },
};
