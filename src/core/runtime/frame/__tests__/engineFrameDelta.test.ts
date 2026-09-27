import { engineFrameDelta } from '../react/FrameSchedulerHost';

test('engine phases never run time backwards and drop stalls longer than a second', () => {
  expect(engineFrameDelta(1 / 60)).toBeCloseTo(1 / 60);
  expect(engineFrameDelta(-1771.5)).toBe(0);
  expect(engineFrameDelta(Number.NaN)).toBe(0);
  expect(engineFrameDelta(1772.1)).toBe(1);
});
