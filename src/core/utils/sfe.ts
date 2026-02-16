export const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const clamp01 = (value: number): number => clamp(value, 0, 1);

/**
 * SFE-style suppression helper.
 *
 * We treat sigma as a normalized "cost" and compute w = exp(-sigma).
 * This file stays pure (no THREE / no side effects) for easy unit testing.
 */
export const sigmaFromDistance = (
  distance: number,
  near: number,
  far: number,
  strength: number = 4,
): number => {
  const d = Math.max(0, distance);
  const n = Math.max(0, near);
  const f = Math.max(n + 1e-6, far);
  const s = Math.max(0, strength);
  if (!Number.isFinite(d) || !Number.isFinite(n) || !Number.isFinite(f) || !Number.isFinite(s)) {
    return s;
  }
  const t = clamp01((d - n) / (f - n));
  return t * s;
};

export const weightFromSigma = (sigma: number): number => {
  const s = Math.max(0, sigma);
  if (!Number.isFinite(s)) return 0;
  return Math.exp(-s);
};

/**
 * Returns a suppression weight w in [0, 1].
 * Uses a hard cutoff at far to guarantee w=0 for extreme throttling.
 */
export const weightFromDistance = (
  distance: number,
  near: number,
  far: number,
  strength: number = 4,
): number => {
  if (distance <= near) return 1;
  if (distance >= far) return 0;
  return weightFromSigma(sigmaFromDistance(distance, near, far, strength));
};

