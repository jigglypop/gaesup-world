/** Shadow map redraws a second: `near` for the closest cascade (or the single WebGL map), `far` for each farther one. */
export type ShadowRefreshRate = { near: number; far: number };

/** Timestamp jitter slack, so a 60 Hz rate on a 60 Hz display still redraws every frame. */
const SLACK = 0.9;

/**
 * Which of `count` shadow maps to redraw each frame. The nearest follows `rate.near`; the farther ones take turns at
 * `rate.far`, at most one a frame and the most overdue first, so their cost spreads across frames. A map that is not
 * redrawn keeps its last matrix too, so its shadows lag instead of sliding. The first tick redraws every map.
 */
export function createShadowSchedule(count: number, rate: ShadowRefreshRate) {
  const age = new Array<number>(count).fill(Number.POSITIVE_INFINITY);
  const due = new Array<boolean>(count).fill(false);
  const period = (hz: number) => (hz > 0 ? SLACK / hz : Number.POSITIVE_INFINITY);
  let pendingAll = true;
  return {
    /** Advances `delta` seconds. `all` redraws every map now, after the sun turns or the camera jumps. */
    tick(delta: number, all = false): readonly boolean[] {
      for (let i = 0; i < count; i++) age[i]! += delta;
      due.fill(false);
      if (all || pendingAll) {
        pendingAll = false;
        due.fill(true);
        age.fill(0);
        return due;
      }
      if (count > 0 && age[0]! >= period(rate.near)) {
        due[0] = true;
        age[0] = 0;
      }
      let pick = -1;
      let oldest = period(rate.far);
      for (let i = 1; i < count; i++) {
        if (age[i]! >= oldest) {
          oldest = age[i]!;
          pick = i;
        }
      }
      if (pick > 0) {
        due[pick] = true;
        age[pick] = 0;
      }
      return due;
    },
  };
}
