import { ADAPTIVE_RESOLUTION, createResolutionGovernor, lowerPixelRatio, type ResolutionGovernor } from '../adaptive';

/** Feeds `seconds` of display frames `intervalMs` apart and returns the ratio after them. */
function run(governor: ResolutionGovernor, seconds: number, intervalMs: number, gpuMs?: number | null): number {
  for (let elapsed = 0; elapsed < seconds * 1000; elapsed += intervalMs) governor.frame(intervalMs, gpuMs);
  return governor.pixelRatio;
}

test('a slow window drops to the ratio whose pixels fit the target, at least a step', () => {
  // Half the target: half the pixels, the ratio times √0.5.
  expect(lowerPixelRatio(30, 1.5)).toBe(1.05);
  expect(lowerPixelRatio(47, 1.5)).toBe(1.3);
  expect(lowerPixelRatio(47, 0.8)).toBe(ADAPTIVE_RESOLUTION.minPixelRatio);
  expect(lowerPixelRatio(5, 1.5)).toBe(ADAPTIVE_RESOLUTION.minPixelRatio);
});

test('heavy frames lower the canvas within seconds and light ones bring it back a step at a time', () => {
  const governor = createResolutionGovernor(1.5);
  expect(run(governor, 6, 16.7)).toBe(1.5);
  expect(run(governor, 3, 33.3)).toBeLessThan(1.5);
  expect(run(governor, 6, 33.3)).toBeLessThanOrEqual(1.05);
  // Each rise waits out the hold after the last change, so the canvas does not bounce between sizes.
  const climb: number[] = [];
  for (let second = 0; second < 90; second++) climb.push(run(governor, 1, 16.7));
  expect(climb.at(-1)).toBe(1.5);
  const rises = climb.flatMap((ratio, second) => (second > 0 && ratio > climb[second - 1]! ? [second] : []));
  expect(rises.length).toBeGreaterThan(2);
  rises.slice(1).forEach((second, index) => expect(second - rises[index]!).toBeGreaterThanOrEqual(ADAPTIVE_RESOLUTION.holdSeconds));
});

test('a CPU-bound frame keeps its resolution and flags the CPU; a GPU-bound one drops even when slow from the start', () => {
  const cpu = createResolutionGovernor(1.5);
  expect(run(cpu, 8, 33.3, 6)).toBe(1.5);
  expect(cpu.cpuBound).toBe(true);
  run(cpu, 4, 16.7, 6);
  expect(cpu.cpuBound).toBe(false);
  const gpu = createResolutionGovernor(1.5);
  expect(run(gpu, 6, 33.3, 30)).toBeLessThan(1.2);
  expect(gpu.cpuBound).toBe(false);
});

test('with GPU timings it rises only when the larger canvas would still fit the frame', () => {
  const tight = createResolutionGovernor(1.5);
  const dropped = run(tight, 6, 33.3, 30);
  // At speed but with the GPU near the budget, a larger canvas would slow it again.
  expect(run(tight, 30, 16.7, 12)).toBe(dropped);
  const roomy = createResolutionGovernor(1.5);
  run(roomy, 6, 33.3, 30);
  expect(run(roomy, 30, 16.7, 4)).toBeGreaterThan(dropped);
});

test('frames right after the page shows again are ignored', () => {
  const governor = createResolutionGovernor(1.5);
  run(governor, 4, 16.7);
  governor.resume();
  expect(run(governor, 2.5, 50)).toBe(1.5);
});
