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

// ---------------------------------------------------------------------------
// Multi-dimensional SFE suppression (Phase 4)
// sigma_total = sigma_dist + sigma_angle + sigma_velocity + sigma_coverage
// w = exp(-sigma_total)
//
// Matches the SFE unified formula: x_new = exp(-sigma(x)) * ...
// See: docs/sfe/Core_Theory/8.1_SFE_Reality_Stone
// ---------------------------------------------------------------------------

export type SuppressionFactors = {
  distance: number;
  near: number;
  far: number;
  /** View angle from camera forward (radians, 0 = center of view). */
  viewAngle?: number;
  /** Rate of change (velocity magnitude). */
  velocity?: number;
  /** Screen coverage fraction [0,1]. */
  coverage?: number;
};

export type SuppressionConfig = {
  distanceStrength: number;
  angleStrength: number;
  velocityStrength: number;
  coverageStrength: number;
  /** Half-FOV in radians beyond which angle suppression maxes out. */
  maxAngle: number;
  /** Velocity below which velocity suppression is zero. */
  velocityThreshold: number;
};

const DEFAULT_SUPPRESSION_CONFIG: SuppressionConfig = {
  distanceStrength: 4,
  angleStrength: 2,
  velocityStrength: 1,
  coverageStrength: 1.5,
  maxAngle: Math.PI / 2,
  velocityThreshold: 0.5,
};

/**
 * Multi-dimensional suppression weight.
 *
 * Combines distance, view angle, velocity, and screen coverage
 * into a single w = exp(-sigma_total) weight for unified LOD control.
 */
export const multiSigma = (
  factors: SuppressionFactors,
  config: Partial<SuppressionConfig> = {},
): number => {
  const c = { ...DEFAULT_SUPPRESSION_CONFIG, ...config };

  // Distance component.
  const sigmaDist = sigmaFromDistance(factors.distance, factors.near, factors.far, c.distanceStrength);
  if (factors.distance >= factors.far) return 0;

  // Angle component: objects at periphery are suppressed.
  let sigmaAngle = 0;
  if (factors.viewAngle !== undefined && factors.viewAngle > 0) {
    const angleT = clamp01(factors.viewAngle / c.maxAngle);
    sigmaAngle = angleT * c.angleStrength;
  }

  // Velocity component: fast-moving objects are less suppressed (need updates).
  // Inverted: high velocity -> lower sigma (more detail).
  let sigmaVelocity = 0;
  if (factors.velocity !== undefined) {
    const v = Math.max(0, factors.velocity);
    if (v < c.velocityThreshold) {
      sigmaVelocity = (1 - v / c.velocityThreshold) * c.velocityStrength;
    }
  }

  // Coverage component: objects covering more screen area are less suppressed.
  // Inverted: high coverage -> lower sigma.
  let sigmaCoverage = 0;
  if (factors.coverage !== undefined) {
    const cov = clamp01(factors.coverage);
    sigmaCoverage = (1 - cov) * c.coverageStrength;
  }

  const sigmaTotal = sigmaDist + sigmaAngle + sigmaVelocity + sigmaCoverage;
  return weightFromSigma(sigmaTotal);
};

// ---------------------------------------------------------------------------
// Render Budget System
//
// Adaptive sigma strength that maintains target FPS.
// d(sigma)/dt = -eta * (target_fps - actual_fps)
//
// When FPS drops below target: strength increases -> more aggressive LOD.
// When FPS exceeds target: strength decreases -> higher quality.
// ---------------------------------------------------------------------------

export class RenderBudget {
  private targetFps: number;
  private eta: number;
  private currentStrength: number;
  private minStrength: number;
  private maxStrength: number;
  private frameTimeHistory: number[] = [];
  private historySize: number;

  constructor(options?: {
    targetFps?: number;
    eta?: number;
    initialStrength?: number;
    minStrength?: number;
    maxStrength?: number;
    historySize?: number;
  }) {
    this.targetFps = options?.targetFps ?? 60;
    this.eta = options?.eta ?? 0.5;
    this.currentStrength = options?.initialStrength ?? 4;
    this.minStrength = options?.minStrength ?? 1;
    this.maxStrength = options?.maxStrength ?? 12;
    this.historySize = options?.historySize ?? 30;
  }

  /**
   * Call every frame with the frame's delta time (seconds).
   * Returns the updated suppression strength to use for LOD calculations.
   */
  update(deltaTime: number): number {
    if (deltaTime <= 0) return this.currentStrength;

    const fps = 1 / deltaTime;
    this.frameTimeHistory.push(fps);
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
    }

    // Use average FPS for stability.
    const len = this.frameTimeHistory.length;
    if (len < 3) return this.currentStrength;

    let sum = 0;
    for (let i = 0; i < len; i++) sum += this.frameTimeHistory[i];
    const avgFps = sum / len;

    // SFE time evolution: d(sigma)/dt = -eta * (target - actual)
    const error = this.targetFps - avgFps;
    const dSigma = -this.eta * error * deltaTime;
    this.currentStrength = clamp(this.currentStrength - dSigma, this.minStrength, this.maxStrength);

    return this.currentStrength;
  }

  get strength(): number {
    return this.currentStrength;
  }

  get averageFps(): number {
    const len = this.frameTimeHistory.length;
    if (len === 0) return 0;
    let sum = 0;
    for (let i = 0; i < len; i++) sum += this.frameTimeHistory[i];
    return sum / len;
  }

  reset(): void {
    this.frameTimeHistory.length = 0;
    this.currentStrength = 4;
  }
}

