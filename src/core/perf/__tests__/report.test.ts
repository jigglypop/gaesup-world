import { summarizeFrameTimes } from '../report';

test('frame summary: rate over the window and interval percentiles, a hitch shows in p95 and max', () => {
  // Four hitches in 60 frames are over 5%, so they reach p95; two would not.
  const intervals = [...Array.from({ length: 56 }, () => 16), 40, 50, 60, 100];
  const summary = summarizeFrameTimes(intervals, 1000);
  expect(summary.fps).toBe(60);
  expect(summary.p50Ms).toBe(16);
  expect(summary.p95Ms).toBe(50);
  expect(summary.maxMs).toBe(100);
  expect(summary.avgMs).toBeCloseTo((56 * 16 + 250) / 60, 5);
  expect(summarizeFrameTimes([], 1000)).toEqual({ fps: 0, avgMs: 0, p50Ms: 0, p95Ms: 0, maxMs: 0 });
});
