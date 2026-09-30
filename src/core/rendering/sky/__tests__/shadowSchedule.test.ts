import { createShadowSchedule } from '../shadowSchedule';

const FRAME = 1 / 60;

function run(schedule: ReturnType<typeof createShadowSchedule>, frames: number) {
  const redraws = [0, 0, 0, 0];
  let perFrameMax = 0;
  for (let frame = 0; frame < frames; frame++) {
    const due = schedule.tick(FRAME);
    let now = 0;
    due.forEach((redraw, index) => {
      if (!redraw) return;
      redraws[index]!++;
      if (index > 0) now++;
    });
    perFrameMax = Math.max(perFrameMax, now);
  }
  return { redraws, perFrameMax };
}

test('the first tick redraws every map', () => {
  expect(createShadowSchedule(4, { near: 30, far: 10 }).tick(FRAME)).toEqual([true, true, true, true]);
});

test('the near map follows its rate and the far maps take turns, one a frame', () => {
  const schedule = createShadowSchedule(4, { near: Number.POSITIVE_INFINITY, far: 15 });
  schedule.tick(FRAME);
  const { redraws, perFrameMax } = run(schedule, 60);
  expect(redraws[0]).toBe(60);
  for (const index of [1, 2, 3]) expect(redraws[index]).toBeGreaterThanOrEqual(13);
  for (const index of [1, 2, 3]) expect(redraws[index]).toBeLessThanOrEqual(16);
  expect(perFrameMax).toBe(1);
});

test('a 60 Hz rate still redraws every frame of a jittery 60 Hz display', () => {
  const schedule = createShadowSchedule(1, { near: 60, far: 60 });
  schedule.tick(FRAME);
  let redraws = 0;
  for (let frame = 0; frame < 60; frame++) if (schedule.tick(frame % 2 ? FRAME * 0.95 : FRAME * 1.05)[0]) redraws++;
  expect(redraws).toBe(60);
});

test('`all` redraws every map at once and restarts their clocks', () => {
  const schedule = createShadowSchedule(3, { near: 10, far: 5 });
  schedule.tick(FRAME);
  expect(schedule.tick(FRAME)).toEqual([false, false, false]);
  expect(schedule.tick(FRAME, true)).toEqual([true, true, true]);
  expect(schedule.tick(FRAME)).toEqual([false, false, false]);
});

test('a zero rate never redraws after the first frame', () => {
  const schedule = createShadowSchedule(2, { near: 0, far: 0 });
  schedule.tick(FRAME);
  expect(run(schedule, 120).redraws.slice(0, 2)).toEqual([0, 0]);
});
