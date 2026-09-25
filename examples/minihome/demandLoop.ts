type FrameSource = { request: (callback: (time: number) => void) => number; cancel: (id: number) => void };

/** No RAF remains scheduled once movement/damping and invalidations have settled. */
export function createDemandLoop(draw: (time: number) => boolean, source: FrameSource = {
  request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id),
}) {
  let pending: number | undefined; let active = true; let disposed = false;
  const invalidate = () => {
    if (disposed || !active || pending !== undefined) return;
    pending = source.request(time => { pending = undefined; if (!disposed && active && draw(time)) invalidate(); });
  };
  return {
    invalidate,
    get pending() { return pending !== undefined; },
    setActive(value: boolean) {
      active = value;
      if (!value && pending !== undefined) { source.cancel(pending); pending = undefined; }
      if (value) invalidate();
    },
    dispose() { disposed = true; if (pending !== undefined) source.cancel(pending); pending = undefined; },
  };
}

/**
 * Scenery motion (wind, water, festive decorations) follows activity: it steps at most `hz` times a second and stops
 * `idleMs` after the last activity, so an untouched room schedules no frames.
 */
export function createSceneryClock({ idleMs = 4000, hz = 30 } = {}) {
  // 10% slack keeps a 60Hz display at exactly every other frame despite timestamp jitter.
  const gap = 900 / hz;
  let activeUntil = -Infinity; let lastStep = -Infinity;
  return {
    /** Keeps scenery moving until `idleMs` after `time` (ms). */
    touch(time: number) { activeUntil = Math.max(activeUntil, time + idleMs); },
    /** Whether scenery is still moving at `time`. */
    moving(time: number) { return time < activeUntil; },
    /** Seconds to advance scenery at `time`; 0 until the next step is due. */
    step(time: number) {
      if (time - lastStep < gap) return 0;
      const seconds = Math.min((time - lastStep) / 1000, 0.05); lastStep = time; return seconds;
    },
  };
}
