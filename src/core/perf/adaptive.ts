/**
 * How `quality="auto"` scales the canvas under load, after choketmonster's adaptive resolution. It judges the browser's
 * frame rate, not the canvas's: `IdleFrameRate` draws fewer frames on purpose while the display keeps its pace, and a
 * saturated GPU or CPU slows the display frames themselves.
 */
export const ADAPTIVE_RESOLUTION = {
  /** Lowest pixel ratio it drops to, and the step it climbs back by (and drops at least). */
  minPixelRatio: 0.7,
  step: 0.1,
  /** Frame rate it aims for. A window below `drop` of it is slow; one above `recover` of what the display showed is at speed. */
  targetFps: 60,
  drop: 0.8,
  recover: 0.95,
  /** Seconds of display frames a decision looks at. */
  windowSeconds: 2,
  /** Seconds of frames ignored after a change (the resize hitches), and after mounting or showing the page again. */
  settleSeconds: 2,
  graceSeconds: 3,
  /** Seconds a ratio holds before it may rise again; a drop never waits for it. */
  holdSeconds: 8,
  /** A GPU busy for less than this share of the frame is not what holds it back: a lower ratio would not help. */
  gpuBoundShare: 0.6,
} as const;

/** The ratio whose pixels fit the target at `fps`: pixel cost goes with the ratio squared. At least one step down. */
export function lowerPixelRatio(fps: number, current: number): number {
  const { minPixelRatio, step, targetFps } = ADAPTIVE_RESOLUTION;
  const fitted = Math.floor(current * Math.sqrt(Math.max(1, fps) / targetFps) * 20) / 20;
  return Math.max(minPixelRatio, Math.min(Math.round((current - step) * 100) / 100, fitted));
}

export type ResolutionGovernor = {
  /** The ratio the canvas should draw at. */
  readonly pixelRatio: number;
  /**
   * Frames run slow while the GPU has time to spare: the CPU holds them back, so fewer pixels would not help. Set by a
   * slow window and cleared by one at speed; windows in between keep it.
   */
  readonly cpuBound: boolean;
  /**
   * One display frame of `intervalMs`; `gpuMs` is the GPU time of a recent frame when the renderer measures it.
   * Returns the new ratio when it changes.
   */
  frame(intervalMs: number, gpuMs?: number | null): number | null;
  /** The page was hidden: its first frames back span the time away. */
  resume(): void;
};

export function createResolutionGovernor(maximum: number): ResolutionGovernor {
  const { step, targetFps, drop, recover, windowSeconds, settleSeconds, graceSeconds, holdSeconds, gpuBoundShare } = ADAPTIVE_RESOLUTION;
  let pixelRatio = maximum;
  let cpuBound = false;
  let wait: number = graceSeconds;
  let held = 0;
  let seconds = 0;
  let frames = 0;
  // The best window tracks the display's refresh, so a 50 Hz panel counts 50 as full speed.
  let display = 0;
  return {
    get pixelRatio() {
      return pixelRatio;
    },
    get cpuBound() {
      return cpuBound;
    },
    frame(intervalMs, gpuMs) {
      const delta = intervalMs / 1000;
      if (!(delta > 0)) return null;
      if (wait > 0) {
        wait -= Math.min(delta, 0.1);
        return null;
      }
      held += delta;
      seconds += delta;
      frames++;
      if (seconds < windowSeconds) return null;
      const fps = frames / seconds;
      seconds = 0;
      frames = 0;
      display = Math.max(display, fps);
      const shown = Math.min(targetFps, display);
      const measured = gpuMs != null;
      const gpuBound = measured && gpuMs >= (gpuBoundShare * 1000) / fps;
      const slow = fps < targetFps * drop;
      const fast = fps > shown * recover;
      if (slow) cpuBound = measured && !gpuBound;
      else if (fast) cpuBound = false;
      let next = pixelRatio;
      // Without timings every slow window counts against the GPU; with them only one the GPU fills.
      if (slow && (!measured || gpuBound)) next = lowerPixelRatio(fps, pixelRatio);
      else if (fast && held >= holdSeconds && pixelRatio < maximum) {
        const raised = Math.min(maximum, Math.round((pixelRatio + step) * 100) / 100);
        // With timings it rises only while the GPU would still have room at the larger size, so it cannot bounce.
        if (!measured || gpuMs * (raised / pixelRatio) ** 2 < (drop * 1000) / shown) next = raised;
      }
      if (next === pixelRatio) return null;
      pixelRatio = next;
      held = 0;
      wait = settleSeconds;
      return pixelRatio;
    },
    resume() {
      wait = graceSeconds;
      seconds = 0;
      frames = 0;
    },
  };
}
