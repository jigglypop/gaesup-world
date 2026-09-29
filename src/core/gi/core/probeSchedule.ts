/**
 * Passes over every probe, after the voxels or the light changed, that run at the full rate. The running average moves
 * 10% of the way per update at the default blend, so twelve passes leave under a third of the old light's noise; the
 * adaptive blend already follows large changes within a pass or two.
 */
export const SETTLE_PASSES = 12;
/** A settled cache keeps a quarter of the rate: enough to follow small changes, without a steady share of a core. */
export const SETTLED_RATE_DIVISOR = 4;

/**
 * Probes to update in one frame (or one worker tick) `passes` passes after the cascade's last change: `perFrame` times
 * `firstPass` until every probe has been traced once, so new light shows up quickly, `perFrame` while the cache
 * converges, then a quarter of it.
 */
export function scheduledProbeBudget(perFrame: number, passes: number, firstPass = 1): number {
  const base = Math.max(0, Math.floor(perFrame));
  if (base === 0) return 0;
  if (passes < 1) return base * Math.max(1, Math.floor(firstPass));
  if (passes < SETTLE_PASSES) return base;
  return Math.max(1, Math.ceil(base / SETTLED_RATE_DIVISOR));
}
